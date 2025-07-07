'use client';

import { useState } from 'react';
import { MessageSquare, Send, AlertCircle, X } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewFormProps {
  projectId: string;
  projectTitle: string;
  onSubmit: (reviewData: ReviewFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ReviewFormData {
  rating: number;
  comment: string;
  codeQuality: number;
  documentation: number;
  userExperience: number;
  innovation: number;
}

export default function ReviewForm({ projectId, projectTitle, onSubmit, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    comment: '',
    codeQuality: 0,
    documentation: 0,
    userExperience: 0,
    innovation: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);

  // Calculate overall rating based on criteria
  const updateOverallRating = (newFormData: ReviewFormData) => {
    const { codeQuality, documentation, userExperience, innovation } = newFormData;
    if (codeQuality && documentation && userExperience && innovation) {
      const average = (codeQuality + documentation + userExperience + innovation) / 4;
      return { ...newFormData, rating: Math.round(average) };
    }
    return newFormData;
  };

  const handleCriteriaChange = (criteria: keyof ReviewFormData, value: number) => {
    const newFormData = { ...formData, [criteria]: value };
    const updatedFormData = updateOverallRating(newFormData);
    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.codeQuality > 0 && 
           formData.documentation > 0 && 
           formData.userExperience > 0 && 
           formData.innovation > 0 &&
           formData.comment.trim().length >= 20;
  };

  const criteriaDescriptions = {
    codeQuality: "How well-structured, readable, and maintainable is the code?",
    documentation: "How clear and comprehensive is the project documentation?",
    userExperience: "How intuitive and polished is the user interface/experience?",
    innovation: "How creative and innovative is the solution or approach?"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Review Project: {projectTitle}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Share your feedback to help the developer improve their project
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-blue-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Guidelines */}
      {showGuidelines && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">Review Guidelines</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be constructive and specific in your feedback</li>
                <li>• Focus on the code, design, and functionality</li>
                <li>• Provide suggestions for improvement</li>
                <li>• Be respectful and professional</li>
              </ul>
              <button
                onClick={() => setShowGuidelines(false)}
                className="text-blue-600 text-xs underline mt-2 hover:text-blue-800"
              >
                Hide guidelines
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Rating Criteria */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rate this project</h3>
          
          <div className="grid gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <StarRating
                rating={formData.codeQuality}
                onRatingChange={(rating) => handleCriteriaChange('codeQuality', rating)}
                label="Code Quality"
                size="md"
              />
              <p className="text-sm text-gray-600 mt-1 ml-24">
                {criteriaDescriptions.codeQuality}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <StarRating
                rating={formData.documentation}
                onRatingChange={(rating) => handleCriteriaChange('documentation', rating)}
                label="Documentation"
                size="md"
              />
              <p className="text-sm text-gray-600 mt-1 ml-24">
                {criteriaDescriptions.documentation}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <StarRating
                rating={formData.userExperience}
                onRatingChange={(rating) => handleCriteriaChange('userExperience', rating)}
                label="User Experience"
                size="md"
              />
              <p className="text-sm text-gray-600 mt-1 ml-24">
                {criteriaDescriptions.userExperience}
              </p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <StarRating
                rating={formData.innovation}
                onRatingChange={(rating) => handleCriteriaChange('innovation', rating)}
                label="Innovation"
                size="md"
              />
              <p className="text-sm text-gray-600 mt-1 ml-24">
                {criteriaDescriptions.innovation}
              </p>
            </div>
          </div>

          {/* Overall Rating Display */}
          {formData.rating > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Rating:</span>
                <StarRating
                  rating={formData.rating}
                  readonly
                  showValue
                  size="md"
                />
              </div>
            </div>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Feedback
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Share your detailed thoughts about this project. What did you like? What could be improved? Be specific and constructive..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-gray-500">
              Minimum 20 characters required for a helpful review
            </p>
            <p className="text-sm text-gray-500">
              {formData.comment.length}/2000
            </p>
          </div>
          {formData.comment.length > 0 && formData.comment.length < 20 && (
            <p className="text-sm text-red-600 mt-1">
              Please provide more detailed feedback (at least 20 characters)
            </p>
          )}
        </div>

        {/* Form Validation Status */}
        {!isFormValid() && (formData.codeQuality > 0 || formData.comment.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
              <div className="text-sm text-yellow-700">
                Please complete all rating criteria and provide detailed feedback (minimum 20 characters)
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}