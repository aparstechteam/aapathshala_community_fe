import { MessageCircle, Rss, Star } from 'lucide-react'
import React from 'react'

type Props = {
    data: {
        totalPosts: number
        totalComments: number
        totalSatisfied: number
    }
}

export const MobileDashCard = (props: Props) => {
    const { data } = props
    return (
        <div className='flex flex-col md:hidden gap-2 md:gap-4 p-4 md:p-6 bg-background/95 rounded-xl border shadow-sm'>
            <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <span className='bg-green-500/20 text-green-500 rounded-full p-2.5'><Rss className="h-5 w-5" /></span>
                    <h2 className='font-semibold text-foreground/80'>Total Posts</h2>
                </div>
                <span className='font-bold text-2xl text-foreground'>{data?.totalPosts}</span>
            </div>
            <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                    <span className='bg-green-500/20 text-green-500 rounded-full p-2.5'><MessageCircle className="h-5 w-5" /></span>
                    <h2 className='font-semibold text-foreground/80'>Total Comments</h2>
                </div>
                <span className='font-bold text-2xl text-foreground'>{data?.totalComments}</span>
            </div>
            <div className='flex items-center gap-4 justify-between'>
                <div className='flex items-center gap-3'>
                    <span className='bg-green-500/20 text-green-500 rounded-full p-2.5'><Star className="h-5 w-5" /></span>
                    <h2 className='font-semibold text-foreground/80'>Total Score</h2>
                </div>
                <span className='font-bold text-2xl text-foreground'>{data?.totalSatisfied}</span>
            </div>
        </div>
    )
}