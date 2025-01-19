import { Reaction } from '@/@types'
import { reactionTabs } from '@/data/reactions'
import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
    reacts: Reaction[]
}

export const ReactCounts = (props: Props) => {
    const { reacts } = props

    const filteredIcons = reactionTabs.filter((x) => reacts.some((y) => x.value === y.type))
    return (
        <div className='flex items-center'>
            {filteredIcons.map((r, i) => {
                return (
                    <span key={i.toString()} className={cn('h-5 w-5 rounded-full', r.color,
                        i > 0 && '-ml-2'
                    )}>{r.icon}</span>
                )
            })}
        </div>
    )
}