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

export const GroupSkeleton: React.FC = () => {
  return (
    <div className='max-w-screen-2xl gap-4 py-5 px-0 lg:px-4 w-full mx-auto flex'>
      <div className='w-[250px] h-[250px] p-2 bg-ash grid gap-2 rounded-xl'>
        <div className='w-full h-full p-1 bg-light/30 animate-pulse rounded-xl'>
          <div className='w-10 h-full bg-light/30 rounded-xl'></div>
        </div>
        <div className='w-full h-full p-1 bg-light/30 animate-pulse rounded-xl'>
          <div className='w-10 h-full bg-light/30 rounded-xl'></div>
        </div>
        <div className='w-full h-full p-1 bg-light/30 animate-pulse rounded-xl'>
          <div className='w-10 h-full bg-light/30 rounded-xl'></div>
        </div>
        <div className='w-full h-full p-1 bg-light/30 animate-pulse rounded-xl'>
          <div className='w-10 h-full bg-light/30 rounded-xl'></div>
        </div>
      </div>
      <div className='w-full flex flex-col gap-4'>
        <div className='w-full h-[250px] bg-ash rounded-xl animate-pulse'>

        </div>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />

      </div>
    </div>
  );
};

