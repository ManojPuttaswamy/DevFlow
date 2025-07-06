'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, Eye, Heart, MessageSquare, ExternalLink, Github, Edit, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  features: string[];
  challenges?: string;
  learnings?: string;
  technologies: string[];
  category: string;
  status: string;
  views: number;
  likes: number;
  featured: boolean;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    title?: string;
    company?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };
  _count: {
    reviews: number;
  };
}

interface ProjectDetailProps {
  params: {
    id: string;
  };
}

const ProjectDetail = ({ params }: ProjectDetailProps) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${params.id}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      } else if (response.status === 404) {
        setError('Project not found');
      } else {
        setError('Failed to load project');
      }
    } catch (error) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${params.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        router.push('/projects');
      } else {
        setError('Failed to delete project');
      }
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.author.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600">{project.description}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/projects/${project.id}/edit`}
                className="p-2 text-green-600 hover:text-green-800 transition-colors"
                title="Edit Project"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={deleteProject}
                className="p-2 text-red-600 hover:text-red-800 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Images */}
            {project.images && project.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Screenshots</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {project.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project.title} screenshot ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {project.longDescription && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Project</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{project.longDescription}</p>
                </div>
              </div>
            )}

            {/* Key Features */}
            {project.features && project.features.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges & Solutions */}
            {project.challenges && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Challenges & Solutions</h2>
                <p className="text-gray-700 whitespace-pre-line">{project.challenges}</p>
              </div>
            )}

            {/* Key Learnings */}
            {project.learnings && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Learnings</h2>
                <p className="text-gray-700 whitespace-pre-line">{project.learnings}</p>
              </div>
            )}

            {/* Demo Video */}
            {project.videoUrl && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Video</h2>
                <div className="aspect-video">
                  <iframe
                    src={project.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="text-gray-900">{project.category.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900 text-sm">{formatDate(project.createdAt)}</span>
                </div>

                {project.updatedAt !== project.createdAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="text-gray-900 text-sm">{formatDate(project.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Views</span>
                  </div>
                  <span className="text-gray-900 font-medium">{project.views}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Likes</span>
                  </div>
                  <span className="text-gray-900 font-medium">{project.likes}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Reviews</span>
                  </div>
                  <span className="text-gray-900 font-medium">{project._count.reviews}</span>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
              <div className="space-y-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>View Source Code</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Live Demo</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Author</h3>
              <Link
                href={`/profile/${project.author.username}`}
                className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {project.author.avatar ? (
                    <img
                      src={project.author.avatar}
                      alt={project.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {project.author.firstName && project.author.lastName
                      ? `${project.author.firstName} ${project.author.lastName}`
                      : project.author.username
                    }
                  </div>
                  {project.author.title && (
                    <div className="text-sm text-gray-600">{project.author.title}</div>
                  )}
                  {project.author.company && (
                    <div className="text-sm text-gray-500">{project.author.company}</div>
                  )}
                </div>
              </Link>
            </div>

            {/* Featured Badge */}
            {project.featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-sm p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">✨ Featured Project</h3>
                <p className="text-sm opacity-90">
                  This project has been featured by the DevFlow community for its exceptional quality and innovation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;