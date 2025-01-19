import React from 'react'

export function UserCommentSkeleton() {
    return (
        <div className="w-full mx-auto p-4 space-y-4 bg-white ring-1 ring-ash dark:bg-light/20 rounded-lg">
            {/* Post skeleton */}
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    {/* Avatar skeleton */}
                    <div className="w-12 h-12 rounded-full bg-ash animate-pulse" />
                    <div className="space-y-2">
                        {/* Name skeleton */}
                        <div className="h-3 w-32 bg-ash animate-pulse rounded-full" />
                        {/* Timestamp skeleton */}
                        <div className="h-2 w-24 bg-ash animate-pulse rounded-full" />
                    </div>
                </div>
                {/* Content skeleton */}
                <div className="space-y-2 grid">
                    <div className="h-2 w-full bg-ash animate-pulse rounded-full" />
                    <div className="h-2 w-5/6 bg-ash animate-pulse rounded-full" />
                    <div className="h-2 w-3/6 bg-ash animate-pulse rounded-full" />
                </div>
            </div>

            {/* Reply skeleton */}
            <div className="ml-12 space-y-4 dark:bg-light/20 p-2 bg-ash/40 rounded-lg">
                <div className="flex items-center space-x-4">
                    {/* Avatar skeleton */}
                    <div className="w-10 h-10 rounded-full bg-light/60 animate-pulse" />
                    <div className="space-y-2">
                        {/* Name skeleton */}
                        <div className="h-2 w-28 bg-light/60 animate-pulse rounded-full" />
                        {/* Timestamp skeleton */}
                        <div className="h-2 w-20 bg-light/60 animate-pulse rounded-full" />
                    </div>
                </div>
                {/* Reply content skeleton */}
                <div className="h-2 w-3/4 bg-light/60 animate-pulse rounded-full" />
            </div>
        </div>
    )
}

