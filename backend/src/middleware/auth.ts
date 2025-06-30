import {Request , Response, NextFunction } from 'express';
import { JWTUtill } from '../utils/jwt';
import prisma from '../utils/database';


declare global {
    namespace Express {
        interface Request {
            user? : {
                id: string;
                email: string;
                username: string;
                verified: boolean;
            };
        }
    }
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1] //Bearer Token

        if (!token){
            return res.status(401).json({
                error: 'Access Denied',
                message: 'No token provided'
            });
        }

        const decoded = JWTUtill.verifyAccessToken(token);
        if (!decoded) {
            return res.status(401).json({
                error: 'Acces denied',
                message: 'Invalid or Expired token'
            });
        }

        //Fetch fresh user data to ensure user still exists and is active
        const user = await prisma.user.findUnique({
            where : {id: decoded.userId},
            select : {
                id: true,
                email: true,
                username: true,
                verified: true
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    }
    catch (error){
        console.error('Authentication failed', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: 'Internal server error'
        });
    }
};

export const requireVerification = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user?.verified){
        return res.status(403).json({
            error: 'Account verification required',
            message: 'Please verify your email address to access this resource'
        });
    }
    next();
};