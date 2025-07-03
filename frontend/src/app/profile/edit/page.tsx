'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import {
    User as UserIcon,
    Camera,
    Save,
    ArrowLeft,
    MapPin,
    Building,
    Globe,
    Github,
    Linkedin,
    Twitter,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditProfile() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        title: '',
        company: '',
        location: '',
        website: '',
        githubUrl: '',
        linkedinUrl: '',
        twitterUrl: '',
        portfolioUrl: '',
        skills: [] as string[],
        experience: '',
        availability: ''
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                bio: user.bio || '',
                title: user.title || '',
                company: user.company || '',
                location: user.location || '',
                website: user.website || '',
                githubUrl: user.githubUrl || '',
                linkedinUrl: user.linkedinUrl || '',
                twitterUrl: user.twitterUrl || '',
                portfolioUrl: user.portfolioUrl || '',
                skills: user.skills || [],
                experience: user.experience || '',
                availability: user.availability || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(newSkill.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, newSkill.trim()]
                }));
            }
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        try {
            setAvatarLoading(true);
            setError('');

            const response = await apiService.uploadAvatar(file);
            setMessage('Avatar updated successfully!');

            // The user context should be updated through a re-fetch or context update
            // For now, we'll trigger a page refresh or update the auth context
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error: any) {
            console.error('Avatar upload failed:', error);
            setError(error.message || 'Failed to upload avatar');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            setMessage('');

            await apiService.updateProfile(formData);
            setMessage('Profile updated successfully!');

            // Redirect to dashboard after a delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error('Profile update failed:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
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
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                                    <p className="text-gray-600">Update your information and showcase your skills</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Status Messages */}
                    {message && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                <span className="text-green-800">{message}</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                                <span className="text-red-800">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Section */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    {avatarLoading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                        <Camera className="w-4 h-4 mr-2" />
                                        {avatarLoading ? 'Uploading...' : 'Change Avatar'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                            disabled={avatarLoading}
                                        />
                                    </label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        JPG, PNG, GIF up to 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="John"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Doe"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={4}
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tell others about yourself..."
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.bio.length}/500 characters
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Building className="w-4 h-4 inline mr-1" />
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Full Stack Developer"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tech Company Inc."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience Level
                                    </label>
                                    <select
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select experience level</option>
                                        <option value="Student">Student</option>
                                        <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                                        <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
                                        <option value="Senior Level (5-10 years)">Senior Level (5-10 years)</option>
                                        <option value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                                        Availability
                                    </label>
                                    <select
                                        id="availability"
                                        name="availability"
                                        value={formData.availability}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select availability</option>
                                        <option value="Available for hire">Available for hire</option>
                                        <option value="Open to opportunities">Open to opportunities</option>
                                        <option value="Not looking">Not looking</option>
                                        <option value="Freelance only">Freelance only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                            <div>
                                <label htmlFor="newSkill" className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Skills
                                </label>
                                <input
                                    type="text"
                                    id="newSkill"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Type a skill and press Enter"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Press Enter to add each skill
                                </p>
                            </div>

                            {formData.skills.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-600 hover:bg-blue-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Links */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Globe className="w-4 h-4 inline mr-1" />
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        Portfolio
                                    </label>
                                    <input
                                        type="url"
                                        id="portfolioUrl"
                                        name="portfolioUrl"
                                        value={formData.portfolioUrl}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://portfolio.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Github className="w-4 h-4 inline mr-1" />
                                        GitHub
                                    </label>
                                    <input
                                        type="url"
                                        id="githubUrl"
                                        name="githubUrl"
                                        value={formData.githubUrl}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Linkedin className="w-4 h-4 inline mr-1" />
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        id="linkedinUrl"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Twitter className="w-4 h-4 inline mr-1" />
                                        Twitter
                                    </label>
                                    <input
                                        type="url"
                                        id="twitterUrl"
                                        name="twitterUrl"
                                        value={formData.twitterUrl}
                                        onChange={handleInputChange}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://twitter.com/username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}