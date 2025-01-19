import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = {
    loading?: boolean
}

export const PageLoaders = (props: Props) => {
    return (
        <div className={cn('h-screen bg-[#f5f5f5] dark:bg-[#171717] pt-10 grid items-center w-full justify-center')}>
            <Loader2 size={30} className={cn(props?.loading && "animate-spin", "text-green-500")} />
        </div>
    )
}