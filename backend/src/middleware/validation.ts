import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const urlValidator = (value: string) => {
    if (value && value !== '') {
        try {
            new URL(value);
            return true;
        } catch {
            throw new Error('Must be a valid URL');
        }
    }
    return true;
};

export const validateProfileUpdate = [
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

    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters'),

    body('title')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Title must be less than 100 characters'),

    body('company')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Company must be less than 100 characters'),

    body('location')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Location must be less than 100 characters'),

    body('website')
        .optional()
        .custom(urlValidator)
        .withMessage('Website must be a valid URL'),

    body('githubUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('GitHub URL must be a valid URL'),

    body('linkedinUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('LinkedIn URL must be a valid URL'),

    body('twitterUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Twitter URL must be a valid URL'),

    body('portfolioUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Portfolio URL must be a valid URL'),

    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array')
        .custom((skills) => {
            if (skills && skills.length > 20) {
                throw new Error('Maximum 20 skills allowed');
            }
            return true;
        }),

    body('experience')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Experience must be less than 50 characters'),

    body('availability')
        .optional()
        .isIn(['AVAILABLE', 'BUSY', 'NOT_AVAILABLE'])
        .withMessage('Invalid availability status'),

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