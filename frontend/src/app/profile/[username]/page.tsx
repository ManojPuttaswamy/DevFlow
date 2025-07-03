'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/lib/api';
import { User } from '@/types';
import {
    User as UserIcon,
    MapPin,
    Building,
    Calendar,
    Globe,
    Github,
    Linkedin,
    Twitter,
    ExternalLink,
    Eye,
    Heart,
    Star,
    Code,
    Award,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PublicProfile() {
    const params = useParams();
    const username = params.username as string;
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (username) {
            fetchProfile();
        }
    }, [username]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.getUser(username);
            setUser(response.user);
        } catch (error: any) {
            console.error('Failed to fetch profile:', error);
            setError(error.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user.firstName || user.username;
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
    };

    const getProjectStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'PLANNING':
                return 'bg-yellow-100 text-yellow-800';
            case 'MAINTENANCE':
                return 'bg-purple-100 text-purple-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'Available for hire':
                return 'bg-green-100 text-green-800';
            case 'Open to opportunities':
                return 'bg-blue-100 text-blue-800';
            case 'Freelance only':
                return 'bg-purple-100 text-purple-800';
            case 'Not looking':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <UserIcon className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
                        <p className="text-gray-600 mb-6">
                            {error || 'The profile you are looking for does not exist.'}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Browse
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            {/* Avatar and Basic Info */}
                            <div className="text-center mb-6">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={getDisplayName(user)}
                                        className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserIcon className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}

                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {getDisplayName(user)}
                                </h1>

                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <p className="text-gray-600">@{user.username}</p>
                                    {user.verified && (
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>

                                {user.title && (
                                    <p className="text-lg text-gray-700 mt-2 mb-1">{user.title}</p>
                                )}

                                {user.company && (
                                    <div className="flex items-center justify-center text-gray-600 mb-1">
                                        <Building className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{user.company}</span>
                                    </div>
                                )}

                                {user.location && (
                                    <div className="flex items-center justify-center text-gray-600 mb-3">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{user.location}</span>
                                    </div>
                                )}

                                {user.availability && (
                                    <div className="mt-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(user.availability)}`}>
                                            {user.availability}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">About</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-1 mb-6 text-center">
                                <div className="p-3">
                                    <div className="text-xl font-bold text-blue-600">{user._count?.projects || 0}</div>
                                    <div className="text-xs text-gray-600">Projects</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-xl font-bold text-green-600">{user._count?.reviewsGiven || 0}</div>
                                    <div className="text-xs text-gray-600">Reviews</div>
                                </div>
                                <div className="p-3">
                                    <div className="text-xl font-bold text-purple-600">{user.profileViews || 0}</div>
                                    <div className="text-xs text-gray-600">Views</div>
                                </div>
                            </div>

                            {/* Experience */}
                            {user.experience && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Experience Level</h3>
                                    <p className="text-gray-700 text-sm">{user.experience}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {user.skills && user.skills.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {user.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Links */}
                            {(user.website || user.portfolioUrl || user.githubUrl || user.linkedinUrl || user.twitterUrl) && (
                                <div className="space-y-3 mb-6">
                                    <h3 className="text-sm font-medium text-gray-900">Links</h3>

                                    {user.website && (
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
                                        >
                                            <Globe className="w-4 h-4 mr-2 group-hover:text-blue-600" />
                                            <span className="text-sm">Website</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}

                                    {user.portfolioUrl && (

                                        <a href={user.portfolioUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
                                        >
                                            <Award className="w-4 h-4 mr-2 group-hover:text-purple-600" />
                                            <span className="text-sm">Portfolio</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}

                                    {user.githubUrl && (

                                        <a href={user.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors group"
                                        >
                                            <Github className="w-4 h-4 mr-2 group-hover:text-gray-900" />
                                            <span className="text-sm">GitHub</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}

                                    {user.linkedinUrl && (

                                        <a href={user.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
                                        >
                                            <Linkedin className="w-4 h-4 mr-2 group-hover:text-blue-600" />
                                            <span className="text-sm">LinkedIn</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}

                                    {user.twitterUrl && (

                                        <a href={user.twitterUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-gray-600 hover:text-blue-400 transition-colors group"
                                        >
                                            <Twitter className="w-4 h-4 mr-2 group-hover:text-blue-400" />
                                            <span className="text-sm">Twitter</span>
                                            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Member Since */}
                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex items-center text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span className="text-sm">
                                        Member since {formatDate(user.createdAt || '')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Projects */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-medium text-gray-900">Projects</h2>
                                    <span className="text-sm text-gray-500">
                                        {user.projects?.length || 0} projects
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {user.projects && user.projects.length > 0 ? (
                                    <div className="space-y-6">
                                        {user.projects.map((project) => (
                                            <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                                <Link
                                                                    href={`/projects/${project.id}`}
                                                                    className="hover:text-blue-600 transition-colors"
                                                                >
                                                                    {project.title}
                                                                </Link>
                                                            </h3>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                                                                {formatStatus(project.status)}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>

                                                        {/* Technologies */}
                                                        {project.technologies && project.technologies.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {project.technologies.slice(0, 6).map((tech) => (
                                                                    <span
                                                                        key={tech}
                                                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                                                    >
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                                {project.technologies.length > 6 && (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                                        +{project.technologies.length - 6} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Project Stats */}
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                                            <span className="flex items-center">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                {project.views}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Heart className="w-4 h-4 mr-1" />
                                                                {project.likes}
                                                            </span>
                                                            {project._count && (
                                                                <span className="flex items-center">
                                                                    <Star className="w-4 h-4 mr-1" />
                                                                    {project._count.reviews}
                                                                </span>
                                                            )}
                                                            <span className="text-gray-500">
                                                                Updated {new Date(project.updatedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* Project Links */}
                                                        <div className="flex items-center space-x-4">
                                                            <Link
                                                                href={`/projects/${project.id}`}
                                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                            >
                                                                View Details →
                                                            </Link>

                                                            {project.githubUrl && (

                                                                <a href={project.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-gray-600 hover:text-gray-900 text-sm transition-colors"
                                                                >
                                                                    <Github className="w-4 h-4 mr-1" />
                                                                    Code
                                                                </a>
                                                            )}

                                                            {project.liveUrl && (

                                                                <a href={project.liveUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-gray-600 hover:text-blue-600 text-sm transition-colors"
                                                                >
                                                                    <ExternalLink className="w-4 h-4 mr-1" />
                                                                    Live Demo
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Project Image */}
                                                    {project.images && project.images.length > 0 && (
                                                        <div className="ml-6 flex-shrink-0">
                                                            <img
                                                                src={project.images[0]}
                                                                alt={project.title}
                                                                className="w-32 h-24 object-cover rounded-lg"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-gray-900 font-medium mb-2">No projects yet</h3>
                                        <p className="text-gray-600">
                                            {getDisplayName(user)} has not shared any projects yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}