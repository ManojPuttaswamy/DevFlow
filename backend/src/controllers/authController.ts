import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/database';
import { PasswordService } from '../services/passwordService';
import { JWTUtill } from '../utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';
import { error } from 'console';
import { token } from 'morgan';


export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const { email, username, password, firstName, lastName }: RegisterRequest = req.body;

            const passwordValidation = PasswordService.validatePasswordStrength(password);
            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    error: 'Weak Password',
                    details: passwordValidation.errors
                });
            }


            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email },
                        { username }
                    ]
                }
            });

            if (existingUser) {
                const field = existingUser.email === email ? 'email' : 'username';
                return res.status(409).json({
                    error: 'User already exist',
                    message: 'A user with this ${field} already exisits'
                });
            }

            const hashedPassword = await PasswordService.hashPassword(password);

            const user = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    verified: false
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    verified: true,
                    createdAt: true
                }
            });

            const accessToken = JWTUtill.generateAceessToken({
                userId: user.id,
                email: user.email
            });

            const refreshToken = JWTUtill.generateRefreshToken({
                userId: user.id
            });

            const response: AuthResponse = {
                user,
                token: accessToken
            };

            //set refresh token as httpOnly cookie

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            return res.status(201).json({
                message: 'User registered successfully',
                ...response
            });
        }
        catch (error) {
            console.error('Registrartion error: ', error);
            return res.status(500).json({
                error: 'Registration failed',
                message: 'Internal Server Error'
            });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password }: LoginRequest = req.body;

            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    password: true,
                    verified: true,
                }
            });

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                });
            }

            const isPasswordVerified = PasswordService.comparePassword(password, user.password);
            if (!isPasswordVerified) {
                return res.status(401).json({
                    error: 'Invalid credentials',
                    message: 'Email or password is incorrect'
                });
            }

            const aceessToken = JWTUtill.generateAceessToken({
                userId: user.id,
                email: user.email
            });

            const refreshToken = JWTUtill.generateRefreshToken({
                userId: user.id
            });

            const { password: _, ...userResponse } = user;

            const response: AuthResponse = {
                user: userResponse,
                token: aceessToken
            };

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 100 // 7 days
            });

            return res.json({
                message: 'Login successful',
                ...response
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                error: 'Login failed',
                message: 'Internal server error'
            });
        }
    }

    static async refreshToken(req: Request, res: Response) {
        try {
            const { refreshToken } = req.cookies;
            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Access denied',
                    message: 'No refresh token provided'
                });
            }
            const decoded = JWTUtill.verifyRefreshToken(refreshToken);
            if (!decoded) {
                return res.status(401).json({
                    error: 'Access denied',
                    message: 'Invalid refresh token or token has expired.'
                })
            }

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
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

            const newAccessToken = JWTUtill.generateAceessToken({
                userId: user.id,
                email: user.email
            });

            return res.json({
                user,
                token: newAccessToken
            })
        }
        catch (error) {
            console.error('Token refresh error: ', error);
            return res.status(500).json({
                error: 'Token refresh failed',
                message: 'Internal server error'
            })
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            res.clearCookie('refreshToken');
            return res.json({
                message: 'Logot Sucessful'
            });
        }
        catch (error) {
            console.error('Logout error: ', error);
            return res.status(500).json({
                error: 'Logot failed',
                message: 'Internal server error'
            });
        }
    }

    static async getProfile(req: Request, res: Response) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user!.id },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                    avatar: true,
                    skills: true,
                    githubUrl: true,
                    linkedinUrl: true,
                    portfolioUrl: true,
                    location: true,
                    verified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return res.json({ user });
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                error: 'Failed to get profile',
                message: 'Internal server error'
            });
        }
    }


}