'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, ExternalLink, MessageSquare, User, Filter } from 'lucide-react';
import { apiService } from '@/lib/api';
import StarRating from '../reviews/StarRating';
import Link from 'next/link';
import { Review } from '@/types';

interface UserReviewHistoryProps {
  userId: string;
  username: string;
  isOwnProfile?: boolean;
}

type TabType = 'given' | 'received';

export default function UserReviewHistory({ userId, username, isOwnProfile = false }: UserReviewHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('given');
  const [reviewsGiven, setReviewsGiven] = useState<Review[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId, activeTab]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      
      if (activeTab === 'given') {
        const response = await apiService.getUserReviewsGiven(userId, pageNum, 10);
        if (pageNum === 1) {
          setReviewsGiven(response.reviews);
        } else {
          setReviewsGiven(prev => [...prev, ...response.reviews]);
        }
        setHasMore(response.pagination.page < response.pagination.pages);
      } else {
        const response = await apiService.getUserReviewsReceived(userId, pageNum, 10, 'APPROVED');
        if (pageNum === 1) {
          setReviewsReceived(response.reviews);
        } else {
          setReviewsReceived(prev => [...prev, ...response.reviews]);
        }
        setHasMore(response.pagination.page < response.pagination.pages);
      }
      
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getDisplayName = (user: any) => {
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.username || 'Unknown user';
  };

  const currentReviews = activeTab === 'given' ? reviewsGiven : reviewsReceived;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Review History
          </h3>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('given')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'given'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews Given
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews Received
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : currentReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'given' ? 'No Reviews Given' : 'No Reviews Received'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {activeTab === 'given' 
                ? isOwnProfile
                  ? "Start reviewing other developers' projects to build your reputation!"
                  : `${username} hasn't reviewed any projects yet.`
                : isOwnProfile
                  ? "Share your projects to start receiving valuable feedback from the community!"
                  : `${username} hasn't received any reviews yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentReviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {activeTab === 'given' ? (
                  // Review given by user
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            Review for: 
                            <Link 
                              href={`/projects/${review.project?.id}`}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              {review.project?.title}
                            </Link>
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <StarRating rating={review.rating} readonly size="sm" showValue />
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        {/* Detailed Ratings */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-xs">
                            <span className="text-gray-600">Code:</span>
                            <StarRating rating={review.codeQuality} readonly size="sm" />
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">Docs:</span>
                            <StarRating rating={review.documentation} readonly size="sm" />
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">UX:</span>
                            <StarRating rating={review.userExperience} readonly size="sm" />
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-600">Innovation:</span>
                            <StarRating rating={review.innovation} readonly size="sm" />
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {review.comment}
                          </p>
                        )}
                      </div>

                      {review.project?.images && review.project.images.length > 0 && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={review.project.images[0]}
                            alt={review.project.title}
                            className="w-16 h-12 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>by</span>
                        <Link 
                          href={`/profile/${review.project?.author.username}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          @{review.project?.author.username}
                        </Link>
                      </div>
                      
                      <Link
                        href={`/projects/${review.project?.id}#reviews`}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        View Project
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Review received by user
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      {/* Reviewer Avatar */}
                      <div className="flex-shrink-0">
                        {review.reviewer?.avatar ? (
                          <img
                            src={review.reviewer.avatar}
                            alt={review.reviewer.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {getDisplayName(review.reviewer)}
                          </span>
                          <span className="text-sm text-gray-500">
                            reviewed
                          </span>
                          <Link 
                            href={`/projects/${review.project?.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {review.project?.title}
                          </Link>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <StarRating rating={review.rating} readonly size="sm" showValue />
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 text-sm line-clamp-2 mb-2">
                            "{review.comment}"
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/profile/${review.reviewer?.username}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            @{review.reviewer?.username}
                          </Link>
                          
                          <Link
                            href={`/projects/${review.project?.id}#reviews`}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            View Review
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}