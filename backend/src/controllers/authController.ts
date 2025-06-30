import {Request, Response, NextFunction} from 'express';
import prisma from '../utils/database';
import { PasswordService } from '../services/passwordService';
import { JWTUtill } from '../utils/jwt';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/auth';


export class AuthController {
    static async register(req: Request, res:Response) {
        try{
            const { email , username, password, firstname, lastname } : RegisterRequest = req.body;

            const passwordValidation = PasswordService.validatePasswordStrength(password);
            if(!passwordValidation.isValid){
                return res.status(400).json({
                    error: 'Weak Password',
                    details: passwordValidation.errors
                });
            }


            const existingUser = await prisma.findFirst({
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
                    firstname: firstname || null,
                    lastname: lastname || null,
                    verified: false
                },
                select : {
                    id : true,
                    email: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    verified : true,
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

            const response : AuthResponse = {
                user,
                token : accessToken
            };

            //set refresh token as httpOnly cookie

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                message: 'User registered successfully',
                ...response
              });
        }
        catch (error){
            console.error('Registrartion error: ', error);
            res.status(500).json({
                error: 'Registration failed',
                message: 'Internal Server Error'
            });
        }
    }

    
}