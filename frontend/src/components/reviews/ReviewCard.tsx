'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Calendar, User, MoreVertical, Flag, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    codeQuality: number;
    documentation: number;
    userExperience: number;
    innovation: number;
    status: string;
    createdAt: string;
    reviewer: {
        id: string;
        username: string;
        firstName?: string | null;  
        lastName?: string | null;   
        avatar?: string | null;     
    };
  };
  currentUserId?: string;
  onDelete?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showProjectInfo?: boolean;
  projectInfo?: {
    id: string;
    title: string;
    author: {
      username: string;
    };
  };
}

export default function ReviewCard({ 
  review, 
  currentUserId, 
  onDelete, 
  onReport,
  showProjectInfo = false,
  projectInfo 
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState(0);
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(null);

  const isOwnReview = currentUserId === review.reviewer.id;
  const reviewerName = review.reviewer.firstName && review.reviewer.lastName 
    ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
    : review.reviewer.username;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handleVote = (voteType: 'helpful' | 'unhelpful') => {
    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      setHelpfulVotes(prev => voteType === 'helpful' ? prev - 1 : prev + 1);
    } else {
      // Add or change vote
      const prevVote = userVote;
      setUserVote(voteType);
      
      if (voteType === 'helpful') {
        setHelpfulVotes(prev => prevVote === 'unhelpful' ? prev + 2 : prev + 1);
      } else {
        setHelpfulVotes(prev => prevVote === 'helpful' ? prev - 2 : prev - 1);
      }
    }
  };

  const shouldTruncateComment = review.comment && review.comment.length > 300;
  const displayComment = isExpanded || !shouldTruncateComment 
    ? review.comment 
    : review.comment?.slice(0, 300) + '...';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.reviewer.avatar ? (
              <img
                src={review.reviewer.avatar}
                alt={reviewerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>

          {/* Reviewer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {reviewerName}
              </h3>
              <span className="text-sm text-gray-500">@{review.reviewer.username}</span>
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <StarRating rating={review.rating} readonly size="sm" showValue />
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(review.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              {isOwnReview && onDelete && (
                <button
                  onClick={() => {
                    onDelete(review.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Review
                </button>
              )}
              {!isOwnReview && onReport && (
                <button
                  onClick={() => {
                    onReport(review.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Report Review
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Info (if showing reviews from multiple projects) */}
      {showProjectInfo && projectInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Review for <span className="font-medium text-gray-900">{projectInfo.title}</span>
            {' '}by <span className="text-gray-700">@{projectInfo.author.username}</span>
          </p>
        </div>
      )}

      {/* Detailed Ratings */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <StarRating
            rating={review.codeQuality}
            readonly
            size="sm"
            label="Code Quality"
          />
          <StarRating
            rating={review.documentation}
            readonly
            size="sm"
            label="Documentation"
          />
        </div>
        <div className="space-y-2">
          <StarRating
            rating={review.userExperience}
            readonly
            size="sm"
            label="User Experience"
          />
          <StarRating
            rating={review.innovation}
            readonly
            size="sm"
            label="Innovation"
          />
        </div>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayComment}
          </div>
          
          {shouldTruncateComment && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* Helpful Vote */}
          <button
            onClick={() => handleVote('helpful')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userVote === 'helpful'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful</span>
            {helpfulVotes > 0 && <span>({helpfulVotes})</span>}
          </button>

          {/* Unhelpful Vote */}
          <button
            onClick={() => handleVote('unhelpful')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              userVote === 'unhelpful'
                ? 'bg-red-100 text-red-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Not Helpful</span>
          </button>
        </div>

        {/* Review Status */}
        {review.status !== 'APPROVED' && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            review.status === 'PENDING' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {review.status}
          </span>
        )}
      </div>
    </div>
  );
}