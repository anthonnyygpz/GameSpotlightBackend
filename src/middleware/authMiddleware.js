const jwt = require('jsonwebtoken');
const db  = require('../config/db');

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>.
 * Además de la firma y expiración, valida que la sesión siga activa en DB
 * (para que el logout invalide el token correctamente).
 * Adjunta req.userId y req.userRole al request.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: 'Token no proporcionado' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).json({ success: false, message: 'Formato de token inválido' });
    }

    const token = parts[1];

    // 1) Verificar firma y expiración del JWT
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
        return res.status(401).json({ success: false, message });
    }

    // 2) Verificar que la sesión siga activa en DB (invalida tras logout)
    try {
        const [sessions] = await db.execute(
            `SELECT session_id FROM sessions WHERE token = ? AND active = TRUE LIMIT 1`,
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Sesión inválida o cerrada. Inicia sesión nuevamente.',
            });
        }
    } catch (dbErr) {
        return next(dbErr);
    }

    // 3) Actualizar last_login del usuario en cada petición autenticada
    //    Esto garantiza que el token de registro también actualice last_login
    try {
        await db.execute(
            `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
            [decoded.userId]
        );
    } catch (_) {
        // No fatal: continuar aunque falle el update de last_login
    }

    req.userId   = decoded.userId;
    req.userRole = decoded.role || 'viewer';
    return next();
};

/**
 * Fábrica de middleware que exige un rol específico.
 * Debe usarse DESPUÉS de verifyToken.
 * @param {string} role - Rol requerido: 'admin' | 'editor' | 'viewer'
 */
const requireRole = (role) => (req, res, next) => {
    const hierarchy = { admin: 3, editor: 2, viewer: 1 };
    if ((hierarchy[req.userRole] || 0) < (hierarchy[role] || 0)) {
        return res.status(403).json({
            success: false,
            message: `Se requiere rol '${role}' o superior`,
        });
    }
    return next();
};

module.exports = { verifyToken, requireRole };
