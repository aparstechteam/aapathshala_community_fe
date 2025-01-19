import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-gray-300 dark:bg-slate-700 w-full relative z-[3] h-64 animate-pulse rounded-xl p-4 gap-4">
      <div className="flex items-center gap-2 z-[4]">
        <div className="bg-gray-400 dark:bg-slate-600 w-12 h-12 animate-pulse rounded-full"></div>
        <div className="space-y-2">
          <div className="bg-gray-400 dark:bg-slate-500 w-[230px] h-4 animate-pulse rounded-md"></div>
          <div className="bg-gray-400 dark:bg-slate-500 w-[130px] h-4 animate-pulse rounded-md"></div>
        </div>
      </div>

      <div className="bg-gray-400 dark:bg-slate-600 w-full h-32 animate-pulse rounded-md"></div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-400 dark:bg-slate-500 h-8 animate-pulse rounded-md"></div>
        <div className="bg-gray-400 dark:bg-slate-500 h-8 animate-pulse rounded-md"></div>
        <div className="bg-gray-400 dark:bg-slate-500 h-8 animate-pulse rounded-md"></div>
      </div>
    </div>
  );
};

