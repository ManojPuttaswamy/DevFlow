'use client';

import { useState, useEffect } from 'react';
import { Plus, ChevronDown, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import ReviewForm, { ReviewFormData } from './ReviewForm';
import ReviewSummary from './ReviewSummary';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import ReviewCard from './ReviewCard';
import { Review, RatingDistribution } from '@/types';

interface ReviewsListProps {
  projectId: string;
  projectTitle: string;
  projectAuthorId: string;
  isProjectOwner: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function ReviewsList({ 
  projectId, 
  projectTitle, 
  projectAuthorId, 
  isProjectOwner 
}: ReviewsListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aggregateStats, setAggregateStats] = useState({
    averageRating: 0,
    averageCodeQuality: 0,
    averageDocumentation: 0,
    averageUserExperience: 0,
    averageInnovation: 0,
    totalReviews: 0
  });
  const [ratingDistribution, setRatingDistribution] = useState<RatingDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState('');

  // Check if current user can review
  const canReview = user && user.id !== projectAuthorId && !reviews.some(r => r.reviewer.id === user.id);

  useEffect(() => {
    fetchReviews();
    fetchAnalytics();
  }, [projectId, sortBy, filterRating]);

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      setError('');
      
      const response = await apiService.getProjectReviews(
        projectId,
        pageNum,
        10,
        sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : 'rating',
        sortBy === 'oldest' || sortBy === 'lowest' ? 'asc' : 'desc'
      );

      const filteredReviews = filterRating 
        ? response.reviews.filter((review: Review) => review.rating === filterRating)
        : response.reviews;

      if (pageNum === 1) {
        setReviews(filteredReviews);
      } else {
        setReviews(prev => [...prev, ...filteredReviews]);
      }

      setAggregateStats(response.aggregateStats);
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(pageNum);

    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.getReviewAnalytics(projectId);
      setRatingDistribution(response.ratingDistribution);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleSubmitReview = async (reviewData: ReviewFormData) => {
    if (!user) return;

    setSubmittingReview(true);
    try {
      await apiService.submitReview(projectId, reviewData);
      setShowReviewForm(false);
      
      // Refresh reviews and stats
      await fetchReviews();
      await fetchAnalytics();
      
      // Show success message
      alert('Review submitted successfully! It will be visible once approved.');
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await apiService.deleteReview(reviewId);
      
      // Remove review from list
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      
      // Refresh stats
      await fetchReviews();
      await fetchAnalytics();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Failed to delete review. Please try again.');
    }
  };

  const handleReportReview = async (reviewId: string) => {
    // TODO: Implement review reporting
    alert('Review reported. Thank you for helping us maintain quality standards.');
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(page + 1);
    }
  };

  if (showReviewForm) {
    return (
      <div className="space-y-6">
        <ReviewForm
          projectId={projectId}
          projectTitle={projectTitle}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <ReviewSummary
        aggregateStats={aggregateStats}
        ratingDistribution={ratingDistribution}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Actions and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Add Review Button */}
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={submittingReview}
            >
              <Plus className="w-4 h-4" />
              Write Review
            </button>
          )}

          {/* Review Status Message */}
          {user && user.id === projectAuthorId && (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              You cannot review your own project
            </div>
          )}

          {user && reviews.some(r => r.reviewer.id === user.id) && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              You have already reviewed this project
            </div>
          )}

          {!user && (
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Please login to write a review
            </div>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-3">
          {/* Rating Filter */}
          <div className="relative">
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Options */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {canReview 
                ? "Be the first to review this project and help the developer improve their work!"
                : "This project hasn't received any reviews yet."
              }
            </p>
          </div>
        ) : (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
                onDelete={handleDeleteReview}
                onReport={handleReportReview}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Reviews'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}