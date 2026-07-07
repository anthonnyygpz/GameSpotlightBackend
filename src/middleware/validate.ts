import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware que extrae los errores de express-validator y responde 422
 * si hay alguno. Debe colocarse DESPUÉS de los validadores en la ruta.
 */
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(e => ({
        field: (e as { path?: string }).path ?? 'unknown',
        message: e.msg as string,
      })),
    });
    return;
  }
  next();
};

export default validate;
