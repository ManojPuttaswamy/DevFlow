import { Request, Response, NextFunction } from 'express';

export const parseFormDataArrays = (arrayFields: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body) {
            arrayFields.forEach(field => {
                if (req.body[field] && typeof req.body[field] === 'string') {
                    try {
                        const parsed = JSON.parse(req.body[field]);
                        if (Array.isArray(parsed)) {
                            req.body[field] = parsed;
                        }
                    } catch (error) {
                        // If parsing fails, leave as string - validation will catch it
                        console.warn(`Failed to parse ${field} as JSON:`, error);
                    }
                }
            });
        }
        next();
    };
};

export const parseProjectFormData = parseFormDataArrays(['technologies', 'features']);