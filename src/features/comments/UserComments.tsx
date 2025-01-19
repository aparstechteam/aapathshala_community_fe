import { UserComment } from '@/@types'
import { fromNow, UserCommentSkeleton } from '@/components'
import { ValidImage } from '@/components/shared/ValidImage'
import { secondaryAPI } from '@/configs'
import { handleError } from '@/hooks/error-handle'
import { cn } from '@/lib/utils'
import axios, { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
const AppMath = dynamic(() => import('../../components/contexts/MathJAX'), { ssr: false });

type UserData = {
    id: string;
    name: string;
    school: string;
    user_profile_pic: string;
    courses: string[];
    followers: number;
    following: number;
    is_paid: boolean;
    image: string;
};

type Props = {
    authorId: string
    startDate: Date | string
    endDate: Date | string
    user: UserData
}

export const UserComments = (props: Props) => {
    const { authorId, startDate, endDate, user } = props
    const [comments, setComments] = useState<UserComment[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [isFetching, setIsFetching] = useState<boolean>(false)

    const loadMoreTrigger = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function getComments() {
            try {
                setLoading(true)
                const res = await axios.get(`${secondaryAPI}/api/comments/${authorId}?page=${page}&start_date=${startDate}&end_date=${endDate}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                const newComments = await res.data.data;
                if (comments.length === 0) {
                    setComments(newComments);
                } else {
                    setComments((prevComments) => [...prevComments, ...newComments]);
                }
                setIsFetching(false)
                setPage(page);
                setHasMore(newComments.length > 0);
                setLoading(false)
                if (res.data.data.length === 0)
                    setError('No comments found')
            } catch (err) {
                setLoading(false)
                handleError(err as AxiosError, () => getComments())
            }
        }
        getComments()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authorId, startDate, endDate, page])


    useEffect(() => {
        const handleScroll = () => {
            if (loading || !hasMore || isFetching) return;

            const triggerElement = loadMoreTrigger.current;
            if (!triggerElement) return;

            const { top } = triggerElement.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (top <= windowHeight) {
                setIsFetching(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, isFetching]);

    useEffect(() => {
        if (!isFetching) return;

        setTimeout(() => {
            setPage(page + 1);
            setIsFetching(false);
        }, 300);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching]);


    return (
        <div className='space-y-4 w-full'>
            {loading && (
                <div className='flex items-center justify-center'>
                    <Loader2 size={24} className='animate-spin' />
                </div>
            )}
            {error && comments.length === 0 && (
                <div className='flex items-center justify-center'>
                    <p className='text-red-500 px-5 pt-1 rounded-md bg-red-500/10'>{error}</p>
                </div>
            )}

            {comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-lg bg-white ring-gray-200 ring-1 text-black dark:text-white dark:ring-gray-800/20 dark:bg-gray-800/20 dark:bg-opacity-20">

                    <div className='p-3'>
                        <div className='flex items-center gap-2'>
                            <div className="relative h-[30px] w-[30px]">
                                <ValidImage
                                    height={30}
                                    width={30}
                                    className="rounded-full cursor-pointer ring-2 ring-ash hover:ring-ash/50 transition-all duration-300"
                                    src={comment.user_profile_pic as string}
                                    alt="Profile"
                                />
                                <span className="absolute bottom-1 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-gray-200 dark:border-gray-900"></span>
                            </div>
                            <div>
                                <p className='text-sm font-semibold'>{comment.user_name || 'Anonymous'}</p>
                                <p className='text-xs text-light'>{fromNow(comment?.created_at as Date)}</p>
                            </div>
                        </div>
                        <AppMath formula={comment.post_body} />
                        <Link href={`/post/${comment.post_id}`} className='text-sm text-light'>View Post</Link>
                    </div>

                    <div className="flex items-start space-x-3 bg-[#F5F6F7] p-3 rounded-lg">
                        <div className="relative h-[30px] w-[30px]">
                            <ValidImage
                                height={30}
                                width={30}
                                className="rounded-full cursor-pointer ring-2 ring-ash hover:ring-ash/50 transition-all duration-300"
                                src={user.image as string}
                                alt="Profile"
                            />
                            <span className="absolute bottom-1 right-0 w-2 h-2 bg-life rounded-full border-2 border-gray-200 dark:border-gray-900"></span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex w-full gap-1 items-center justify-between">
                                <Link href={`/users/${comment.user_id}`} className="text-sm font-semibold capitalize">
                                    {user.name || 'Anonymous'}
                                </Link>
                                <time className="text-xs text-light">
                                    {fromNow(comment?.created_at as Date)}
                                </time>
                            </div>
                            <div className="rounded-md bg-muted">
                                <AppMath formula={comment.content} />
                            </div>

                        </div>
                    </div>
                    <div className='flex items-center gap-4 pt-2 px-4'>
                        <button type='button' className={`flex items-center gap-1 ${comment.satisfied ? 'text-elegant font-bold' : ''}`}
                        // onClick={() => reactToComment('satisfied')}
                        >
                            {comment.satisfied ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_1105_11284)">
                                        <path d="M12.9522 15.7573L9.99887 14.2046L7.04555 15.7573C5.90457 16.3569 4.57078 15.3872 4.78856 14.1174L5.35258 10.8289L2.96328 8.49994C2.04039 7.60025 2.55035 6.03193 3.82535 5.8467L7.12727 5.36689L8.60395 2.37486C9.17489 1.21807 10.8236 1.21951 11.3937 2.3749L12.8704 5.36689L16.1723 5.8467C17.4474 6.03197 17.9572 7.60037 17.0344 8.49994L14.6451 10.8289L15.2091 14.1174C15.4266 15.3844 14.0946 16.3578 12.9522 15.7573Z" fill="#CF96E9" />
                                        <path d="M4.18249 2.62665L3.38518 1.52926C3.16877 1.23141 3.23479 0.814458 3.53264 0.598091C3.83045 0.381646 4.24737 0.4477 4.46381 0.745513L5.26112 1.84286C5.47752 2.14071 5.41151 2.55766 5.11366 2.77403C4.816 2.9904 4.39905 2.92458 4.18249 2.62665Z" fill="#CF96E9" />
                                        <path d="M0.0328178 12.5174C-0.0809712 12.1672 0.11063 11.7911 0.460826 11.6773L1.77708 11.2497C2.12731 11.1357 2.50333 11.3275 2.61711 11.6777C2.7309 12.0278 2.5393 12.404 2.18911 12.5177L0.872857 12.9454C0.523599 13.059 0.146802 12.8682 0.0328178 12.5174Z" fill="#CF96E9" />
                                        <path d="M10.0026 19.532C9.63441 19.532 9.33594 19.2336 9.33594 18.8654V17.5123C9.33594 17.1442 9.63441 16.8457 10.0026 16.8457C10.3707 16.8457 10.6692 17.1442 10.6692 17.5123V18.8654C10.6693 19.2335 10.3708 19.532 10.0026 19.532Z" fill="#CF96E9" />
                                        <path d="M16.1735 5.84672L12.8716 5.36691L11.3949 2.37492C11.1098 1.79715 10.5549 1.50789 10 1.50781V14.2046L12.9534 15.7574C14.0957 16.3579 15.4276 15.3845 15.2104 14.1175L14.6463 10.829L17.0357 8.50004C17.9584 7.60043 17.4486 6.03199 16.1735 5.84672Z" fill="#8A00CA" />
                                        <path d="M15.8154 2.62661L16.6127 1.52926C16.8291 1.23141 16.7631 0.814458 16.4652 0.598091C16.1674 0.381646 15.7505 0.4477 15.534 0.745513L14.7367 1.84286C14.5203 2.14071 14.5864 2.55766 14.8842 2.77403C15.1819 2.99036 15.5988 2.92454 15.8154 2.62661Z" fill="#8A00CA" />
                                        <path d="M19.9687 12.5174C20.0825 12.1672 19.8909 11.7911 19.5407 11.6773L18.2244 11.2497C17.8742 11.1357 17.4982 11.3275 17.3844 11.6777C17.2706 12.0278 17.4622 12.404 17.8124 12.5177L19.1286 12.9454C19.4779 13.059 19.8547 12.8682 19.9687 12.5174Z" fill="#8A00CA" />
                                        <path d="M10 16.8457V19.5321C10.3682 19.5321 10.6666 19.2336 10.6666 18.8654V17.5124C10.6667 17.1441 10.3682 16.8457 10 16.8457Z" fill="#8A00CA" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_1105_11284">
                                            <rect width="20" height="20" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            ) : (
                                <span className='text-light'>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_1105_11284)">
                                            <path d="M12.9522 15.7573L9.99887 14.2046L7.04555 15.7573C5.90457 16.3569 4.57078 15.3872 4.78856 14.1174L5.35258 10.8289L2.96328 8.49994C2.04039 7.60025 2.55035 6.03193 3.82535 5.8467L7.12727 5.36689L8.60395 2.37486C9.17489 1.21807 10.8236 1.21951 11.3937 2.3749L12.8704 5.36689L16.1723 5.8467C17.4474 6.03197 17.9572 7.60037 17.0344 8.49994L14.6451 10.8289L15.2091 14.1174C15.4266 15.3844 14.0946 16.3578 12.9522 15.7573Z" fill="currentColor" />
                                            <path d="M4.18249 2.62665L3.38518 1.52926C3.16877 1.23141 3.23479 0.814458 3.53264 0.598091C3.83045 0.381646 4.24737 0.4477 4.46381 0.745513L5.26112 1.84286C5.47752 2.14071 5.41151 2.55766 5.11366 2.77403C4.816 2.9904 4.39905 2.92458 4.18249 2.62665Z" fill="currentColor" />
                                            <path d="M0.0328178 12.5174C-0.0809712 12.1672 0.11063 11.7911 0.460826 11.6773L1.77708 11.2497C2.12731 11.1357 2.50333 11.3275 2.61711 11.6777C2.7309 12.0278 2.5393 12.404 2.18911 12.5177L0.872857 12.9454C0.523599 13.059 0.146802 12.8682 0.0328178 12.5174Z" fill="currentColor" />
                                            <path d="M10.0026 19.532C9.63441 19.532 9.33594 19.2336 9.33594 18.8654V17.5123C9.33594 17.1442 9.63441 16.8457 10.0026 16.8457C10.3707 16.8457 10.6692 17.1442 10.6692 17.5123V18.8654C10.6693 19.2335 10.3708 19.532 10.0026 19.532Z" fill="currentColor" />
                                            <path d="M16.1735 5.84672L12.8716 5.36691L11.3949 2.37492C11.1098 1.79715 10.5549 1.50789 10 1.50781V14.2046L12.9534 15.7574C14.0957 16.3579 15.4276 15.3845 15.2104 14.1175L14.6463 10.829L17.0357 8.50004C17.9584 7.60043 17.4486 6.03199 16.1735 5.84672Z" fill="currentColor" />
                                            <path d="M15.8154 2.62661L16.6127 1.52926C16.8291 1.23141 16.7631 0.814458 16.4652 0.598091C16.1674 0.381646 15.7505 0.4477 15.534 0.745513L14.7367 1.84286C14.5203 2.14071 14.5864 2.55766 14.8842 2.77403C15.1819 2.99036 15.5988 2.92454 15.8154 2.62661Z" fill="currentColor" />
                                            <path d="M19.9687 12.5174C20.0825 12.1672 19.8909 11.7911 19.5407 11.6773L18.2244 11.2497C17.8742 11.1357 17.4982 11.3275 17.3844 11.6777C17.2706 12.0278 17.4622 12.404 17.8124 12.5177L19.1286 12.9454C19.4779 13.059 19.8547 12.8682 19.9687 12.5174Z" fill="currentColor" />
                                            <path d="M10 16.8457V19.5321C10.3682 19.5321 10.6666 19.2336 10.6666 18.8654V17.5124C10.6667 17.1441 10.3682 16.8457 10 16.8457Z" fill="#8A00CA" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1105_11284">
                                                <rect width="20" height="20" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </span>
                            )}

                            <span className={cn('text-elegant', comment.satisfied ? 'text-elegant' : 'text-light')}>Satisfied</span>
                            <p className='flex items-center gap-1'>
                                <span className={cn('pt-0.5 ring-1 min-w-7 font-semibold rounded-full px-2 text-xs', comment.satisfied ? 'text-elegant bg-elegant/10 ring-elegant/50' : 'text-light bg-light/10 ring-light/50')}>
                                    {comment.satisfied_count}
                                </span>
                            </p>
                        </button>


                        <Link href={`/post/${comment.post_id}`} className='text-sm flex items-center gap-1 text-light'>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.78033 4.28033C7.07322 3.98744 7.07322 3.51256 6.78033 3.21967C6.48744 2.92678 6.01256 2.92678 5.71967 3.21967L2.21967 6.71967C1.92678 7.01256 1.92678 7.48744 2.21967 7.78033L5.71967 11.2803C6.01256 11.5732 6.48744 11.5732 6.78033 11.2803C7.07322 10.9874 7.07322 10.5126 6.78033 10.2197L4.56066 8H8.25C10.5972 8 12.5 9.90279 12.5 12.25C12.5 12.6642 12.8358 13 13.25 13C13.6642 13 14 12.6642 14 12.25C14 9.07436 11.4256 6.5 8.25 6.5H4.56066L6.78033 4.28033Z" fill="#575757" />
                            </svg>

                            <span className='text-light'>Reply</span>
                        </Link>
                    </div>
                </div>
            ))}
            {loading && <UserCommentSkeleton />}
            {hasMore && <div ref={loadMoreTrigger} className="h-10 w-full" />}
        </div >
    )
}