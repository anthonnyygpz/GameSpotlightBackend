const { validationResult } = require('express-validator');

/**
 * Middleware que extrae los errores de express-validator y responde 422
 * si hay alguno. Debe colocarse DESPUÉS de los validadores en la ruta.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    return next();
};

module.exports = validate;
