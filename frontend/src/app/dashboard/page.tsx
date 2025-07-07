'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { DashboardData } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
    User,
    Calendar,
    CheckCircle,
    XCircle,
    BarChart3,
    Eye,
    Heart,
    Star,
    Plus,
    Settings,
    ExternalLink,
    TrendingUp,
    Code,
    Users,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import DashboardReviewSection from '@/components/dashboard/ReviewSection';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchDashboard();
        }
    }, [user]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await apiService.getDashboard();
            setDashboard(response.dashboard);
            setError('');
        } catch (error: any) {
            console.error('Failed to fetch dashboard:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayName = (user: any) => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.firstName || user?.username || 'User';
    };

    const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="mb-4 sm:mb-0">
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                                <p className="text-gray-600 mt-1">
                                    Welcome back, {getDisplayName(user)}!
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/profile/settings"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Link>
                                <button
                                    onClick={logout}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading your dashboard...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <div className="flex items-center">
                                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                                <div>
                                    <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                                    <p className="text-red-700 text-sm mt-1">{error}</p>
                                </div>
                            </div>
                            <button
                                onClick={fetchDashboard}
                                className="mt-3 text-red-800 underline hover:text-red-900 text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    ) : dashboard ? (
                        <div className="space-y-8">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Code className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Projects
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {dashboard._count.projects}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Eye className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Profile Views
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {dashboard.profileViews}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Users className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Reviews Given
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {dashboard._count.reviewsGiven}
                                                    </dd>
                                                </dl>
                                            </div>
                                            <div className="ml-3">
                                                <Link
                                                    href={`/profile/${dashboard.username}#reviews`}
                                                    className="text-purple-600 hover:text-purple-800"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Star className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Reviews Received
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900">
                                                        {dashboard._count.reviewsReceived}
                                                    </dd>
                                                </dl>
                                            </div>
                                            <div className="ml-3">
                                                <Link
                                                    href={`/profile/${dashboard.username}#reviews`}
                                                    className="text-yellow-600 hover:text-yellow-800"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Status & Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Overview */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <div className="text-center">
                                        <div className="relative inline-block mb-4">
                                            {dashboard.avatar ? (
                                                <img
                                                    src={dashboard.avatar}
                                                    alt="Profile"
                                                    className="w-20 h-20 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-10 h-10 text-blue-600" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-medium text-gray-900">
                                            {getDisplayName(dashboard)}
                                        </h3>
                                        <p className="text-gray-600">@{dashboard.username}</p>

                                        {/* Verification Status */}
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-3 ${user.verified
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {user.verified ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    Unverified
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-4 text-sm text-gray-600">
                                            <div className="flex items-center justify-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Joined {formatDate(user.createdAt || '')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <Link
                                            href="/projects/new"
                                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            <Plus className="w-6 h-6 text-blue-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">Add New Project</div>
                                                <div className="text-sm text-gray-600">Showcase your latest work</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/profile/settings"
                                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            <Settings className="w-6 h-6 text-green-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">Edit Profile</div>
                                                <div className="text-sm text-gray-600">Update your information</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href={`/profile/${user?.username}`}
                                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                        >
                                            <ExternalLink className="w-6 h-6 text-purple-600 mr-3" />
                                            <div>
                                                <div className="font-medium text-gray-900">View Public Profile</div>
                                                <div className="text-sm text-gray-600">See how others see you</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status Alert */}
                            {!user.verified && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex">
                                        <XCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                                        <div>
                                            <h3 className="text-yellow-800 font-medium">Account Verification Required</h3>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                Please check your email and verify your account to unlock all features and increase your visibility to potential employers.
                                            </p>
                                            <button className="mt-2 text-yellow-800 underline text-sm hover:text-yellow-900">
                                                Resend verification email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Projects Section */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">Your Projects</h3>
                                        <Link
                                            href="/projects"
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Manage all projects →
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {dashboard.projects.length > 0 ? (
                                        <div className="space-y-4">
                                            {dashboard.projects.slice(0, 5).map((project) => (
                                                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3">
                                                            <h4 className="font-medium text-gray-900">{project.title}</h4>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProjectStatusColor(project.status)}`}>
                                                                {formatStatus(project.status)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <span className="text-sm text-gray-600 flex items-center">
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                {project.views} views
                                                            </span>
                                                            <span className="text-sm text-gray-600 flex items-center">
                                                                <Heart className="w-3 h-3 mr-1" />
                                                                {project.likes} likes
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                Updated {formatDate(project.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <Link
                                                            href={`/projects/${project.id}/edit`}
                                                            className="text-gray-600 hover:text-gray-900 text-sm"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Link
                                                            href={`/projects/${project.id}`}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                        >
                                                            View →
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-gray-900 font-medium mb-2">No projects yet</h3>
                                            <p className="text-gray-600 mb-6">
                                                Start building your portfolio by adding your first project
                                            </p>
                                            <Link
                                                href="/projects/new"
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Your First Project
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DashboardReviewSection
                                userId={dashboard.id}
                                username={dashboard.username}
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Reviews Received */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Recent Reviews Received</h3>
                                            <Link
                                                href={`/profile/${dashboard.username}#reviews`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View All →
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {dashboard.reviewsReceived.length > 0 ? (
                                            <div className="space-y-4">
                                                {dashboard.reviewsReceived.slice(0, 3).map((review) => (
                                                    <div key={review.id} className="border-l-4 border-blue-200 pl-4">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                by {getDisplayName(review.reviewer)}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-sm text-gray-700 mb-2 line-clamp-2">{review.comment}</p>
                                                        )}
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(review.createdAt)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600 text-sm">No reviews received yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reviews Given */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">Recent Reviews Given</h3>
                                            <Link
                                                href={`/profile/${dashboard.username}#reviews`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View All →
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {dashboard.reviewsGiven.length > 0 ? (
                                            <div className="space-y-4">
                                                {dashboard.reviewsGiven.slice(0, 3).map((review) => (
                                                    <div key={review.id} className="border-l-4 border-green-200 pl-4">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <div className="flex items-center">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm text-gray-600">
                                                                for {review.project.title}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(review.createdAt)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-gray-600 text-sm">No reviews given yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </ProtectedRoute>
    );
}