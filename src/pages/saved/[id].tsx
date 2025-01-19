import { Post } from '@/@types'
import { Layout, PostSkeleton, useUser } from '@/components'
import { secondaryAPI } from '@/configs'
import { PostComponent } from '@/features'
import { handleError } from '@/hooks/error-handle'
import axios, { AxiosError } from 'axios'
import { ArrowLeftIcon } from 'lucide-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'

const SavedPage = () => {

    const { user } = useUser()
    const router = useRouter()
    const { id } = router.query

    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [success, setSuccess] = useState(false)

    const loadMoreTrigger = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const getPosts = async () => {
            try {
                setError('')
                setLoading(true);
                if (!!user?.id) {

                    const POST_API_URL = `${secondaryAPI}/api/post/saved_posts/${id}`;

                    const response = await axios.get(POST_API_URL, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'X-Key-Id': user?.id
                        }
                    });
                    const newPosts = await response.data.data;
                    if (posts.length === 0) {
                        setPosts(newPosts);
                    } else {
                        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
                    }
                    setIsFetching(false)
                    setHasMore(newPosts.length > 0);
                }
                setLoading(false);
            } catch (err) {
                handleError(err as AxiosError, () => getPosts())
                setError('Failed to fetch posts');
                setLoading(false);
            }
        };
        if (!!id) getPosts();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, user, success, id]);

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


    const updateReact = async (postId: string, t: string) => {
        const u = posts?.map((post) => {
            if (post.id === postId) {
                const existingReaction = post.reactions.find(x => x.user.id === user.id);
                if (existingReaction) {
                    existingReaction.type = t;
                } else {
                    post?.reactions?.push({ type: t, user: { id: user?.id, name: user?.name, profilePic: user?.profilePic, role: user?.role as string } });
                }
            }
            return post
        })
        setPosts(u)
    }


    return (
        <>
            <Head>
                <title>Saved Posts</title>
            </Head>
            <Layout>
                <div className='min-h-[calc(100vh-80px)] max-w-6xl mx-auto w-full p-4'>
                    <div className="grid gap-2 w-full">

                        {error && (<div>Error: {error}</div>)}
                        <h2 className='text-lg text-elegant/50 md:text-xl flex items-center gap-2 font-bold py-2'>
                            <button type='button' onClick={() => router.back()} className='text-base transition-all duration-300'>
                                <ArrowLeftIcon className='w-4 h-4' />
                            </button>
                            সেভ করা পোস্ট
                        </h2>
                        <div className="grid gap-2 w-full">
                            {posts?.map((post) => (
                                <PostComponent
                                    key={post?.id}
                                    post={post}
                                    updateReact={(t) => updateReact(post.id, t)}
                                    setSuccess={() => setSuccess((prev) => !prev)}
                                />
                            ))}
                            {loading && (<PostSkeleton />)}
                            {loading && posts.length === 0 && (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <PostSkeleton key={index} />
                                ))
                            )}
                            {hasMore && <div ref={loadMoreTrigger} className="h-10 w-full" />}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default SavedPage