'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  label?: string;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'md',
  showValue = false,
  label 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-gray-700 min-w-0">
          {label}
        </span>
      )}
      
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-all duration-150 ease-in-out
              ${!readonly ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded' : ''}
            `}
          >
            <Star 
              className={`
                ${sizes[size]}
                transition-colors duration-150
                ${star <= displayRating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-200 text-gray-300'
                }
                ${!readonly && hoverRating >= star ? 'fill-yellow-300 text-yellow-300' : ''}
              `}
            />
          </button>
        ))}
        
        {showValue && (
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {rating.toFixed(1)}
          </span>
        )}
      </div>
    </div>
  );
}