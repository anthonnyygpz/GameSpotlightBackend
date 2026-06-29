const jwt = require('jsonwebtoken');

/**
 * Verifica el JWT enviado en el header Authorization: Bearer <token>.
 * Adjunta req.userId y req.userRole al request.
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: 'Token no proporcionado' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(403).json({ success: false, message: 'Formato de token inválido' });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            const message = err.name === 'TokenExpiredError'
                ? 'Token expirado'
                : 'Token inválido';
            return res.status(401).json({ success: false, message });
        }
        req.userId   = decoded.userId;
        req.userRole = decoded.role || 'viewer';
        return next();
    });
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
