import { Request, Response } from "express";
import prisma from "../utils/database";
import { ImageProcessor, handleMulterError } from "../utils/fileupload";
import { getFileUrl, deleteFile, processUploadedImage } from '../utils/fileupload';
import path from 'path';
import fs from 'fs-extra';

export class UserController {
    static async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
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
                    verified: true,
                    profileViews: true,
                    lastActive: true,
                    createdAt: true,
                    updatedAt: true,
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
                    message: 'User profile not found'
                });
            }

            const profileFields = [
                user.firstName, user.lastName, user.bio, user.title,
                user.location, user.githubUrl, user.skills?.length
            ];
            const completedFields = profileFields.filter(field =>
                field !== null && field !== undefined && field !== ''
            ).length;
            const profileCompleteness = Math.round((completedFields / profileFields.length) * 100);

            return res.json({
                user: {
                    ...user,
                    profileCompleteness
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                error: 'Failed to get profile',
                message: 'Internal server error'
            });
        }
    }

    static async getPublicProfile(req: Request, res: Response) {
        try {
            const { username } = req.params;
            if (!username || username.length < 3 || username.length > 30) {
                return res.status(400).json({
                    error: 'Invalid username',
                    message: 'Username format is invalid'
                });
            }

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
                user.profileViews += 1;
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
                where: { id: userId },
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
                    verified: true,
                    profileViews: true,
                    createdAt: true,
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
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { avatar: true }
            });

            const { fileUrl } = await processUploadedImage(req.file, 'avatar');


            if (currentUser?.avatar) {
                const oldFilename = path.basename(currentUser.avatar);
                const oldFilePath = path.join(process.cwd(), 'uploads', 'avatars', oldFilename);
                deleteFile(oldFilePath);
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatar: fileUrl },
                select: {
                    id: true,
                    username: true,
                    avatar: true
                }
            });

            return res.json({
                message: 'Avatar uploaded successfully',
                avatar: fileUrl,
                user: updatedUser
            });
        }
        catch (error) {
            console.error('Upload avatar error:', error);

            if (req.file) {
                deleteFile(req.file.path);
            }

            return res.status(500).json({
                error: 'Failed to upload avatar',
                message: 'Internal server error'
            });
        }
    }

    static async getDashboard(req: Request, res: Response) {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
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

    static async searchUsers(req: Request, res: Response) {
        try {
            const { q, skills, location, page = 1, limit = 12 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const where: any = {};

            if (q && typeof q === 'string') {
                where.OR = [
                    { username: { contains: q, mode: 'insensitive' } },
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { bio: { contains: q, mode: 'insensitive' } },
                    { title: { contains: q, mode: 'insensitive' } }
                ];
            }

            if (skills && typeof skills === 'string') {
                const skillsArray = skills.split(',').map(s => s.trim());
                where.skills = {
                    hasSome: skillsArray
                };
            }

            if (location && typeof location === 'string') {
                where.location = { contains: location, mode: 'insensitive' };
            }

            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
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
                        skills: true,
                        availability: true,
                        profileViews: true,
                        _count: {
                            select: {
                                projects: true,
                                reviewsGiven: true
                            }
                        }
                    },
                    orderBy: [
                        { profileViews: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: Number(limit)
                }),
                prisma.user.count({ where })
            ]);

            return res.json({
                users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            console.error('Search users error:', error);
            return res.status(500).json({
                error: 'Failed to search users',
                message: 'Internal server error'
            });
        }
    }
}