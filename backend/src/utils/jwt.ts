import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';


export class JWTUtill {
    private static accessSecret = process.env.JWT_SECRET!;
    private static refreshSecret = process.env.JWT_REFRESH_SECRET!;
    private static accessExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    private static refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';


    static generateAceessToken ( payload: {userId : string}) : string {
        return jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiresIn,
            issuer: 'devflow-api',
            audience : 'devflow-app'
        });
    }

    static generateRefreshToken ( payload: {userId : string}) : string {
        return jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiresIn,
            issuer: 'devflow-api',
            audience : 'devflow-app'
        });
    }

    static verifyAccessToken (token: string) : JWTPayload | null {
        try {
            return jwt.verify(token, this.accessSecret, {
                issuer: 'devflow-api',
                audience: 'devflow-app'
            }) as JWTPayload;
        }
        catch(error) {
            return null;
        }
    }

    static verifyRefreshToken (token: string) : {userId : string} | null {
        try {
            return jwt.verify(token, this.refreshSecret, {
                issuer: 'devflow-api',
                audience: 'devflow-app'
            }) as {userId: string};
        }
        catch(error) {
            return null;
        }
    }

    static decodeToken (token: string) : any {
        try {
            return jwt.decode(token);
        }
        catch (error){
            return null;
        }
    }
}


