import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateProject = [
    body('title')
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('Title is required and must be 1-100 characters'),

    body('description')
        .isLength({ min: 10, max: 500 })
        .trim()
        .withMessage('Description must be 10-500 characters'),

    body('longDescription')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Long description must be less than 5000 characters'),

    body('githubUrl')
        .optional()
        .isURL()
        .withMessage('GitHub URL must be a valid URL'),

    body('liveUrl')
        .optional()
        .isURL()
        .withMessage('Live URL must be a valid URL'),

    body('videoUrl')
        .optional()
        .isURL()
        .withMessage('Video URL must be a valid URL'),

    body('category')
        .optional()
        .isIn(['WEB_APP', 'Mobile App', 'Desktop App', 'API', 'Library', 'Tool', 'Game', 'Other'])
        .withMessage('Invalid category'),

    body('status')
        .optional()
        .isIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'])
        .withMessage('Invalid status'),

    body('technologies')
        .optional()
        .isArray()
        .withMessage('Technologies must be an array')
        .custom((value) => {
            if (Array.isArray(value) && value.length > 15) {
                throw new Error('Maximum 15 technologies allowed');
            }
            return true;
        }),

    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array')
        .custom((value) => {
            if (Array.isArray(value) && value.length > 10) {
                throw new Error('Maximum 10 features allowed');
            }
            return true;
        }),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Project validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

export const validateProjectUpdate = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('Title must be 1-100 characters'),

    body('description')
        .optional()
        .isLength({ min: 10, max: 500 })
        .trim()
        .withMessage('Description must be 10-500 characters'),

    body('longDescription')
        .optional()
        .isLength({ max: 5000 })
        .withMessage('Long description must be less than 5000 characters'),

    body('githubUrl')
        .optional()
        .isURL()
        .withMessage('GitHub URL must be a valid URL'),

    body('liveUrl')
        .optional()
        .isURL()
        .withMessage('Live URL must be a valid URL'),

    body('videoUrl')
        .optional()
        .isURL()
        .withMessage('Video URL must be a valid URL'),

    body('category')
        .optional()
        .isIn(['Web App', 'Mobile App', 'Desktop App', 'API', 'Library', 'Tool', 'Game', 'Other'])
        .withMessage('Invalid category'),

    body('status')
        .optional()
        .isIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'])
        .withMessage('Invalid status'),

    body('technologies')
        .optional()
        .isArray()
        .withMessage('Technologies must be an array')
        .custom((value) => {
            if (Array.isArray(value) && value.length > 15) {
                throw new Error('Maximum 15 technologies allowed');
            }
            return true;
        }),

    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array')
        .custom((value) => {
            if (Array.isArray(value) && value.length > 10) {
                throw new Error('Maximum 10 features allowed');
            }
            return true;
        }),

    body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Project update validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];