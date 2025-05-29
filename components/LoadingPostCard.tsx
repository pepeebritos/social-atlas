
'use client';

import { Skeleton } from 'components/ui/skeleton';

export default function LoadingPostCard() {
  return (
    <div className="bg-[#2e2e2e] p-4 rounded-xl shadow-md border border-[#444] w-full aspect-[4/5] animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-md bg-gray-600" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-24 h-3 bg-gray-600 rounded" />
          <Skeleton className="w-16 h-2 bg-gray-600 rounded" />
        </div>
      </div>
      <Skeleton className="w-full h-48 rounded-lg bg-gray-700" />
      <div className="mt-3 flex items-center gap-4">
        <Skeleton className="w-16 h-4 bg-gray-600 rounded" />
        <Skeleton className="w-20 h-4 bg-gray-600 rounded" />
      </div>
    </div>
  );
}
