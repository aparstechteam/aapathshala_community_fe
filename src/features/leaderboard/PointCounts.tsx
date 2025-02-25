import { NType } from '@/@types'
import { colors, fromNow, iconMap, NotificationIcon } from '@/components'
import { cn } from '@/lib/utils'
import { TScore } from '@/pages/leaderboard/points'
import React from 'react'

type Props = {
    score: TScore[]
    total: number
    page: number
    setPage: (page: number) => void
    title: string
}

export const PointsCount = (props: Props) => {

    const { score, total, page, setPage, title } = props

    return (
        <div className='max-w-screen-xl w-full mx-auto py-5'>
            <div className='ring-1 ring-ash rounded-xl p-5 bg-white'>
                <div className="flex items-center gap-2 text-lg py-2 font-semibold text-gray-700 dark:text-gray-200">
                    <NotificationIcon type="score_count" />
                    {title}
                </div>
                <div className='grid divide-y divide-ash'>
                    {score.map((x, index) => (
                        <div key={index}>
                            <div
                                key={x?.id}
                                className="flex items-center justify-between gap-2 py-2"
                            >
                                <div className='flex gap-2'>
                                    <NotificationIcon type={x?.type as NType} />
                                    <div>
                                        <p className="text-gray-700 capitalize text-start">
                                            {x?.type?.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs dark:text-gray-400 text-light">
                                            {fromNow(new Date(x?.created_at))}
                                        </p>
                                    </div>
                                </div>
                                <div className='px-2'>
                                    <p className={cn(colors[Object.keys(iconMap).indexOf(x.type)], 'rounded-full px-3 text-sm md:text-base bg-opacity-20')}>
                                        +{x.points}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='flex py-2 items-center justify-center text-sm'>
                    <button disabled={page === total} type='button' onClick={() => setPage(page + 1)}>See More</button>
                </div>
            </div>
        </div>
    )
}