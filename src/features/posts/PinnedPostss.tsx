'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Share2, ThumbsUp, PinOff } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Post, UserData } from '@/@types'
import { fromNow, useUser } from '@/components'
import { ValidImage } from '@/components/shared/ValidImage'

export function PinnedPostss({ posts, unpin }: { posts: Post[], unpin: (id: number | string) => void }) {

    const { user } = useUser()

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Pinned Posts - Horizontal Scrolling */}
            <div className="space-y-4">
                <ScrollArea className="w-full max-w-4xl whitespace-nowrap rounded-lg pb-4">
                    <div className="flex space-x-4 p-1">
                        {posts.map((post) => (
                            <div key={post.id} className="flex-shrink-0">
                                <PostCard post={post} unpin={unpin} user={user} />
                            </div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    )
}


const PostCard = ({ post, unpin, user }: { post: Post, unpin: (id: number | string) => void, user: UserData }) => (

    <Card className={`overflow-hidden w-[300px]`}>
        <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <ValidImage
                        src={post.user.image}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{post.user.name}</h3>
                        {user?.role === 'ADMIN' && (
                            <button type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    unpin(post?.id)
                                }}
                                className="hover:bg-hot z-10  hover:text-white duration-300 bg-hot/20 text-hot p-1.5 rounded-lg">
                                <PinOff className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{fromNow(new Date(post.created_at))}</p>
                </div>
            </div>
            <p className="mb-4 line-clamp-2">{post.body}</p>
            <div className="relative w-[400px] h-[200px] aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image
                    src={post.image || post.images[0]}
                    alt="Post content"
                    fill
                    className="object-cover"
                />
            </div>
        </CardContent>
        <CardFooter className="p-4 border-t flex justify-between">
            <Button
                variant="ghost"
                size="sm"
            // onClick={() => toggleLike(post.id)}
            // className={likes[post.id] ? "text-blue-600" : ""}
            >
                <ThumbsUp className="w-5 h-5 mr-2" />
                Like
            </Button>
            <Button variant="ghost" size="sm">
                <MessageCircle className="w-5 h-5 mr-2" />
                Comment
            </Button>
            <Button variant="ghost" size="sm">
                <Share2 className="w-5 h-5 mr-2" />
                Share
            </Button>
        </CardFooter>
    </Card>
)

