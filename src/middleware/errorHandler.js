/**
 * Middleware global de manejo de errores.
 * Debe ser registrado ÚLTIMO en Express (después de todas las rutas).
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Log detallado en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        console.error('[ERROR]', err.stack || err.message);
    }

    // Error de duplicado MySQL (ER_DUP_ENTRY)
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'El recurso ya existe (duplicado)',
            code: 'DUPLICATE_ENTRY',
        });
    }

    // Error de FK MySQL
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida (foreign key)',
            code: 'INVALID_REFERENCE',
        });
    }

    // Error de token JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            code: 'INVALID_TOKEN',
        });
    }

    // Error genérico del servidor
    const status = err.statusCode || err.status || 500;
    return res.status(status).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        code: err.code || 'INTERNAL_ERROR',
    });
};

module.exports = errorHandler;
