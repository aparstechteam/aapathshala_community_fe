/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useEffect, useState } from "react"
import { useComments } from "@/hooks"
import { cn } from "@/lib/utils"
import axios, { AxiosError } from "axios"
import Head from "next/head"
import { useRouter } from "next/router"
import { NextPage } from "next"
import { Layout, PageLoaders, Tabs, TabsContent, TabsList, TabsTrigger, useUser } from "@/components"
import { Comment, Post, Summary } from "@/@types"
import { AddComment, CommentComponent, PostComponent, QuizComponent, SummaryComponent } from "@/features"
import { secondaryAPI } from "@/configs"
import { handleError } from "@/hooks/error-handle"
import { Loader2 } from "lucide-react"
import Image from "next/image"

const PostDetailsPage: NextPage = () => {

    const router = useRouter()
    const id = router?.query?.slug

    const { user } = useUser()

    const [post, setPost] = useState<Post>()
    const [comments, setComments] = useState<Comment[]>([])
    const [summary, setSummary] = useState<Summary[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)
    const [commentText, setCommentText] = useState<string>('');
    const [reaction, setReaction] = useState<string>('');
    const [cmntLoading, setCmntLoading] = useState<boolean>(false)
    const [summaryLoading, setSummaryLoading] = useState<boolean>(false)
    const [aiLoading, setAiLoading] = useState<boolean>(false)
    const [cmntFetching, setCmntFetching] = useState<boolean>(false)

    const { addComment } = useComments()

    useEffect(() => {
        async function getPost() {
            try {
                setLoading(true)
                if (!!id && !!user?.id) {
                    const response = await axios.get(`${secondaryAPI}/api/post/${id}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'X-Key-Id': user?.id
                        }
                    })
                    setPost(response.data)
                    setLoading(false)
                }
            } catch (err) {
                setLoading(false)
                handleError(err as AxiosError, getPost)
            }
        }
        getPost()
    }, [id, user, success])

    useEffect(() => {

        async function getComments(aiok?: boolean) {
            try {
                setCmntLoading(true)

                const response = await axios.get(`${secondaryAPI}/api/post/${id}/comments`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'X-Key-Id': user?.id
                    }
                })
                setComments(response.data.data)
                if (response.data.data.length === 0 && !!aiok) {
                    setTimeout(() => {
                        getAiReply()
                    }, 300)
                }
                setCmntLoading(false)
            } catch (err) {
                setCmntLoading(false)
                handleError(err as AxiosError)
            }
        }

        async function getAiReply() {
            try {
                setAiLoading(true)
                const res = await axios.post(`${secondaryAPI}/api/post/${id}/comments/ai`, { id }, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (res.status === 200) {
                    setTimeout(() => {
                        getComments(false)
                    }, 300)
                    return
                }
            } catch (err) {
                setAiLoading(false)
                handleError(err as AxiosError)
            }
        }

        if (!!id && !!post?.id && !!user?.id) {
            getComments(post?.ai_enabled)
        }
    }, [id, post, user])

    useEffect(() => {
        async function getSummary() {
            try {
                if (!!id) {
                    setSummaryLoading(true)
                    const res = await axios.get(`${secondaryAPI}/api/post/${id}/summary`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            'Content-Type': 'application/json',
                        }
                    });
                    setSummary(res.data.items)
                    setReaction(res.data.reaction)
                    setSummaryLoading(false)
                }
            } catch (err) {
                setSummaryLoading(false)
                handleError(err as AxiosError, getSummary)
            }
        }
        getSummary()
    }, [id, post])

    const submitComment = async (image: string | null) => {
        try {
            setCmntFetching(true)
            if (image) {
                await addComment(commentText, image, null)
            } else {
                await addComment(commentText)
            }
            setCommentText('');
            if (setSuccess)
                setSuccess(true)
            setCmntFetching(false)
        } catch (err) {
            setCmntFetching(false)
            setLoading(false)
            handleError(err as AxiosError, () => submitComment(image))
        }
    };

    return (
        <>
            <Head>
                <title>Post</title>
            </Head>
            <Layout variant="other">
                <div className="min-h-[calc(100vh-80px)] pt-10 xl:pt-5 w-full">
                    <div>
                        {!post && loading && (
                            <PageLoaders loading={loading} />
                        )}
                    </div>

                    {!!post && (
                        <div className="pb-10">
                            <div className='!max-w-3xl px-2 min-h-[calc(100vh-80px)] mx-auto space-y-2 w-full lg:pt-4 -mt-2 lg:mt-0'>

                                <PostComponent post={post as Post} setSuccess={() => setSuccess(!success)} />

                                <Tabs defaultValue='discussion'>
                                    <TabsList className={cn('w-full items-center hidden justify-between !bg-white ring-1 !ring-ash dark:!ring-ash/20 dark:!bg-[#202127] !rounded-full',
                                        post?.category !== 'course' && 'flex',
                                        post?.category === 'course' && 'hidden'
                                    )}>
                                        <TabsTrigger className='w-full pb-1 !rounded-full' value={'discussion'}>ডিসকাশন</TabsTrigger>
                                        <TabsTrigger disabled className='w-full pb-1 !rounded-full cursor-not-allowed' value={'summary'}>বিস্তারিত</TabsTrigger>
                                        <TabsTrigger disabled className='w-full pb-1 cursor-not-allowed !rounded-full' value={'quiz'}>কুইজ</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value={'discussion'}>
                                        <div className='p-4 rounded-lg bg-white dark:bg-[#202127] shadow-sm'>

                                            {/* Add Comment  */}
                                            {post?.canComment && (
                                                <AddComment loading={cmntFetching} commentText={commentText} setCommentText={setCommentText} submitComment={(i: string | null) => submitComment(i)} />
                                            )}

                                            {/* Comments List */}
                                            {aiLoading ? (
                                                <div className="text-center justify-center grid py-8">
                                                    <Image src={'/ai.png'} alt='ai' width={100} height={100} className='mx-auto animate-bounce' />
                                                    <span className="text-base font-medium text-light animate-pulse dark:text-gray-200">কিউরিওসিটি তোমার উত্তর প্রস্তুত করছে...</span>
                                                </div>
                                            ) : (comments.length === 0 && cmntLoading && (
                                                <div className="flex justify-center items-center py-8">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                </div>
                                            )
                                            )}

                                            {comments.length > 0 && (
                                                <div className='pt-4'>
                                                    {comments?.map((c: Comment) => (
                                                        <CommentComponent key={c?.id} comment={c} authorId={post?.userId}
                                                            parentCommentId={c?.id}
                                                            setSuccess={() => setSuccess(!success)} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value={'quiz'}>
                                        <div>
                                            <QuizComponent post_id={id as string} />
                                        </div>
                                    </TabsContent>
                                    <TabsContent value={'summary'}>
                                        <SummaryComponent data={{ summary: summary, reaction: reaction }} loading={summaryLoading} postId={id as string} />
                                    </TabsContent>
                                </Tabs>

                            </div>
                        </div>
                    )}
                </div>
            </Layout>
        </>
    )
}

export default memo(PostDetailsPage);
