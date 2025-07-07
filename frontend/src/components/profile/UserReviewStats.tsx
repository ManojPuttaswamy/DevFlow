'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, TrendingUp, Award, Target } from 'lucide-react';
import { apiService } from '@/lib/api';

interface UserReviewStatsProps {
  userId: string;
  username: string;
  isOwnProfile?: boolean;
}

interface ReviewStats {
  totalReviewsGiven: number;
  totalReviewsReceived: number;
  averageRatingGiven: number;
  averageRatingReceived: number;
}

export default function UserReviewStats({ userId, username, isOwnProfile = false }: UserReviewStatsProps) {
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStats();
  }, [userId]);

  const fetchReviewStats = async () => {
    try {
      const stats = await apiService.getUserReviewStats(userId);
      setReviewStats(stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (avgRating: number, totalReviews: number) => {
    if (totalReviews === 0) return { level: 'New', color: 'gray', icon: Target };
    if (avgRating >= 4.5 && totalReviews >= 10) return { level: 'Expert', color: 'purple', icon: Award };
    if (avgRating >= 4.0 && totalReviews >= 5) return { level: 'Advanced', color: 'blue', icon: TrendingUp };
    if (avgRating >= 3.5) return { level: 'Intermediate', color: 'green', icon: ThumbsUp };
    return { level: 'Beginner', color: 'yellow', icon: Target };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!reviewStats) {
    return null;
  }

  const reputation = getReputationLevel(reviewStats.averageRatingReceived, reviewStats.totalReviewsReceived);
  const ReputationIcon = reputation.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Review Activity
        </h3>
        
        {/* Reputation Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${reputation.color}-100 text-${reputation.color}-800`}>
          <ReputationIcon className="w-4 h-4" />
          {reputation.level} Reviewer
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Reviews Given */}
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {reviewStats.totalReviewsGiven}
          </div>
          <div className="text-sm text-blue-700">Reviews Given</div>
        </div>

        {/* Reviews Received */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {reviewStats.totalReviewsReceived}
          </div>
          <div className="text-sm text-green-700">Reviews Received</div>
        </div>

        {/* Average Rating Given */}
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {reviewStats.averageRatingGiven.toFixed(1)}
          </div>
          <div className="text-sm text-purple-700">Avg Given</div>
        </div>

        {/* Average Rating Received */}
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {reviewStats.averageRatingReceived.toFixed(1)}
          </div>
          <div className="text-sm text-orange-700">Avg Received</div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="space-y-3">
        {reviewStats.totalReviewsReceived > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Project Quality:</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= reviewStats.averageRatingReceived
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {reviewStats.averageRatingReceived.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Encouraging Message */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            {reviewStats.totalReviewsGiven === 0 && reviewStats.totalReviewsReceived === 0 ? (
              isOwnProfile 
                ? "Start reviewing projects to build your reputation in the developer community!"
                : `${username} is new to reviewing. Encourage them to share feedback!`
            ) : reviewStats.averageRatingReceived >= 4.5 ? (
              isOwnProfile
                ? " Excellent work! Your projects consistently receive high ratings."
                : ` ${username} creates exceptional projects that developers love!`
            ) : reviewStats.averageRatingReceived >= 4.0 ? (
              isOwnProfile
                ? " Great job! You're building quality projects."
                : ` ${username} builds solid, quality projects.`
            ) : reviewStats.totalReviewsReceived > 0 ? (
              isOwnProfile
                ? " Keep improving! Every project is a learning opportunity."
                : `💪 ${username} is actively working on improving their craft.`
            ) : (
              isOwnProfile
                ? " Share your first project to start receiving valuable feedback!"
                : ` ${username} is getting started on their developer journey.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}