import { channel } from "diagnostics_channel";
import { Request, Response, NextFunction } from "express";

interface CacheOptions {
    duration: number;
    vary?: string[]
}

export const cache = (options: CacheOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
            return next();
        }
        const {duration, vary= []} = options;
        res.set({
            'Cache-Control': `public, max-age=${duration}`,
            'Vary': vary.join(', '),
            'ETag': `"${Date.now()}"`
        });
        next();
    };
};


//Static asset caching
export const staticCache = cache({
    duration: 86400, //24 hrs
    vary: ['Accept-Encoding']
});

//public data caching

export const publicCache = cache({
    duration: 3600, // 1hr
    vary: ['Accept-Encoding']
});

//api response caching

export const apiCache = cache({
    duration: 300, // 5mins
    vary: ['Authorization','Accept-Encoding']
})