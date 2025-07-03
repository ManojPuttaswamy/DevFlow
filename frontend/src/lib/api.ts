import { User, Project, DashboardData, ProjectFilters, ProjectsResponse } from "@/types";
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
}

export const apiService = new ApiService();