import { Request, Response } from 'express';
import prisma from '../utils/database';
import { CreateReviewRequest, ReviewAnalytics } from '../types/review';
import { notificationService } from '../services/notificationService';

export class ReviewController {
    static async createReview(req: Request, res: Response) {
        try {
            const { projectId, rating, comment, codeQuality, documentation, userExperience, innovation } : CreateReviewRequest = req.body;
            const reviewerId = req.user!.id;

            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: { author: true }
            });

            if (!project) {
                return res.status(404).json({
                    error: 'Project not found',
                    message: 'The project you are trying to review does not exist'
                });
            }

            if (project.authorId === reviewerId) {
                return res.status(400).json({
                    error: 'Cannot review own project',
                    message: 'You cannot review your own project'
                });
            }

            const existingReview = await prisma.review.findUnique({
                where: {
                    projectId_reviewerId: {
                        projectId,
                        reviewerId
                    }
                }
            });

            if (existingReview) {
                return res.status(400).json({
                    error: 'Review already exists',
                    message: 'You have already reviewed this project'
                });
            }

            const review = await prisma.review.create({
                data: {
                    projectId,
                    reviewerId,
                    authorId: project.authorId,
                    rating,
                    comment: comment || null,
                    codeQuality,
                    documentation,
                    userExperience,
                    innovation,
                    status: 'PENDING'
                },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            });

            await notificationService.createReviewNotification(
                review.id, 
                project.authorId, 
                reviewerId
              );

            return res.status(201).json({
                message: 'Review submitted successfully',
                review
            });

        } catch (error) {
            console.error('Create review error:', error);
            return res.status(500).json({
                error: 'Review submission failed',
                message: 'Internal server error'
            });
        }
    }

    static async getProjectReviews(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const reviews = await prisma.review.findMany({
                where: {
                    projectId,
                    status: 'APPROVED'
                },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    [sortBy as string]: order as 'asc' | 'desc'
                },
                skip,
                take: Number(limit)
            });

            const totalReviews = await prisma.review.count({
                where: {
                    projectId,
                    status: 'APPROVED'
                }
            });


            const aggregateStats = await prisma.review.aggregate({
                where: {
                    projectId,
                    status: 'APPROVED'
                },
                _avg: {
                    rating: true,
                    codeQuality: true,
                    documentation: true,
                    userExperience: true,
                    innovation: true
                },
                _count: {
                    id: true
                }
            });

            return res.json({
                reviews,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalReviews,
                    pages: Math.ceil(totalReviews / Number(limit))
                },
                aggregateStats: {
                    averageRating: aggregateStats._avg.rating || 0,
                    averageCodeQuality: aggregateStats._avg.codeQuality || 0,
                    averageDocumentation: aggregateStats._avg.documentation || 0,
                    averageUserExperience: aggregateStats._avg.userExperience || 0,
                    averageInnovation: aggregateStats._avg.innovation || 0,
                    totalReviews: aggregateStats._count.id
                }
            });

        } catch (error) {
            console.error('Get project reviews error:', error);
            return res.status(500).json({
                error: 'Failed to fetch reviews',
                message: 'Internal server error'
            });
        }
    }


    static async getUserReviewsGiven(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const reviews = await prisma.review.findMany({
                where: { reviewerId: userId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            images: true,
                            technologies: true,
                            author: {
                                select: {
                                    id: true,
                                    username: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            });

            const totalReviews = await prisma.review.count({
                where: { reviewerId: userId }
            });

            return res.json({
                reviews,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalReviews,
                    pages: Math.ceil(totalReviews / Number(limit))
                }
            });

        } catch (error) {
            console.error('Get user reviews given error:', error);
            return res.status(500).json({
                error: 'Failed to fetch user reviews',
                message: 'Internal server error'
            });
        }
    }


    static async getUserReviewsReceived(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, status } = req.query;

            const skip = (Number(page) - 1) * Number(limit);

            const whereClause: any = { authorId: userId };
            if (status) {
                whereClause.status = status;
            }

            const reviews = await prisma.review.findMany({
                where: whereClause,
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            images: true,
                            technologies: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit)
            });

            const totalReviews = await prisma.review.count({
                where: whereClause
            });

            return res.json({
                reviews,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalReviews,
                    pages: Math.ceil(totalReviews / Number(limit))
                }
            });

        } catch (error) {
            console.error('Get user reviews received error:', error);
            return res.status(500).json({
                error: 'Failed to fetch received reviews',
                message: 'Internal server error'
            });
        }
    }


    static async updateReviewStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user!.id;


            const review = await prisma.review.findUnique({
                where: { id },
                include: { project: true }
            });

            if (!review) {
                return res.status(404).json({
                    error: 'Review not found',
                    message: 'The review you are trying to update does not exist'
                });
            }

            if (review.project.authorId !== userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only manage reviews for your own projects'
                });
            }

            const updatedReview = await prisma.review.update({
                where: { id },
                data: { status },
                include: {
                    reviewer: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            const statusText = status === 'APPROVED' ? 'approved' : 'rejected';

            await notificationService.createNotification({
                userId: review.reviewerId,
                title: `Review ${statusText}`,
                message: `Your review of "${review.project.title}" has been ${statusText}`,
                type: status === 'APPROVED' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
                projectId: review.projectId,
                reviewId: review.id,
                triggeredById: userId
            });

            return res.json({
                message: `Review ${status.toLowerCase()} successfully`,
                review: updatedReview
            });

        } catch (error) {
            console.error('Update review status error:', error);
            return res.status(500).json({
                error: 'Failed to update review status',
                message: 'Internal server error'
            });
        }
    }


    static async deleteReview(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user!.id;


            const review = await prisma.review.findUnique({
                where: { id }
            });

            if (!review) {
                return res.status(404).json({
                    error: 'Review not found',
                    message: 'The review you are trying to delete does not exist'
                });
            }

            if (review.reviewerId !== userId) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only delete your own reviews'
                });
            }

            await prisma.review.delete({
                where: { id }
            });

            return res.json({
                message: 'Review deleted successfully'
            });

        } catch (error) {
            console.error('Delete review error:', error);
            return res.status(500).json({
                error: 'Failed to delete review',
                message: 'Internal server error'
            });
        }
    }


    static async getReviewAnalytics(req: Request, res: Response) {
        try {
            const { projectId } = req.params;


            const ratingDistribution = await prisma.review.groupBy({
                by: ['rating'],
                where: {
                    projectId,
                    status: 'APPROVED'
                },
                _count: {
                    rating: true
                }
            });


            const criteriaAverages = await prisma.review.aggregate({
                where: {
                    projectId,
                    status: 'APPROVED'
                },
                _avg: {
                    codeQuality: true,
                    documentation: true,
                    userExperience: true,
                    innovation: true
                }
            });

            // Get recent reviews count (last 30 days)
            const recentReviews = await prisma.review.count({
                where: {
                    projectId,
                    status: 'APPROVED',
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                }
            });

            return res.json({
                ratingDistribution,
                criteriaAverages,
                recentReviews
            });

        } catch (error) {
            console.error('Get review analytics error:', error);
            return res.status(500).json({
                error: 'Failed to fetch review analytics',
                message: 'Internal server error'
            });
        }
    }
}