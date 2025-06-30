import bcrypt from 'bcryptjs';
import { error } from 'console';

export class PasswordService {
    private static saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

    static async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return await bcrypt.hash(password, salt);
        }
        catch (error) {
            throw new Error('Password hashing failed');
        }
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hashedPassword);
        }
        catch (error) {
            throw new Error('Password comparision failed');
        }
    }

    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }


        return {
            isValid: errors.length === 0,
            errors
        };
    }
}