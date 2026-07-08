import { body } from 'express-validator';

export const registerValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().notEmpty().isEmail().withMessage('El correo no es válido'),
  body('password').notEmpty().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

export const loginValidators = [
  body('identifier').trim().notEmpty().withMessage('El correo o nombre de usuario es obligatorio'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];
