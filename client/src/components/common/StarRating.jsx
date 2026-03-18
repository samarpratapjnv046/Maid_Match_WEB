import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 16, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${onChange ? 'cursor-pointer transition-colors' : ''} ${i < Math.round(rating) ? 'fill-[#C9A84C] text-[#C9A84C]' : 'fill-none text-gray-300'}`}
          onClick={() => onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
