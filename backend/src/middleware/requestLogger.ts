import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    // Don't log health checks to reduce noise
    if (req.url === '/health' || req.url === '/nginx-health') {
      return;
    }
    const duration = Date.now() - start;

    logger.logRequest(req, res, duration);
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err, {
    method: req.method,
    url: req.url,
    body: req.body,
    ip: req.ip
  });

  next(err);
};