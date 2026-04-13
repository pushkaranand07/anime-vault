'use client';

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Image skeleton */}
      <div className="h-52 skeleton flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Title */}
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />

        {/* Rating */}
        <div className="skeleton h-3 w-24 rounded" />

        {/* Genres */}
        <div className="flex gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>

        {/* Progress */}
        <div className="mt-auto pt-2">
          <div className="skeleton h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
