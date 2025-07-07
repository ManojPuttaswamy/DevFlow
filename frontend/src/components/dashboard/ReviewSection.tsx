'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, ArrowRight, Calendar, User } from 'lucide-react';
import { apiService } from '@/lib/api';
import StarRating from '../reviews/StarRating';
import Link from 'next/link';
import { Review } from '@/types';

interface DashboardReviewSectionProps {
  userId: string;
  username: string;
}

export default function DashboardReviewSection({ userId, username }: DashboardReviewSectionProps) {
  const [recentReviewsReceived, setRecentReviewsReceived] = useState<Review[]>([]);
  const [recentReviewsGiven, setRecentReviewsGiven] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviewsGiven: 0,
    totalReviewsReceived: 0,
    averageRatingReceived: 0,
    averageRatingGiven: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewData();
  }, [userId]);

  const fetchReviewData = async () => {
    try {
      const [statsResponse, receivedResponse, givenResponse] = await Promise.all([
        apiService.getUserReviewStats(userId),
        apiService.getUserReviewsReceived(userId, 1, 3, 'APPROVED'),
        apiService.getUserReviewsGiven(userId, 1, 3)
      ]);

      setReviewStats(statsResponse);
      setRecentReviewsReceived(receivedResponse.reviews);
      setRecentReviewsGiven(givenResponse.reviews);
    } catch (error) {
      console.error('Error fetching review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getDisplayName = (user: any) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reviews Given
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reviewStats.totalReviewsGiven}
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
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Reviews Received
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reviewStats.totalReviewsReceived}
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
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reviewStats.averageRatingReceived > 0 ? reviewStats.averageRatingReceived.toFixed(1) : 'No ratings yet'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Reviews Received */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Reviews Received</h3>
              <Link
                href={`/profile/${username}#reviews`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentReviewsReceived.length > 0 ? (
              <div className="space-y-4">
                {recentReviewsReceived.map((review) => (
                  <div key={review.id} className="border-l-4 border-green-400 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm font-medium text-gray-900">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <Link 
                        href={`/projects/${review.project?.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {review.project?.title}
                      </Link>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        "{review.comment}"
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {review.reviewer?.avatar ? (
                          <img
                            src={review.reviewer.avatar}
                            alt={review.reviewer.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 text-gray-600" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        by {getDisplayName(review.reviewer)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No reviews received yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Share your projects to start receiving feedback!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews Given */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Reviews Given</h3>
              <Link
                href={`/profile/${username}#reviews`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentReviewsGiven.length > 0 ? (
              <div className="space-y-4">
                {recentReviewsGiven.map((review) => (
                  <div key={review.id} className="border-l-4 border-blue-400 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm font-medium text-gray-900">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Review for </span>
                      <Link 
                        href={`/projects/${review.project?.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {review.project?.title}
                      </Link>
                    </div>

                    {review.comment && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No reviews given yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start reviewing projects to help other developers!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Encouragement */}
      {reviewStats.totalReviewsGiven === 0 && reviewStats.totalReviewsReceived === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Review Journey!</h3>
            <p className="text-gray-600 mb-4">
              Reviews are the heart of the DevFlow community. Give and receive feedback to grow as a developer.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/projects"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Projects to Review
              </Link>
              <Link
                href="/projects/new"
                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Share Your Project
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}