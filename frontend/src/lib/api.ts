import { User, Project, DashboardData, ProjectFilters, ProjectsResponse, Review, ReviewData, NotificationResponse } from "@/types";
import { promises } from "dns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


class ApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const token = localStorage.getItem('devflow_token');

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        const response = await fetch(`${API_URL}${endpoint}`, config);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return response.json();
    }


    async getUser(username: string): Promise<{ user: User }> {
        return this.request(`/api/users/${username}`);
    }

    async updateProfile(data: Partial<User>): Promise<{ user: User; message: string }> {
        return this.request('api/users/profile/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async uploadAvatar(file: File): Promise<{ avatar: string, user: User, message: string }> {
        const formData = new FormData;
        formData.append('avatar', file);

        return this.request('/api/users/avatar/upload', {
            method: 'POST',
            headers: {},
            body: formData
        });
    }

    async getDashboard(): Promise<{ dashboard: DashboardData }> {
        return this.request('/api/users/dashboard/me');
    }

    async getProjects(filters: ProjectFilters = {}): Promise<ProjectsResponse> {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/api/projects${queryString ? `?${queryString}` : ''}`;

        return this.request(endpoint);
    }

    async getProject(id: string): Promise<{ project: Project }> {
        return this.request(`/api/projects/${id}`);
    }

    async createProject(data: Partial<Project>, images?: File[]): Promise<{ project: Partial<Project>; message: string }> {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                }
                else {
                    formData.append(key, value.toString());
                }
            }
        });

        if (images) {
            images.forEach((image) => {
                formData.append('projectImages', image);
            });
        }

        return this.request('/api/projects', {
            method: 'POST',
            headers: {},
            body: formData
        });
    }

    async updateProject(id: string, data: Partial<Project>, images?: File[]): Promise<{ project: Partial<Project>; message: string }> {
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                }
                else {
                    formData.append(key, value.toString());
                }
            }
        });

        if (images) {
            images.forEach((image) => {
                formData.append('projectImages', image);
            });
        }

        return this.request(`/api/projects/${id}`, {
            method: 'PUT',
            headers: {},
            body: formData
        });
    }
    async deleteProject(id: string): Promise<{ message: string }> {
        return this.request(`/api/projects/${id}`, {
            method: 'DELETE',
        });
    }

    async likeProject(id: string): Promise<{ likes: number; message: string }> {
        return this.request(`/api/projects/${id}/like`, {
            method: 'POST',
        });
    }

    async removeProjectImage(id: string, imageUrl: string): Promise<{ images: string[]; message: string }> {
        return this.request(`/api/projects/${id}/images`, {
            method: 'DELETE',
            body: JSON.stringify({ imageUrl }),
        });
    }

    async submitReview(projectId: string, reviewData: ReviewData): Promise<{ review: Review; message: string }> {
        return this.request(`api/reviews`, {
            method: 'POST',
            body: JSON.stringify({
                projectId,
                ...reviewData

            })
        });
    }

    async getProjectReviews(
        projectId: string,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc'
    ): Promise<{
        reviews: Review[];
        pagination: any;
        aggregateStats: any;
    }> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            order
        });

        return this.request(`/api/reviews/project/${projectId}?${params}`);
    }

    async getUserReviewsGiven(userId: string, page = 1, limit = 10): Promise<{
        reviews: Review[];
        pagination: any;
    }> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        return this.request(`/api/reviews/user/${userId}/given?${params}`);
    }

    async getUserReviewsReceived(userId: string, page = 1, limit = 10, status?: string): Promise<{
        reviews: Review[];
        pagination: any;
    }> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(status && { status })
        });
    
        return this.request(`/api/reviews/user/${userId}/received?${params}`);
    }

    async updateReviewStatus(reviewId: string, status: 'APPROVED' | 'REJECTED'): Promise<{
        review: Review;
        message: string;
    }> {
        return this.request(`/api/reviews/${reviewId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteReview(reviewId: string): Promise<{ message: string }> {
        return this.request(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    }

    async getReviewAnalytics(projectId: string): Promise<{
        ratingDistribution: Array<{
            rating: number;
            _count: { rating: number };
        }>;
        criteriaAverages: any;
        recentReviews: number;
    }> {
        return this.request(`/api/reviews/analytics/${projectId}`);
    }

    async getUserReviewStats(userId: string): Promise<{
        totalReviewsGiven: number;
        totalReviewsReceived: number;
        averageRatingGiven: number;
        averageRatingReceived: number;
    }> {
        try {
            const [givenResponse, receivedResponse] = await Promise.all([
                this.getUserReviewsGiven(userId, 1, 1000),
                this.getUserReviewsReceived(userId, 1, 1000, 'APPROVED')
            ]);

            const givenReviews = givenResponse.reviews;
            const receivedReviews = receivedResponse.reviews;

            const avgRatingGiven = givenReviews.length > 0
                ? givenReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / givenReviews.length
                : 0;

            const avgRatingReceived = receivedReviews.length > 0
                ? receivedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / receivedReviews.length
                : 0;

            return {
                totalReviewsGiven: givenReviews.length,
                totalReviewsReceived: receivedReviews.length,
                averageRatingGiven: avgRatingGiven,
                averageRatingReceived: avgRatingReceived
            };
        } catch (error) {
            console.error('Error fetching user review stats:', error);
            return {
                totalReviewsGiven: 0,
                totalReviewsReceived: 0,
                averageRatingGiven: 0,
                averageRatingReceived: 0
            };
        }
    }

    async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
        return this.request(`/api/notifications?page=${page}&limit=${limit}`);
    }

    async getUnreadNotificationCount(): Promise<{ count: number }> {
        return this.request('/api/notifications/unread-count');
    }

    async markNotificationAsRead(notificationId: string): Promise<{ message: string }> {
        return this.request(`/api/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
    }

    async markAllNotificationsAsRead(): Promise<{ message: string }> {
        return this.request('/api/notifications/read-all', {
            method: 'PUT'
        });
    }

    async deleteNotification(notificationId: string): Promise<{ message: string }> {
        return this.request(`/api/notifications/${notificationId}`, {
            method: 'DELETE'
        });
    }

    async createTestNotification(data?: {
        title?: string;
        message?: string;
        type?: string;
    }): Promise<{ message: string; notification: any }> {
        return this.request('/api/notifications/test', {
            method: 'POST',
            body: JSON.stringify(data || {})
        });
    }


}

export const apiService = new ApiService();