import { Request, Response } from "express";
import prisma from "../utils/database";
import { ImageProcessor, handleMulterError } from "../utils/fileupload";
import fs from 'fs-extra';

export class UserController {
    static async getProfile(req: Request, res: Response) {
        try {
            const { username } = req.params;

            const user = await prisma.user.findUnique({
                where: { username },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                    avatar: true,
                    title: true,
                    company: true,
                    location: true,
                    website: true,
                    githubUrl: true,
                    linkedinUrl: true,
                    twitterUrl: true,
                    portfolioUrl: true,
                    skills: true,
                    experience: true,
                    availability: true,
                    profileViews: true,
                    createdAt: true,
                    projects: {
                        where: { featured: true },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            technologies: true,
                            githubUrl: true,
                            liveUrl: true,
                            images: true,
                            status: true,
                            views: true,
                            likes: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 6
                    },
                    _count: {
                        select: {
                            projects: true,
                            reviewsGiven: true,
                            reviewsReceived: true
                        }
                    }
                }

            });
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'No user found with this username'
                });
            }

            if (req.user?.id !== user.id) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { profileViews: { increment: 1 } }
                });
            }

            return res.json({ user });
        }
        catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                error: 'Failed to get profile',
                message: 'Internal server error'
            });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const {
                firstName,
                lastName,
                bio,
                title,
                company,
                location,
                website,
                githubUrl,
                linkedinUrl,
                twitterUrl,
                portfolioUrl,
                skills,
                experience,
                availability
            } = req.body;

            const updatedUser = await prisma.user.update({
                where: { id : userId },
                data: {
                    firstName,
                    lastName,
                    bio,
                    title,
                    company,
                    location,
                    website,
                    githubUrl,
                    linkedinUrl,
                    twitterUrl,
                    portfolioUrl,
                    skills: Array.isArray(skills) ? skills : [],
                    experience,
                    availability,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    bio: true,
                    avatar: true,
                    title: true,
                    company: true,
                    location: true,
                    website: true,
                    githubUrl: true,
                    linkedinUrl: true,
                    twitterUrl: true,
                    portfolioUrl: true,
                    skills: true,
                    experience: true,
                    availability: true,
                    updatedAt: true
                }
            });

            return res.json({
                message: 'Profile updated successfully',
                user: updatedUser
            })
        }
        catch (error) {
            console.error('Update profile error: ', error);
            res.status(500).json({
                error: 'Failed to update profile',
                message: 'Internal server error'
            });
        }
    }

    static async uploadAvatar(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            if (!req.file) {
                return res.status(400).json({
                    error: 'No file Provided',
                    message: 'Please select an image file to upload'
                });
            }

            const processedImagePath = await ImageProcessor.processAvatar(req.file.path);
            const publicUrl = ImageProcessor.getPublicUrl(processedImagePath);

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatar: publicUrl },
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            });

            return res.json({
                message: 'Avatar uploaded successfully',
                avatar: publicUrl,
                user: updatedUser
            });
        }
        catch (error) {
            console.error('Upload avatar error:', error);

            if (req.file) {
                fs.remove(req.file.path).catch(console.error);
            }

            const errorMessage = handleMulterError(error);
            return res.status(500).json({
                error: 'Failed to upload avatar',
                message: errorMessage
            });
        }
    }

    static async getDashboard(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: { id : userId },
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    profileViews: true,
                    projects: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            views: true,
                            likes: true,
                            createdAt: true
                        },
                        orderBy: { updatedAt: 'desc' }
                    },
                    reviewsGiven: {
                        select: {
                            id: true,
                            rating: true,
                            project: {
                                select: { title: true }
                            },
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    reviewsReceived: {
                        select: {
                            id: true,
                            rating: true,
                            comment: true,
                            reviewer: {
                                select: {
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true
                                }
                            },
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    },
                    _count: {
                        select: {
                            projects: true,
                            reviewsGiven: true,
                            reviewsReceived: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User account not found'
                });
            }

            return res.json({
                dashboard: user
            });
        }
        catch (error) {
            console.error('Get dashboard error:', error);
            return res.status(500).json({
                error: 'Failed to get dashboard',
                message: 'Internal server error'
            });
        }
    }
}