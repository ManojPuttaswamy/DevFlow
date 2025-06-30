import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';


export const ValidateRegistration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('username')
        .isLength({ min: 3, max: 30 })
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username must be 3 - 30 characters and contain only letters, numbers, hyphens, and underscores'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),

    body('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('First name must be 1-50 characters'),

    body('lastName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .trim()
        .withMessage('Last name must be 1-50 characters'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];