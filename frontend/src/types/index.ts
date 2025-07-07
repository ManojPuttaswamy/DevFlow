export interface User {
    id: string;
    username: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    bio?: string | null;
    avatar?: string | null;
    title?: string | null;
    company?: string | null;
    location?: string | null;
    website?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    twitterUrl?: string | null;
    portfolioUrl?: string | null;
    skills?: string[];
    experience?: string | null;
    availability?: string | null;
    profileViews?: number;
    verified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    projects?: Project[];
    _count?: {
        projects: number;
        reviewsGiven: number;
        reviewsReceived: number;
    };
}

export interface Project {
    id: string;
    title: string;
    description: string;
    longDescription?: string | null;
    features?: string[];
    challenges?: string | null;
    learnings?: string | null;
    githubUrl?: string | null;
    liveUrl?: string | null;
    videoUrl?: string | null;
    images?: string[];
    technologies: string[];
    category?: string | null;
    status: ProjectStatus;
    githubRepo?: string | null;
    githubStars?: number | null;
    githubForks?: number | null;
    githubLanguage?: string | null;
    lastCommit?: Date | string | null;
    views: number;
    likes: number;
    featured: boolean;
    authorId: string;
    author?: {
        username: string;
        firstName?: string | null;
        lastName?: string | null;
        avatar?: string | null;
        title?: string | null;
        company?: string | null;
    };
    reviews?: Review[];
    _count?: {
        reviews: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    codeQuality: number;
    documentation: number;
    userExperience: number;
    innovation: number;
    projectId: string;
    project?: {
        id: string;
        title: string;
        description: string;
        images: string[];
        technologies: string[];
        author: {
            id: string;
            username: string | null;
            firstName?: string | null;
            lastName?: string | null;
            avatar?: string | null;
        };
    };
    reviewerId: string;
    reviewer: {
        id: string;
        username: string;
        firstName?: string | null;
        lastName?: string | null;
        avatar?: string | null;
    };
    authorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface RatingDistribution {
    rating: number;
    _count: {
        rating: number;
    };
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'MAINTENANCE' | 'ARCHIVED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS';

export interface DashboardData {
    id: string;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
    profileViews: number;
    projects: Array<{
        id: string;
        title: string;
        status: ProjectStatus;
        views: number;
        likes: number;
        createdAt: string;
    }>;
    reviewsGiven: Array<{
        id: string;
        rating: number;
        project: {
            title: string;
        };
        createdAt: string;
    }>;
    reviewsReceived: Array<{
        id: string;
        rating: number;
        comment?: string | null;
        reviewer: {
            username: string;
            firstName?: string | null;
            lastName?: string | null;
            avatar?: string | null;
        };
        createdAt: string;
    }>;
    _count: {
        projects: number;
        reviewsGiven: number;
        reviewsReceived: number;
    };
}

export interface ProjectFilters {
    page?: number;
    limit?: number;
    category?: string;
    technology?: string;
    status?: ProjectStatus;
    search?: string;
    featured?: boolean;
    author?: string;
}

export interface ProjectsResponse {
    projects: Project[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface ProjectCreateData {
    title: string;
    description: string;
    longDescription?: string | null;
    features?: string[];
    challenges?: string | null;
    learnings?: string | null;
    githubUrl?: string | null;
    liveUrl?: string | null;
    videoUrl?: string | null;
    images?: string[];
    technologies: string[];
    category?: string | null;
    status: ProjectStatus;
    githubRepo?: string | null;
}

export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
    details?: any[];
}

export interface ReviewData {
    rating: number;
    comment: string;
    codeQuality: number;
    documentation: number;
    userExperience: number;
    innovation: number;
}