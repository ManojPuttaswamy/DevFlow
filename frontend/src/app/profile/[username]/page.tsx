'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Building, Globe, Github, Linkedin, Twitter, Calendar, Eye, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  skills: string[];
  experience?: string;
  availability?: string;
  profileViews: number;
  createdAt: string;
  projects: Array<{
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
    _count: {
      reviews: number;
    };
  }>;
  _count: {
    projects: number;
    reviewsGiven: number;
    reviewsReceived: number;
  };
}

interface PublicProfileProps {
  params: {
    username: string;
  };
}

const PublicProfile = ({ params }: PublicProfileProps) => {
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [params.username]);

  const fetchProfile = async () => {
    try {
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.username}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getAvailabilityColor = (availability?: string) => {
    const colors = {
      AVAILABLE: 'bg-green-100 text-green-800',
      BUSY: 'bg-yellow-100 text-yellow-800',
      NOT_AVAILABLE: 'bg-red-100 text-red-800'
    };
    return colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityText = (availability?: string) => {
    const texts = {
      AVAILABLE: 'Available for work',
      BUSY: 'Busy',
      NOT_AVAILABLE: 'Not available'
    };
    return texts[availability as keyof typeof texts] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The profile you\'re looking for doesn\'t exist.'}</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const displayName = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : profile.username;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-600" />
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
                    {profile.title && (
                      <p className="text-xl text-gray-600 mb-2">{profile.title}</p>
                    )}
                    {profile.availability && (
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(profile.availability)}`}>
                        {getAvailabilityText(profile.availability)}
                      </span>
                    )}
                  </div>

                  {isOwnProfile && (
                    <Link
                      href="/profile/settings"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </Link>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-700 mb-4">{profile.bio}</p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                  {profile.company && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{profile.profileViews} profile views</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center space-x-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a
                      href={profile.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Projects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Projects ({profile.projects.length})
                </h2>
              </div>

              {profile.projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No projects to display yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {profile.projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Project Image */}
                      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
                        {project.images && project.images.length > 0 ? (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-2xl font-bold text-gray-400">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        {project.featured && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Project Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {project.description || 'No description provided'}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1 mb-3">
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
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span>{project.views} views</span>
                            <span>{project.likes} likes</span>
                            <span>{project._count.reviews} reviews</span>
                          </div>
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projects</span>
                  <span className="font-medium">{profile._count.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews Given</span>
                  <span className="font-medium">{profile._count.reviewsGiven}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviews Received</span>
                  <span className="font-medium">{profile._count.reviewsReceived}</span>
                </div>
                {profile.experience && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{profile.experience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;