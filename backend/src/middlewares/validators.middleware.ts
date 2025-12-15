import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export const registerValidation: ValidationChain[] = [
    body('username').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email').isEmail().withMessage('Debe proporcionar un email válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const loginValidation: ValidationChain[] = [
    body('username').notEmpty().withMessage('El nombre de usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
];

export const assetValidation: ValidationChain[] = [
    body('category_id').isInt().withMessage('ID de categoría inválido'),
    body('marca').notEmpty().withMessage('La marca es requerida'),
    body('modelo').notEmpty().withMessage('El modelo es requerido'),
    body('codigo_inventario').notEmpty().withMessage('El código de inventario es requerido'),
];

export const userUpdateValidation: ValidationChain[] = [
    body('role').optional().isIn(['admin', 'user']).withMessage('El rol debe ser admin o user'),
];

export const validateRequest = validate;
