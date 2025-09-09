import { Request, Response, NextFunction } from "express";
import { redis } from '../utils/redis';
import { stat } from "fs";

interface RequestCacheOptions {
    ttl: number;
    keyGenerator?: (req: Request) => string;
    skipCache?: (req: Request) => boolean;
}

export const requestCache = (options: RequestCacheOptions) => {
    const { ttl, keyGenerator, skipCache } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        if(req.method !== 'GET' || (skipCache && skipCache(req))) {
            return next();
        }

        //Generate cache key
        const defaultKeyGenerator = (req: Request) => `cache: ${req.originalUrl}:${req.user?.id || 'anonymous'}`;

        const cacheKey = keyGenerator ? keyGenerator(req) : defaultKeyGenerator(req);

        try{
            //try to get cached response
            const cachedResponse = await redis.get(cacheKey);
            if (cachedResponse) {
                const parsed = JSON.parse(cachedResponse);
                return res.status(parsed.status).json(parsed.data);
            }

            const originalJson = res.json;
            res.json = function(data: any) {
                const responseData = {
                    status: res.statusCode,
                    data: data
                };

                redis.set(cacheKey, JSON.stringify(responseData), ttl).catch(console.error);

                return originalJson.call(this, data);
            }
            next();
        }
        catch (error) {
            console.error('Request cache error: ', error);
            next();
        }
    };
};