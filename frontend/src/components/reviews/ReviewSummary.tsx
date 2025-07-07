'use client';

import { Star, TrendingUp, Users, Award, Code, BookOpen, Zap } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewSummaryProps {
  aggregateStats: {
    averageRating: number;
    averageCodeQuality: number;
    averageDocumentation: number;
    averageUserExperience: number;
    averageInnovation: number;
    totalReviews: number;
  };
  ratingDistribution?: Array<{
    rating: number;
    _count: { rating: number };
  }>;
  recentReviews?: number;
}

export default function ReviewSummary({ 
  aggregateStats, 
  ratingDistribution = [],
  recentReviews = 0 
}: ReviewSummaryProps) {
  const { 
    averageRating, 
    averageCodeQuality, 
    averageDocumentation, 
    averageUserExperience, 
    averageInnovation, 
    totalReviews 
  } = aggregateStats;

  // Calculate rating distribution percentages
  const ratingPercentages = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i; // Start from 5 stars down to 1
    const count = ratingDistribution.find(r => r.rating === rating)?._count.rating || 0;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Fair';
    if (rating >= 1.5) return 'Poor';
    return 'Very Poor';
  };

  if (totalReviews === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Be the first to review this project and help the developer improve their work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Overall Rating Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating</h3>
          
          {/* Main Rating Display */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} readonly size="md" />
              <div className="text-sm text-gray-600 mt-1">
                {getRatingText(averageRating)}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
              
              {/* Recent Reviews Indicator */}
              {recentReviews > 0 && (
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {recentReviews} review{recentReviews !== 1 ? 's' : ''} this month
                </div>
              )}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
            {ratingPercentages.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <span className="text-sm text-gray-500 w-8 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Criteria Ratings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Ratings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Code className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-gray-700">Code Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarRating rating={averageCodeQuality} readonly size="sm" />
                <span className="text-sm font-medium text-gray-900">
                  {averageCodeQuality.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700">Documentation</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarRating rating={averageDocumentation} readonly size="sm" />
                <span className="text-sm font-medium text-gray-900">
                  {averageDocumentation.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700">User Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarRating rating={averageUserExperience} readonly size="sm" />
                <span className="text-sm font-medium text-gray-900">
                  {averageUserExperience.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-medium text-gray-700">Innovation</span>
              </div>
              <div className="flex items-center space-x-2">
                <StarRating rating={averageInnovation} readonly size="sm" />
                <span className="text-sm font-medium text-gray-900">
                  {averageInnovation.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Project Highlights</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Best Aspect:</span>
                <div className="text-blue-800">
                  {(() => {
                    const scores = [
                      { name: 'Code Quality', score: averageCodeQuality },
                      { name: 'Documentation', score: averageDocumentation },
                      { name: 'User Experience', score: averageUserExperience },
                      { name: 'Innovation', score: averageInnovation }
                    ];
                    const best = scores.reduce((a, b) => a.score > b.score ? a : b);
                    return best.name;
                  })()}
                </div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Total Reviews:</span>
                <div className="text-blue-800 font-semibold">{totalReviews}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}