import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateReview = [
    body('projectId')
        .isString()
        .isLength({ min: 1 })
        .withMessage('Project ID is required'),

    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),

    body('comment')
        .optional()
        .isLength({ min: 20, max: 2000 })
        .trim()
        .withMessage('Comment must be between 20 and 2000 characters'),

    body('codeQuality')
        .isInt({ min: 1, max: 5 })
        .withMessage('Code quality rating must be between 1 and 5'),

    body('documentation')
        .isInt({ min: 1, max: 5 })
        .withMessage('Documentation rating must be between 1 and 5'),

    body('userExperience')
        .isInt({ min: 1, max: 5 })
        .withMessage('User experience rating must be between 1 and 5'),

    body('innovation')
        .isInt({ min: 1, max: 5 })
        .withMessage('Innovation rating must be between 1 and 5'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Review validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

export const validateReviewStatus = [
    body('status')
        .isIn(['APPROVED', 'REJECTED'])
        .withMessage('Status must be either APPROVED or REJECTED'),

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