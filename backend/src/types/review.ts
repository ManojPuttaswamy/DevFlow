export interface CreateReviewRequest {
    projectId: string;
    rating: number;
    comment?: string;
    codeQuality: number;
    documentation: number;
    userExperience: number;
    innovation: number;
}

export interface ReviewResponse {
    id: string;
    rating: number;
    comment: string | null;
    codeQuality: number;
    documentation: number;
    userExperience: number;
    innovation: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    reviewer: {
        id: string;
        username: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    project?: {
        id: string;
        title: string;
        author: {
            username: string;
        };
    };
}

export interface ReviewAggregateStats {
    averageRating: number;
    averageCodeQuality: number;
    averageDocumentation: number;
    averageUserExperience: number;
    averageInnovation: number;
    totalReviews: number;
}

export interface ReviewAnalytics {
    ratingDistribution: Array<{
        rating: number;
        _count: { rating: number };
    }>;
    criteriaAverages: {
        _avg: {
            codeQuality: number;
            documentation: number;
            userExperience: number;
            innovation: number;
        };
    };
    recentReviews: number;
}