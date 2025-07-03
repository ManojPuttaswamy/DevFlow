import { Request, Response } from 'express';
import prisma from '../utils/database';
import { getFileUrl, deleteFile, processUploadedImage, deleteMultipleFiles } from '../utils/fileupload';
import path from 'path';

export class ProjectController {
    static async getUserProjects(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const currentUserId = req.user?.id;
            const {
                page = '1',
                limit = '12',
                status,
            } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const skip = (pageNum - 1) * limitNum;

            const where: any = { authorId: userId };

            if (currentUserId !== userId) {
                where.status = { not: 'ARCHIVED' };
            } else if (status) {
                where.status = status;
            }

            const [projects, total] = await Promise.all([
                prisma.project.findMany({
                    where,
                    include: {
                        author: {
                            select: {
                                id: true,
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

            if (category && typeof category === 'string') {
                where.category = category;
            }
            if (technology && typeof technology === 'string') {
                where.technologies = {
                    has: technology
                };
            }
            if (status && typeof status === 'string') {
                where.status = status;
            } else {
                where.status = { not: 'ARCHIVED' };
            }

            if (featured !== undefined) {
                where.featured = featured === 'true';
            }
            if (author) {
                where.author = {
                    username: author
                };
            }
            if (search && typeof search === 'string') {
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

            if (!id) {
                return res.status(400).json({
                    error: 'Invalid project ID',
                    message: 'Project ID is required'
                });
            }

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
                            company: true,
                            githubUrl: true,
                            linkedinUrl: true
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

            const parsedTechnologies = typeof technologies === 'string'
                ? JSON.parse(technologies)
                : technologies;
            const parsedFeatures = typeof features === 'string'
                ? JSON.parse(features)
                : features;

            const images: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const { fileUrl } = await processUploadedImage(file, 'project');
                    images.push(fileUrl);
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
                    category: category || 'WEB_APP',
                    status: status || 'IN_PROGRESS',
                    githubRepo,
                    images,
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
                    },
                    _count: {
                        select: { reviews: true }
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
                const filePaths = req.files.map((file: Express.Multer.File) => file.path);
                deleteMultipleFiles(filePaths);
            }

            return res.status(500).json({
                error: 'Failed to create project',
                message: 'Internal server error'
            });
        }
    }
    static async updateProject(req: Request, res: Response) {
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
                    message: 'You can only update your own projects'
                });
            }

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

            const parsedTechnologies = typeof technologies === 'string'
                ? JSON.parse(technologies)
                : technologies;
            const parsedFeatures = typeof features === 'string'
                ? JSON.parse(features)
                : features;


            const newImages: string[] = [];
            if (req.files && Array.isArray(req.files)) {
                for (const file of req.files) {
                    const { fileUrl } = await processUploadedImage(file, 'project');
                    newImages.push(fileUrl);
                }
            }

            const allImages = [...(existingProject.images || []), ...newImages];

            const updatedProject = await prisma.project.update({
                where: { id },
                data: {
                    title,
                    description,
                    longDescription,
                    features: parsedFeatures,
                    challenges,
                    learnings,
                    githubUrl,
                    liveUrl,
                    videoUrl,
                    technologies: parsedTechnologies,
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
                    },
                    _count: {
                        select: { reviews: true }
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
                const filePaths = req.files.map((file: Express.Multer.File) => file.path);
                deleteMultipleFiles(filePaths);
            }

            return res.status(500).json({
                error: 'Failed to update project',
                message: 'Internal server error'
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


            if (existingProject.images && existingProject.images.length > 0) {
                const filePaths = existingProject.images.map((imageUrl: string) => {
                    const filename = path.basename(imageUrl);
                    return path.join(process.cwd(), 'uploads', 'projects', filename);
                });
                deleteMultipleFiles(filePaths);
            }

            await prisma.project.delete({
                where: { id }
            });

            return res.json({
                message: `Project "${existingProject.title}" deleted successfully`
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
                select: { id: true, likes: true, authorId: true }
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'No project found with this ID'
                });
            }

            if (project.authorId === userId) {
                return res.status(400).json({
                    error: 'Cannot like own project',
                    message: 'You cannot like your own project'
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

            if (!imageUrl) {
                return res.status(400).json({
                    error: 'Image URL required',
                    message: 'Please specify the image URL to remove'
                });
            }

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

            const updatedImages = project.images.filter((img: string) => img !== imageUrl);

            const updatedProject = await prisma.project.update({
                where: { id },
                data: { images: updatedImages },
                select: { images: true }
            });

            const filename = path.basename(imageUrl);
            const filePath = path.join(process.cwd(), 'uploads', 'projects', filename);
            deleteFile(filePath);

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