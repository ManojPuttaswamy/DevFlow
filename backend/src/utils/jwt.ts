import jwt, { type SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

export class JWTUtill {
  private static accessSecret = process.env.JWT_SECRET!;
  private static refreshSecret = process.env.JWT_REFRESH_SECRET!;

  private static accessExpiresIn = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];
  private static refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  static generateAceessToken(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
      issuer: 'devflow-api',
      audience: 'devflow-app',
    });
  }

  static generateRefreshToken(payload: { userId: string }): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'devflow-api',
      audience: 'devflow-app',
    });
  }

  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.accessSecret, {
        issuer: 'devflow-api',
        audience: 'devflow-app',
      }) as JWTPayload;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'devflow-api',
        audience: 'devflow-app',
      }) as { userId: string };
    } catch {
      return null;
    }
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }
}