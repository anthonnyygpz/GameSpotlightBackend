const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const { body } = require('express-validator');

// ─── Validadores reutilizables ────────────────────────────────────────────────

exports.registerValidators = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .notEmpty().withMessage('El correo es obligatorio')
        .isEmail().withMessage('El correo no es válido')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

exports.loginValidators = [
    body('identifier')
        .trim()
        .notEmpty().withMessage('El correo o nombre de usuario es obligatorio'),
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
];

// ─── Registro ─────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, country } = req.body;

        // Verificar duplicado de email
        const [existing] = await db.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El correo ya está registrado',
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Insertar usuario con last_login inicial (UUID generado por MySQL)
        await db.execute(
            `INSERT INTO users (user_id, name, email, password_hash, country, last_login)
             VALUES (UUID(), ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [name, email, passwordHash, country || null]
        );

        // Obtener el usuario recién creado
        const [rows] = await db.execute(
            'SELECT user_id, name, email, country, registered_at FROM users WHERE email = ?',
            [email]
        );
        const user = rows[0];

        // Crear configuración por defecto
        await db.execute(
            `INSERT INTO user_settings (settings_id, user_id) VALUES (UUID(), ?)`,
            [user.user_id]
        );

        // Asignar rol 'viewer' por defecto
        const [roles] = await db.execute(
            "SELECT role_id FROM roles WHERE name = 'viewer' LIMIT 1"
        );
        if (roles.length > 0) {
            await db.execute(
                `INSERT INTO user_roles (id, user_id, role_id) VALUES (UUID(), ?, ?)`,
                [user.user_id, roles[0].role_id]
            );
        }

        const token = jwt.sign(
            { userId: user.user_id, role: 'viewer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Registrar sesión
        await db.execute(
            `INSERT INTO sessions (session_id, user_id, token, ip_address, user_agent)
             VALUES (UUID(), ?, ?, ?, ?)`,
            [user.user_id, token, req.ip, req.headers['user-agent'] || null]
        );

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                userId:      user.user_id,
                name:        user.name,
                email:       user.email,
                country:     user.country,
                registeredAt: user.registered_at,
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        // Buscar por email o nombre
        const [users] = await db.execute(
            `SELECT u.user_id, u.name, u.email, u.password_hash, u.avatar_url,
                    u.country, u.active, r.name AS role
             FROM users u
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r       ON ur.role_id = r.role_id
             WHERE u.email = ? OR u.name = ?
             LIMIT 1`,
            [identifier, identifier]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = users[0];

        if (!user.active) {
            return res.status(403).json({ success: false, message: 'Cuenta desactivada' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Actualizar last_login
        await db.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?',
            [user.user_id]
        );

        const role  = user.role || 'viewer';
        const token = jwt.sign(
            { userId: user.user_id, role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Registrar sesión
        await db.execute(
            `INSERT INTO sessions (session_id, user_id, token, ip_address, user_agent)
             VALUES (UUID(), ?, ?, ?, ?)`,
            [user.user_id, token, req.ip, req.headers['user-agent'] || null]
        );

        return res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                userId:    user.user_id,
                name:      user.name,
                email:     user.email,
                avatarUrl: user.avatar_url,
                country:   user.country,
                role,
            },
        });
    } catch (err) {
        return next(err);
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

exports.logout = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.split(' ')[1];

        if (token) {
            await db.execute(
                `UPDATE sessions SET active = FALSE, ended_at = CURRENT_TIMESTAMP
                 WHERE token = ?`,
                [token]
            );
        }

        return res.status(200).json({ success: true, message: 'Sesión cerrada exitosamente' });
    } catch (err) {
        return next(err);
    }
};

// ─── Perfil propio ────────────────────────────────────────────────────────────

exports.getProfile = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT u.user_id, u.name, u.email, u.avatar_url, u.country,
                    u.registered_at, u.last_login,
                    us.theme, us.email_notifications, us.push_notifications,
                    us.profile_privacy, l.code AS language_code, l.name AS language_name,
                    r.name AS role
             FROM users u
             LEFT JOIN user_settings us ON u.user_id = us.user_id
             LEFT JOIN languages     l  ON us.language_id = l.language_id
             LEFT JOIN user_roles    ur ON u.user_id = ur.user_id
             LEFT JOIN roles         r  ON ur.role_id = r.role_id
             WHERE u.user_id = ?`,
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        return next(err);
    }
};
