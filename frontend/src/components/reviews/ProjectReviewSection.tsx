'use client';

import { useState } from 'react';
import { Star, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import ReviewsList from './ReviewsList';
import StarRating from './StarRating';

interface ProjectReviewsSectionProps {
  project: {
    id: string;
    title: string;
    authorId: string;
    author: {
      id: string;
      username: string;
      firstName?: string;
      lastName?: string;
    };
  };
  isOwner: boolean;
  initialStats?: {
    averageRating: number;
    totalReviews: number;
  };
}

export default function ProjectReviewsSection({ 
  project, 
  isOwner, 
  initialStats 
}: ProjectReviewsSectionProps) {
  const [activeTab, setActiveTab] = useState<'reviews' | 'analytics'>('reviews');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Reviews & Feedback</h2>
            </div>
            
            {initialStats && initialStats.totalReviews > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <StarRating 
                  rating={initialStats.averageRating} 
                  readonly 
                  size="sm" 
                  showValue 
                />
                <span>({initialStats.totalReviews} review{initialStats.totalReviews !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'reviews'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Reviews
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        {initialStats && initialStats.totalReviews > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {initialStats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Average Rating</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {initialStats.totalReviews}
              </div>
              <div className="text-sm text-green-700">Total Reviews</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-sm text-purple-700">Growing</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'reviews' ? (
          <ReviewsList
            projectId={project.id}
            projectTitle={project.title}
            projectAuthorId={project.authorId}
            isProjectOwner={isOwner}
          />
        ) : (
          <ProjectReviewAnalytics projectId={project.id} />
        )}
      </div>
    </div>
  );
}

// Analytics component for project owners
function ProjectReviewAnalytics({ projectId }: { projectId: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review Analytics</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Advanced analytics features coming soon! Track review trends, response rates, and more.
        </p>
      </div>

      {/* Placeholder for future analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Review Trends
          </h4>
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Chart coming soon
          </div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Reviewer Insights
          </h4>
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Analysis coming soon
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Rating Evolution
          </h4>
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Timeline coming soon
          </div>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Improvement Areas
          </h4>
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Recommendations coming soon
          </div>
        </div>
      </div>
    </div>
  );
}