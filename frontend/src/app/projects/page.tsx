'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Filter, Search, Eye, Heart, MessageSquare, Edit, Trash2, ExternalLink, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  status: string;
  views: number;
  likes: number;
  featured: boolean;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
  author: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  _count: {
    reviews: number;
  };
}

const ProjectsDashboard = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    if (!user || !token) {
      router.push('/');
      return;
    }
    fetchProjects();
  }, [user, token, router, pagination.page]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        author: user?.username || ''
      });
      
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.search) params.append('search', filter.search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProjects();
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      MAINTENANCE: 'bg-purple-100 text-purple-800',
      ARCHIVED: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600">Manage and showcase your development projects</p>
          </div>
          <Link
            href="/projects/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search projects..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="WEB_APP">Web App</option>
                <option value="MOBILE_APP">Mobile App</option>
                <option value="API">API</option>
                <option value="LIBRARY">Library</option>
                <option value="TOOL">Tool</option>
                <option value="GAME">Game</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Start building your portfolio by creating your first project</p>
            <Link
              href="/projects/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Project</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Project Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                    {project.images && project.images.length > 0 ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400 text-center">
                          <div className="text-4xl font-bold">{project.title.charAt(0)}</div>
                          <div className="text-sm">No Image</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                          +{project.technologies.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{project.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{project.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{project._count.reviews}</span>
                        </span>
                      </div>
                      <span>{formatDate(project.createdAt)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            title="View on GitHub"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            title="View Live Site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Project"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/projects/${project.id}/edit`}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} projects
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsDashboard;