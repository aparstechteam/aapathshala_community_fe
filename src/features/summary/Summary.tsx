import { Summary } from '@/@types'
import React, { useState } from 'react'
import { Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@/components'
import { useToast } from '@/hooks/use-toast'
import axios, { AxiosError } from 'axios'
import { secondaryAPI } from '@/configs'
import { handleError } from '@/hooks/error-handle'
import dynamic from 'next/dynamic'
const AppMath = dynamic(() => import('@/components/contexts/MathJAX'), { ssr: false })

type Props = {
    data: { summary: Summary[], reaction: string }
    loading: boolean
    postId: string
}

export const SummaryComponent = (props: Props) => {

    const { data, loading, postId } = props
    const { toast } = useToast()
    const [reaction, setReaction] = useState<string>(data?.reaction)

    async function handleReact(r: string) {
        try {
            const res = await axios.post(`${secondaryAPI}/api/post/${postId}/summary/react`, { reaction: r }, {
                // withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (res.data) {
                setReaction(r)
                toast({
                    title: 'মতামতের জন্য ধন্যবাদ',
                    description: 'আপনার মতামতের ভিত্তিতে আমরা এই বিষয়টি আরও ভালো করার চেষ্টা করব।',
                    variant: 'default'
                })
            }
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            })
            handleError(err as AxiosError, () => handleReact(r))
        }
    }

    return data.summary.length > 0 ? (
        <div className='grid bg-white shadow rounded-lg dark:bg-green-900/30 p-4 gap-4 !text-gray-700 dark:!text-gray-200'>
            <h2 className='text-xl font-semibold py-3 flex items-center gap-2'>
                <span className='p-2 rounded-full bg-gradient-to-r text-green-600 from-teal-600/20 to-green-300/20'><Lightbulb /></span>
                <span className='bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent'>Summary</span>
            </h2>
            <div className='space-y-4 px-3'>
                {data.summary?.map((s, index) => (
                    <div key={s.id}>
                        <div className='text-base flex items-center gap-1 font-semibold dark:text-gray-100'>
                            <span>{index + 1}. </span> <AppMath key={index} formula={s.question} />
                        </div>
                        <div className='text-base font-normal text-gray-500 dark:text-gray-100'>
                            <AppMath key={index + 1} formula={s.answer || ''} />
                        </div>
                    </div>
                ))}
            </div>
            <div className='p-2 space-y-3 text-gray-700 dark:text-gray-100'>
                <h2 className='font-medium text-base text-center'>আলোচ্য বিষয়টি কি তুমি বুঝতে পেরেছো?</h2>
                <div className='flex items-center justify-center gap-3'>
                    <Button type='button'
                        onClick={() => {
                            handleReact('useful')
                        }}
                        className={`w-20 !p-0 ring-[green]/20 text-green-600 dark:ring-ash/50 ${reaction === 'useful' ? 'bg-green-600/80 ring-0 text-white dark:bg-green-600/10' : 'ring-0 bg-green-600/10 dark:bg-green-600/10'}`}
                        size='sm'><span className='pt-0.5'>হ্যাঁ</span> <ThumbsUp /></Button>
                    <Button type='button'
                        onClick={() => {
                            handleReact('not_useful')
                        }}
                        className={`w-20 !p-0 text-red-600 dark:ring-ash/50 ${reaction === 'not_useful' ? 'bg-red-600/80 ring-0 text-white dark:bg-red-600/10' : 'ring-0 bg-red-600/10 dark:bg-red-600/10'}`}
                        size='sm'><span className='pt-0.5'>না</span> <ThumbsDown /></Button>
                </div>
            </div>
        </div>
    ) : (loading ? (
        <div className='bg-white shadow rounded-lg dark:bg-green-900/30 p-4'></div>
    ) : (
        <div className='bg-white shadow rounded-lg dark:bg-green-900/30 p-4'>
            <h2 className='text-xl font-semibold py-3 flex items-center gap-2'>
                <span className='p-2 rounded-full bg-gradient-to-r text-green-600 from-teal-600/20 to-green-300/20'><Lightbulb /></span>
                <span className='bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent'>Summary</span>
            </h2>
            <p className='text-center text-gray-500 dark:text-gray-100'>Summary is not available for this post.</p>
        </div>
    )
    )
}