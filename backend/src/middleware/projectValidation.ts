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

const handleValidationResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Project validation errors:', errors.array());
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

export const validateProject = [
    body('title')
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('Title is required and must be 1-100 characters'),

    body('description')
        .optional()
        .isLength({ max: 200 })
        .trim()
        .withMessage('Description must be less than 200 characters'),

    body('longDescription')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Long description must be less than 2000 characters'),

    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array')
        .custom((features) => {
            if (features && features.length > 10) {
                throw new Error('Maximum 10 features allowed');
            }
            return true;
        }),

    body('challenges')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Challenges must be less than 1000 characters'),

    body('learnings')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Learnings must be less than 1000 characters'),

    body('githubUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('GitHub URL must be a valid URL'),

    body('liveUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Live URL must be a valid URL'),

    body('videoUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Video URL must be a valid URL'),

    body('category')
        .optional()
        .isIn(['WEB_APP', 'MOBILE_APP', 'API', 'LIBRARY', 'TOOL', 'GAME', 'OTHER'])
        .withMessage('Invalid category'),

    body('status')
        .optional()
        .isIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'])
        .withMessage('Invalid status'),

    body('technologies')
        .optional()
        .isArray()
        .withMessage('Technologies must be an array')
        .custom((technologies) => {
            if (!technologies || technologies.length === 0) {
                throw new Error('At least one technology is required');
            }
            if (technologies.length > 15) {
                throw new Error('Maximum 15 technologies allowed');
            }
            return true;
        }),

    handleValidationResult
];

export const validateProjectUpdate = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 100 })
        .trim()
        .withMessage('Title must be 1-100 characters'),

    body('description')
        .optional()
        .isLength({ max: 200 })
        .trim()
        .withMessage('Description must be less than 200 characters'),

    body('longDescription')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Long description must be less than 2000 characters'),

    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array')
        .custom((features) => {
            if (features && features.length > 10) {
                throw new Error('Maximum 10 features allowed');
            }
            return true;
        }),

    body('challenges')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Challenges must be less than 1000 characters'),

    body('learnings')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Learnings must be less than 1000 characters'),

    body('githubUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('GitHub URL must be a valid URL'),

    body('liveUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Live URL must be a valid URL'),

    body('videoUrl')
        .optional()
        .custom(urlValidator)
        .withMessage('Video URL must be a valid URL'),

    body('category')
        .optional()
        .isIn(['WEB_APP', 'MOBILE_APP', 'API', 'LIBRARY', 'TOOL', 'GAME', 'OTHER'])
        .withMessage('Invalid category'),

    body('status')
        .optional()
        .isIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'MAINTENANCE', 'ARCHIVED'])
        .withMessage('Invalid status'),

    body('technologies')
        .optional()
        .isArray()
        .withMessage('Technologies must be an array')
        .custom((technologies) => {
            if (technologies && technologies.length > 15) {
                throw new Error('Maximum 15 technologies allowed');
            }
            return true;
        }),

    body('featured')
        .optional()
        .isBoolean()
        .withMessage('Featured must be a boolean'),

    handleValidationResult
];