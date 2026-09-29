import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const starSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSizeClass = starSizes[size] || starSizes.sm;

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const isFilled = star <= Math.floor(rating);
        const isHalf = !isFilled && star - 0.5 <= rating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${iconSizeClass} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
