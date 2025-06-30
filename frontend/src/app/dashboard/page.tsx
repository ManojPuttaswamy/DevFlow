'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { User, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();

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
                <div className="bg-white shadow">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {user?.firstName && user?.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user?.username
                                        }
                                    </h2>
                                    <p className="text-gray-600 mb-4">@{user?.username}</p>

                                    {/* Verification Status */}
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user?.verified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {user?.verified ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Verified Account
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Unverified Account
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center">
                                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                                        <span className="text-gray-600">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                        <span className="text-gray-600">
                                            Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Welcome to DevFlow!
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Authentication Complete</h4>
                                        <p className="text-blue-700 text-sm">
                                            Your authentication system is working perfectly! You can now:
                                        </p>
                                        <ul className="mt-2 text-blue-700 text-sm list-disc list-inside space-y-1">
                                            <li>Access protected routes</li>
                                            <li>View your profile information</li>
                                            <li>Stay logged in across browser sessions</li>
                                            <li>Securely logout when needed</li>
                                        </ul>
                                    </div>

                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="font-medium text-green-900 mb-2">Next Steps for Day 3</h4>
                                        <ul className="text-green-700 text-sm list-disc list-inside space-y-1">
                                            <li>Build user profile management</li>
                                            <li>Create project showcase features</li>
                                            <li>Implement file upload for avatars</li>
                                            <li>Add email verification system</li>
                                        </ul>
                                    </div>

                                    {!user?.verified && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <h4 className="font-medium text-yellow-900 mb-2">Action Required 📧</h4>
                                            <p className="text-yellow-700 text-sm">
                                                Please check your email and verify your account to unlock all features.
                                            </p>
                                            <button className="mt-2 text-yellow-800 underline text-sm hover:text-yellow-900">
                                                Resend verification email
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-white rounded-lg shadow p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-600">0</div>
                                    <div className="text-gray-600 text-sm">Projects</div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">0</div>
                                    <div className="text-gray-600 text-sm">Reviews Given</div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 text-center">
                                    <div className="text-2xl font-bold text-purple-600">0</div>
                                    <div className="text-gray-600 text-sm">Reviews Received</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}