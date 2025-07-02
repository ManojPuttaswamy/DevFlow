import { Request, Response } from 'express';
import prisma from '../utils/database';
import { ImageProcessor, handleMulterError } from '../utils/fileupload';
import fs from 'fs-extra';
import { compare } from 'bcryptjs';
import path from 'path';

export class ProjectController {
    static async getProjects(req: Request, res: Response) {
        try {

            const {
                page = '1',
                limit = '12',
                category,
                technology,
                status,
                search,
                featured,
                author
            } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = {};

            if (category) {
                where.category = category;
            }
            if (technology) {
                where.technologies = {
                    has: technology
                };
            }
            if (status) {
                where.status = status;
            }
            if (featured === 'true') {
                where.featured = true;
            }
            if (author) {
                where.author = {
                    username: author
                };
            }
            if (search) {
                where.OR = [
                    { title: { contains: search as string, mode: 'insensitive' } },
                    { description: { contains: search as string, mode: 'insensitive' } },
                    { technologies: { has: search as string } }
                ];
            }

            const [projects, total] = await Promise.all([
                prisma.project.findMany({
                    where,
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        technologies: true,
                        category: true,
                        status: true,
                        githubUrl: true,
                        liveUrl: true,
                        images: true,
                        views: true,
                        likes: true,
                        featured: true,
                        createdAt: true,
                        updatedAt: true,
                        author: {
                            select: {
                                username: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        },
                        _count: {
                            select: { reviews: true }
                        }
                    },
                    orderBy: [
                        { featured: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: limitNum
                }),
                prisma.project.count({ where })
            ]);

            const totalPages = Math.ceil(total / limitNum);

            return res.json({
                projects,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            })

        }
        catch (error) {
            console.error('Get projects error:', error);
            return res.status(500).json({
                error: 'Failed to get projects',
                message: 'Internal server error'
            });
        }
    }

    static async getProject(req: Request, res: Response) {
        try {

            const { id } = req.params;

            const project = await prisma.project.findUnique({
                where: { id },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            title: true,
                            company: true
                        }
                    },
                    reviews: {
                        include: {
                            reviewer: {
                                select: {
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: { reviews: true }
                    }


                }
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }
            if (req.user?.id !== project.authorId) {
                await prisma.project.update({
                    where: { id },
                    data: { views: { increment: 1 } }
                });
                project.views += 1;
            }

            return res.json({ project });

        }
        catch (error) {
            console.error('Get project error:', error);
            return res.status(500).json({
                error: 'Failed to get project',
                message: 'Internal server error'
            });

        }
    }

    static async createProject(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const {
                title,
                description,
                longDescription,
                features,
                challenges,
                learnings,
                githubUrl,
                liveUrl,
                videoUrl,
                technologies,
                category,
                status = 'IN_PROGRESS',
                githubRepo
            } = req.body;

            if (!title || !description) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Title and description are required'
                });
            }

            let imageUrls: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    try {
                        const processedImagePath = await ImageProcessor.processProjectImage(file.path);
                        const publicUrl = ImageProcessor.getPublicUrl(processedImagePath);
                        imageUrls.push(publicUrl);
                    } catch (error) {
                        console.error('Error processing image:', error);
                        fs.remove(file.path).catch(console.error);
                    }
                }
            }

            const project = await prisma.project.create({
                data: {
                    title,
                    description,
                    longDescription,
                    features: Array.isArray(features) ? features : [],
                    challenges,
                    learnings,
                    githubUrl,
                    liveUrl,
                    videoUrl,
                    technologies: Array.isArray(technologies) ? technologies : [],
                    category,
                    status,
                    githubRepo,
                    images: imageUrls,
                    authorId: userId
                },
                include: {
                    author: {
                        select: {
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            });

            return res.status(201).json({
                message: 'Project created successfully',
                project
            });

        } catch (error) {
            console.error('Create project error:', error);

            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    fs.remove(file.path).catch(console.error);
                }
            }

            const errorMessage = handleMulterError(error);
            return res.status(500).json({
                error: 'Failed to create project',
                message: errorMessage
            });
        }
    }
    static async updateProject(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const {
                title,
                description,
                longDescription,
                features,
                challenges,
                learnings,
                githubUrl,
                liveUrl,
                videoUrl,
                technologies,
                category,
                status,
                githubRepo,
                featured
            } = req.body;

            const existingProject = await prisma.project.findUnique({
                where: { id },
                select: { authorId: true, images: true }
            });

            if (!existingProject) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }

            if (existingProject.authorId !== userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only update your own projects'
                });
            }

            let newImageUrls: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    try {
                        const processedImagePath = await ImageProcessor.processProjectImage(file.path);
                        const publicUrl = ImageProcessor.getPublicUrl(processedImagePath);
                        newImageUrls.push(publicUrl);
                    } catch (error) {
                        console.error('Error processing image:', error);
                        fs.remove(file.path).catch(console.error);
                    }
                }
            }

            const allImages = [...existingProject.images, ...newImageUrls];

            const updatedProject = await prisma.project.update({
                where: { id },
                data: {
                    title,
                    description,
                    longDescription,
                    features: Array.isArray(features) ? features : undefined,
                    challenges,
                    learnings,
                    githubUrl,
                    liveUrl,
                    videoUrl,
                    technologies: Array.isArray(technologies) ? technologies : undefined,
                    category,
                    status,
                    githubRepo,
                    featured: featured !== undefined ? featured : undefined,
                    images: allImages,
                    updatedAt: new Date()
                },
                include: {
                    author: {
                        select: {
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            });

            return res.json({
                message: 'Project updated successfully',
                project: updatedProject
            });

        } catch (error) {
            console.error('Update project error:', error);

            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    fs.remove(file.path).catch(console.error);
                }
            }

            const errorMessage = handleMulterError(error);
            return res.status(500).json({
                error: 'Failed to update project',
                message: errorMessage
            });
        }
    }
    static async deleteProject(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const existingProject = await prisma.project.findUnique({
                where: { id },
                select: { authorId: true, images: true }
            });

            if (!existingProject) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }

            if (existingProject.authorId !== userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only delete your own projects'
                });
            }

            await prisma.project.delete({
                where: { id }
            });

            for (const imageUrl of existingProject.images) {
                try {
                    const relativePath = imageUrl.replace(process.env.API_URL || 'http://localhost:3001', '');
                    const filePath = path.join(process.cwd(), relativePath);
                    await fs.remove(filePath);
                } catch (error) {
                    console.error('Error deleting image file:', error);
                }
            }

            return res.json({
                message: 'Project deleted successfully'
            });

        } catch (error) {
            console.error('Delete project error:', error);
            return res.status(500).json({
                error: 'Failed to delete project',
                message: 'Internal server error'
            });
        }
    }

    static async toggleLike(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;

            const project = await prisma.project.findUnique({
                where: { id },
                select: { id: true, likes: true }
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }

            const updatedProject = await prisma.project.update({
                where: { id },
                data: {
                    likes: { increment: 1 }
                },
                select: {
                    id: true,
                    likes: true
                }
            });

            return res.json({
                message: 'Project liked successfully',
                likes: updatedProject.likes
            });

        } catch (error) {
            console.error('Toggle like error:', error);
            return res.status(500).json({
                error: 'Failed to like project',
                message: 'Internal server error'
            });
        }
    }

    static async removeImage(req: Request, res: Response) {
        try {
            const userId = req.user!.id;
            const { id } = req.params;
            const { imageUrl } = req.body;

            const project = await prisma.project.findUnique({
                where: { id },
                select: { authorId: true, images: true }
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }

            if (project.authorId !== userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only modify your own projects'
                });
            }

            const updatedImages = project.images.filter((img : string) => img !== imageUrl);

            const updatedProject = await prisma.project.update({
                where: { id },
                data: { images: updatedImages },
                select: { images: true }
            });

            try {
                const relativePath = imageUrl.replace(process.env.API_URL || 'http://localhost:3001', '');
                const filePath = path.join(process.cwd(), relativePath);
                await fs.remove(filePath);
            } catch (error) {
                console.error('Error deleting image file:', error);
            }

            return res.json({
                message: 'Image removed successfully',
                images: updatedProject.images
            });

        } catch (error) {
            console.error('Remove image error:', error);
            return res.status(500).json({
                error: 'Failed to remove image',
                message: 'Internal server error'
            });
        }
    }
}