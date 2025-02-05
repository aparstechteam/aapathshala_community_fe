/* eslint-disable @typescript-eslint/no-unused-vars */
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, copyLink, DialogContent, DialogFooter, DialogHeader, DialogTitle, GroupSkeleton, PinnedPosts, useDebounce, useUser } from '@/components'
import { Check, Plus } from 'lucide-react';
import Image from 'next/image';
import React, { FormEvent, useEffect, useState } from 'react'
import { NewsFeed } from '../home';
import { Club, Post } from '@/@types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@radix-ui/react-dialog';
import Router, { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { CreatePost, PostComponent } from '../posts';
import AppMath from '@/components/contexts/MathJAX';
import { secondaryAPI } from '@/configs';
import axios, { AxiosError } from 'axios';
import { handleError } from '@/hooks/error-handle';
import { Memberr, MembersComponent } from '../group';

type Props = {
    club: Club
    id: string
    clubs: Club[]
}

export const ClubComponent = (props: Props) => {
    const { club, id, clubs } = props
    const { toast } = useToast()
    const { user } = useUser()
    const router = useRouter()
    const { slug } = router.query

    const [showDialog, setShowDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isJoined, setIsJoined] = useState(false)
    const [pinnedPosts, setPinnedPosts] = useState<Post[]>([])
    const [refetchPinnedPosts, setRefetchPinnedPosts] = useState<boolean>(false)
    const [showJoiningRules, setShowJoiningRules] = useState(false)
    const [showMembers, setShowMembers] = useState(false)
    const [members, setMembers] = useState<Memberr[]>([])
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [totalPages, setTotalPages] = useState(0)
    const [goribOpen, setGoribOpen] = useState(false)

    useEffect(() => {
        setIsJoined(club?.is_member)
    }, [club])

    useEffect(() => {
        const fetchPinnedPosts = async () => {
            try {
                const response = await axios.get(`${secondaryAPI}/api/post/pinned_posts?group_id=${club?.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                const data = await response.data;
                if (data?.data.length > 0) setPinnedPosts(data.data);
            } catch (err) {
                handleError(err as AxiosError, () => fetchPinnedPosts())
            }
        }
        if (club?.id) fetchPinnedPosts()

    }, [refetchPinnedPosts, club?.id])

    const leaveDialog = (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="sm:max-w-[425px] bg-white text-light dark:text-white dark:bg-light/20 p-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-black dark:text-white py-2 ">
                        তুমি কি গ্রুপ থেকে লিভ নিতে চাও?
                    </DialogTitle>
                </DialogHeader>
                <div>
                    <p className="flex items-center gap-2">
                        তুমি কি নিশ্চিত যে তুমি এই গ্রুপ থেকে লিভ নিতে চাও?
                    </p>
                </div>
                <DialogFooter>
                    <div className="grid grid-cols-2 !justify-between gap-3">
                        <Button className='!bg-white !rounded-lg !w-full !text-light dark:!text-white dark:!bg-gray-600/20'
                            variant="outline"
                            onClick={() => {
                                setShowDialog(false);
                            }}
                        >
                            না, চাই না
                        </Button>
                        <Button disabled={loading} className='!bg-hot !rounded-lg !w-full !text-white dark:!bg-gray-600/20'
                            variant="outline"
                            onClick={(e) => {
                                handleLeave(e)
                                setShowDialog(false);
                            }}
                        >
                            হ্যাঁ চাই
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    async function handlejoin(e: FormEvent) {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await axios.post(`${secondaryAPI}/api/group/${club?.id}/join`, {
                group_id: club?.id
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            console.log(res.data)
            setIsJoined(true)
            setLoading(false)
            toast({
                title: "সদস্য হয়েছো",
                description: "তুমি এখন এই গ্রুপে সদস্য হয়েছো",
            })
            Router.reload()
        } catch (errr) {
            handleError(errr as AxiosError)
            setLoading(false)
        }
    }

    async function handleLeave(e: FormEvent) {
        e.preventDefault()
        try {
            const res = await axios.post(`${secondaryAPI}/api/group/${club?.id}/leave`, {
                group_id: club?.id
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            console.log(res.data)
            setIsJoined(false)
            setShowDialog(false);
            Router.back();
        } catch (errr) {
            handleError(errr as AxiosError)
            setLoading(false)
        }
    }

    async function unpinPost(id: string) {
        try {
            await axios.post(`${secondaryAPI}/api/post/${id}/unpin`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            toast({
                title: "Post Unpinned",
                description: "This post is unpinned from the top of the feed"
            })
            setPinnedPosts(pinnedPosts.filter((post) => post.id !== id))
        } catch (err) {
            handleError(err as AxiosError, () => unpinPost(id))
        }
    }

    const dSearchQuery = useDebounce(searchQuery, 500)

    useEffect(() => {
        async function getMembers() {
            try {
                const response = await axios.get(`${secondaryAPI}/api/group/${slug}/members?page=${page}&limit=20&search=${dSearchQuery}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setMembers(response.data.members)
                setTotalPages(response.data.total as number)
            } catch (err) {
                handleError(err as AxiosError, () => getMembers())
            }
        }
        if (slug)
            getMembers()
    }, [slug, page, dSearchQuery])

    const joining_rules = (
        <Dialog open={showJoiningRules} onOpenChange={setShowJoiningRules}>
            <DialogContent className="sm:max-w-[425px] bg-white text-light dark:text-white dark:bg-light/20 p-4">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-center text-black dark:text-white py-2 ">
                        গ্রুপে জয়েন করার শর্তাবলী
                    </DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 pb-4'>
                    <p>
                        <span className='font-bold'> ১. ⁠সদাচরণ বজায় রাখা:</span>
                        প্রত্যেক সদস্যের প্রতি শ্রদ্ধাশীল আচরণ করতে হবে। ব্যক্তিগত আক্রমণ, অপমানজনক ভাষা বা নেতিবাচক মন্তব্য করা নিষিদ্ধ।
                    </p>
                    <p>
                        <span className='font-bold'> ২. শেখার পরিবেশ বজায় রাখা:</span>
                        ক্লাস এবং আলোচনায় Learning Mindset রাখতে হবে। কেউ কোনো কিছু না জানলে তিরষ্কার করা যাবে না৷
                    </p>

                    <p>
                        <span className='font-bold'> ৩. ⁠সময়নিষ্ঠতা:</span>
                        ক্লাবের সেশন, ওয়ার্কশপ এবং অন্যান্য কার্যক্রমে সময়মতো উপস্থিত হতে হবে। এর মাধ্যমে তোমরা পেয়ে যেতে পারো এক্সাইটিং গিফটস।
                    </p>

                    <p>
                        <span className='font-bold'> ৪. ⁠সহযোগিতামূলক মনোভাব:</span>
                        নতুন সদস্যদের সহায়তা করা। পড়াশোনা বা এই সম্পর্কিত যেকোনো প্রশ্ন করা যাবে৷
                    </p>
                    <p>
                        <span className='font-bold'> ৫. ⁠পড়াশোনার ম্যাটেরিয়াল এর সুরক্ষা:</span>
                        কমিউনিটি থেকে পাওয়া কন্টেন্ট রিসোর্সেস যথাযথভাবে ব্যবহার করতে হবে।
                    </p>
                    <p className='text-center italic text-light dark:text-white'>উপরের শর্তাবলীর সাথে একমত হলে গ্রুপে জয়েন করো</p>
                </div>
                <DialogFooter>
                    <Button className='!bg-light !rounded-lg !w-full !text-white dark:!bg-gray-600/20'
                        variant="outline"
                        onClick={() => {
                            setShowJoiningRules(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button className='!bg-olive !rounded-lg !w-full !text-white dark:!bg-gray-600/20'
                        variant="outline"
                        onClick={(e) => {
                            setShowJoiningRules(false);
                            handlejoin(e)
                        }}
                    >
                        Join
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    const gorib = (
        <Dialog open={goribOpen} onOpenChange={setGoribOpen}>
            <DialogContent className="max-w-[400px] bg-white dark:bg-neutral-950 p-5 text-black">
                <DialogHeader>
                    <DialogTitle className="text-hot text-center">Attention!</DialogTitle>
                </DialogHeader>
                <div>
                    <h2>
                        এই গ্রুপে জয়েন হবার জন্যে, তোমাকে অবশ্যই কোর্সটি কিনতে হবে।
                    </h2>
                </div>
                <DialogFooter>
                    <Button
                        size="sm"
                        className="bg-hot/10 text-hot"
                        onClick={() => Router.push('/profile?tab=courses')}
                    >
                        কোর্স অ্যাড করো
                    </Button>
                    <Button
                        size="sm"
                        className="bg-olive text-white"
                        onClick={() => {
                            Router.push(`https://aparsclassroom.com/shop`);
                            setGoribOpen(false);
                        }}
                    >
                        কোর্স কিনো
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    const [aspectRatio, setAspectRatio] = useState<number | null>(null)

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.target as HTMLImageElement
        setAspectRatio(img.naturalHeight / img.naturalWidth)
    }

    return !!club?.id ? (
        <div className='w-full min-h-screen bg-[#F5F6F7] dark:bg-[#171717] z-0 text-black dark:text-white'>
            <div className='max-w-screen-2xl gap-4 px-0 lg:px-4 w-full mx-auto flex'>
                {leaveDialog}
                {joining_rules}
                {gorib}
                {/* My clubs */}
                <div className={cn(clubs?.length > 0 ? 'hidden lg:block' : 'hidden')}>
                    <div className="min-h-[300px] w-[320px] bg-white dark:bg-gray-600/20 rounded-xl ring-1 ring-ash dark:ring-ash/20 mt-4 p-3">
                        <h2 className='text-base font-semibold py-3'>আমার গ্রুপ সমূহ</h2>
                        {clubs?.map((g) => (
                            <div
                                key={g.group_id}
                                className={cn(g?.slug === club?.slug && "bg-elegant/10 !text-elegant",
                                    "flex rounded-xl items-center justify-between gap-4 p-1")}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="!rounded-xl">
                                        <AvatarImage src={g.image as string} alt={g.name} />
                                        <AvatarFallback className="!rounded-xl dark:bg-gray-700/20 bg-elegant/20 pt-1">ME</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <Link href={g.disabled ? '#' : `/clubs/${g.slug}`} className="font-medium text-sm leading-none">{g.name}</Link>
                                        <p className="text-xs text-muted-foreground">
                                            {g.member_count} {Number(g?.member_count) > 1 ? " Members" : "Member"}
                                        </p>
                                    </div>
                                </div>
                                {g.is_member && (
                                    <Badge variant="secondary" className="ml-auto">
                                        Joined
                                    </Badge>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='w-full pt-0 lg:pt-4'>
                    {/* cover image  */}
                    <div className='relative h-[200px] md:h-[300px] w-full bg-ice/20'
                        // style={{ maxHeight: "200px", paddingBottom: aspectRatio ? `${aspectRatio * 100}%` : '56.25%' }}
                    >
                        {!!club?.image ? (
                            <Image onLoad={handleImageLoad} objectFit="cover" src={club?.image} alt='cover-image' fill className='!z-[0] object-contain object-center lg:rounded-t-xl bg-[blue] backdrop-blur-sm bg-opacity-20' />
                        ) : (club?.cover &&
                            <Image onLoad={handleImageLoad} objectFit="cover" src={club?.cover as string} alt='cover-image' fill className='!z-[0] object-cover object-center lg:rounded-t-xl bg-[blue] backdrop-blur-sm bg-opacity-20' />
                        )}
                    </div>

                    {/* Group Informations  */}
                    <div className='py-3 grid w-full lg:grid-cols-2 justify-start bg-white dark:bg-gray-600/20 lg:rounded-b-xl px-3 shadow-sm lg:justify-between'>
                        <div className='grid gap-1 w-full'>
                            <h1 className='text-[20px] text-start justify-start flex items-center gap-2 font-extrabold text-black dark:text-white'>
                                <span className='pt-1'>{club?.name}</span>
                            </h1>
                            <div className='flex items-center gap-2'>
                                <button onClick={() => setShowMembers(!showMembers)} className='text-sm font-medium text-light dark:text-gray-400 flex items-center gap-2'>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_6_2345)">
                                            <path
                                                d="M14.6442 3.54909L14.4048 3.62497L13.13 3.73855L12.77 4.31354L12.5087 4.23053L11.4942 3.31583L11.347 2.84015L11.1499 2.33289L10.5123 1.76096L9.76004 1.61377L9.74272 1.95805L10.4797 2.67718L10.8403 3.10193L10.4349 3.3138L10.1048 3.21652L9.61031 3.01026L9.62711 2.61148L8.97827 2.34461L8.76284 3.28222L8.10891 3.43042L8.17359 3.95347L9.02564 4.11746L9.17282 3.28171L9.87616 3.38561L10.2031 3.5771H10.7277L11.0868 4.29622L12.0386 5.26185L11.9689 5.6372L11.2013 5.53941L9.87514 6.20914L8.92021 7.35454L8.79595 7.8618H8.45319L7.81453 7.56742L7.19421 7.8618L7.34853 8.51624L7.61846 8.20506L8.09312 8.19029L8.06001 8.77802L8.45319 8.89312L8.84586 9.33417L9.48706 9.15388L10.2194 9.26949L11.0699 9.49816L11.4947 9.54807L12.2148 10.3655L13.6047 11.1829L12.7058 12.9002L11.757 13.3413L11.3969 14.3227L10.0239 15.2394L9.87769 15.7681C13.3877 14.9227 15.9989 11.7696 15.9989 7.99981C15.9979 6.35327 15.4988 4.8208 14.6442 3.54909Z"
                                                fill="#757575" />
                                            <path
                                                d="M8.91936 12.1807L8.33673 11.1005L8.87148 9.98618L8.33673 9.82626L7.73627 9.22326L6.40599 8.92481L5.96443 8.00095V8.54946H5.76988L4.62346 6.99509V5.71829L3.78312 4.35185L2.44877 4.58969H1.54986L1.09761 4.29328L1.67464 3.83594L1.09914 3.96886C0.405479 5.15348 0.00109863 6.52807 0.00109863 8.00044C0.00109863 12.4176 3.58195 15.9999 7.99957 15.9999C8.33978 15.9999 8.67337 15.9699 9.00339 15.9302L8.91987 14.961C8.91987 14.961 9.28707 13.5217 9.28707 13.4728C9.28656 13.4234 8.91936 12.1807 8.91936 12.1807Z"
                                                fill="#757575" />
                                            <path
                                                d="M2.97355 2.57958L4.39448 2.38146L5.04943 2.02241L5.78638 2.23478L6.96387 2.1696L7.36723 1.53552L7.95547 1.63229L9.38404 1.49834L9.77772 1.06443L10.3329 0.693659L11.1182 0.811816L11.4044 0.768526C10.37 0.28164 9.21903 0 7.99927 0C5.51645 0 3.29644 1.13165 1.83069 2.90858H1.83476L2.97355 2.57958ZM8.33744 0.795518L9.15435 0.345811L9.67892 0.648841L8.91956 1.22689L8.19432 1.29972L7.86787 1.08785L8.33744 0.795518ZM5.91778 0.861217L6.27836 1.01146L6.75047 0.861217L7.00767 1.30685L5.91778 1.59307L5.39371 1.28648C5.39371 1.28648 5.90606 0.956455 5.91778 0.861217Z"
                                                fill="#757575" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6_2345">
                                                <rect width="16" height="16" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <span className='pt-1'>
                                        {club?.visibility === 'PUBLIC' ? "পাবলিক গ্রুপ" : "প্রাইভেট গ্রুপ"}
                                    </span>
                                </button>
                                <button onClick={() => setShowMembers(!showMembers)} className='text-sm font-medium text-light dark:text-gray-400 flex items-center gap-2'>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3.66626 12.3329V10.3329C3.66496 9.64754 3.82695 8.97171 4.13881 8.36138C4.45066 7.75105 4.90342 7.2238 5.45959 6.82326C5.08452 6.38392 4.83084 5.85415 4.72372 5.28651C4.6166 4.71886 4.65976 4.13307 4.84893 3.58726C4.36359 3.32835 3.79789 3.26395 3.26678 3.40715C2.73567 3.55035 2.27901 3.8904 1.98962 4.3582C1.70022 4.82599 1.5998 5.38643 1.70877 5.9256C1.81774 6.46478 2.12791 6.94223 2.57626 7.26093C2.00953 7.50655 1.52687 7.91235 1.18756 8.42848C0.848254 8.9446 0.667069 9.54859 0.66626 10.1663V11.6663C0.666789 12.1081 0.842554 12.5317 1.155 12.8442C1.46745 13.1566 1.89106 13.3324 2.33293 13.3329H3.89459C3.74474 13.0208 3.66672 12.6791 3.66626 12.3329Z"
                                            fill="#757575" />
                                        <path
                                            d="M13.4235 7.26093C13.8718 6.94223 14.182 6.46478 14.291 5.9256C14.4 5.38643 14.2995 4.82599 14.0101 4.3582C13.7207 3.8904 13.2641 3.55035 12.733 3.40715C12.2019 3.26395 11.6362 3.32835 11.1508 3.58726C11.34 4.13307 11.3832 4.71886 11.276 5.28651C11.1689 5.85415 10.9152 6.38392 10.5402 6.82326C11.0963 7.2238 11.5491 7.75105 11.8609 8.36138C12.1728 8.97171 12.3348 9.64754 12.3335 10.3329V12.3329C12.333 12.6791 12.255 13.0208 12.1052 13.3329H13.6668C14.1087 13.3324 14.5323 13.1566 14.8448 12.8442C15.1572 12.5317 15.333 12.1081 15.3335 11.6663V10.1663C15.3327 9.54859 15.1515 8.9446 14.8122 8.42848C14.4729 7.91235 13.9902 7.50655 13.4235 7.26093Z"
                                            fill="#757575" />
                                        <path
                                            d="M9.38607 6.94066C9.88318 6.63833 10.2678 6.18172 10.4812 5.64046C10.6946 5.0992 10.7252 4.50299 10.5682 3.94275C10.4112 3.38251 10.0753 2.88899 9.61168 2.53744C9.14808 2.18589 8.58222 1.99561 8.00041 1.99561C7.41859 1.99561 6.85274 2.18589 6.38914 2.53744C5.92554 2.88899 5.58963 3.38251 5.43264 3.94275C5.27566 4.50299 5.30621 5.0992 5.51963 5.64046C5.73305 6.18172 6.11764 6.63833 6.61474 6.94066C5.94095 7.21621 5.36432 7.6859 4.95816 8.29001C4.55199 8.89412 4.33464 9.60537 4.33374 10.3333V12.3333C4.33427 12.7752 4.51003 13.1988 4.82248 13.5113C5.13493 13.8237 5.55854 13.9995 6.00041 14H10.0004C10.4423 13.9995 10.8659 13.8237 11.1783 13.5113C11.4908 13.1988 11.6665 12.7752 11.6671 12.3333V10.3333C11.6662 9.60537 11.4488 8.89412 11.0427 8.29001C10.6365 7.6859 10.0599 7.21621 9.38607 6.94066Z"
                                            fill="#757575" />
                                    </svg>
                                    <span className='pt-1'>
                                        {club?.member_count} Members {' '}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Buttons and Links */}
                        <div className='flex w-full items-center justify-center py-2 lg:py-0 lg:justify-end gap-2'>
                            <Button disabled={loading || isJoined} type='button' onClick={() => {
                                if (!!club?.id && !club?.is_eligiable) {
                                    setGoribOpen(true)
                                } else {
                                    setShowJoiningRules(true)
                                }
                            }} size='sm' className='bg-olive text-white hover:text-olive ring-1 ring-ash hover:bg-olive/20 duration-300 transition-all hover:!bg-opacity-80'>
                                {isJoined ? <Check size={13} /> : <Plus size={13} />}
                                <span className=''>

                                    {isJoined ? "সদস্য" : "জয়েন করো"}
                                </span>
                            </Button>
                            <Button size='sm' onClick={() => {
                                copyLink(`/users/${id}`)
                                toast({
                                    title: "ইনভাইট করো",
                                    description: "ইনভাইট লিংক ক্লিপবোর্ডে কপি করা হয়েছে",
                                })

                            }} className='dark:!bg-green-700 ring-1 ring-ash hover:bg-gray-200 duration-300 transition-all hover:!bg-opacity-80'>
                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M3 2.5C3 1.67157 3.67157 1 4.5 1C5.32843 1 6 1.67157 6 2.5C6 3.32843 5.32843 4 4.5 4C3.67157 4 3 3.32843 3 2.5ZM4.5 0C3.11929 0 2 1.11929 2 2.5C2 3.88071 3.11929 5 4.5 5C5.88071 5 7 3.88071 7 2.5C7 1.11929 5.88071 0 4.5 0ZM9.5 3C9.5 2.44772 9.94771 2 10.5 2C11.0523 2 11.5 2.44772 11.5 3C11.5 3.55228 11.0523 4 10.5 4C9.94771 4 9.5 3.55228 9.5 3ZM8.9225 4.22957C9.4222 4.08022 9.95173 4 10.5 4C11.0483 4 11.5778 4.08022 12.0775 4.22957C12.3423 3.89039 12.5 3.46362 12.5 3C12.5 1.89543 11.6046 1 10.5 1C9.39543 1 8.5 1.89543 8.5 3C8.5 3.46362 8.65775 3.89039 8.9225 4.22957ZM2 6H6.25716C6.00353 6.30711 5.78261 6.64222 5.59971 7H2C1.72386 7 1.5 7.22386 1.5 7.5V7.58971L1.50027 7.59656C1.50071 7.60562 1.50175 7.62229 1.50416 7.64547C1.50899 7.69201 1.51921 7.76366 1.54061 7.85193C1.58359 8.02922 1.66982 8.26622 1.84187 8.50279C2.16787 8.95105 2.87788 9.5 4.5 9.5C4.67735 9.5 4.8438 9.49344 5.00003 9.48116L5 9.5C5 9.83352 5.02969 10.1601 5.08656 10.4772C4.90076 10.4922 4.70539 10.5 4.5 10.5C2.62212 10.5 1.58213 9.84583 1.03313 9.09096C0.767679 8.72596 0.635158 8.36141 0.568763 8.08753C0.535473 7.95021 0.518349 7.83386 0.509513 7.74881C0.505086 7.7062 0.502711 7.67118 0.501441 7.64499C0.500806 7.63188 0.500446 7.62096 0.500244 7.61238L0.500047 7.60127L0.50001 7.59705L0.500002 7.59529L0.5 7.59375V7.5C0.5 6.67157 1.17157 6 2 6ZM15 9.5C15 11.9853 12.9853 14 10.5 14C8.01472 14 6 11.9853 6 9.5C6 7.01472 8.01472 5 10.5 5C12.9853 5 15 7.01472 15 9.5ZM11 7.5C11 7.22386 10.7761 7 10.5 7C10.2239 7 10 7.22386 10 7.5V9H8.5C8.22386 9 8 9.22386 8 9.5C8 9.77614 8.22386 10 8.5 10H10V11.5C10 11.7761 10.2239 12 10.5 12C10.7761 12 11 11.7761 11 11.5V10H12.5C12.7761 10 13 9.77614 13 9.5C13 9.22386 12.7761 9 12.5 9H11V7.5Z"
                                        fill="#575757" />
                                </svg>
                                <span className=''>
                                    ইনভাইট করো
                                </span>
                            </Button>
                            {isJoined && (
                                <Button type='button' onClick={() => setShowDialog(true)} size='sm' className='dark:!bg-green-700 ring-1 ring-ash hover:bg-red-100 duration-300 transition-all hover:!bg-opacity-80'>
                                    <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M4.80002 6.99991C5.1314 6.99991 5.40002 6.73128 5.40002 6.39991C5.40002 6.06853 5.1314 5.79991 4.80002 5.79991C4.46865 5.79991 4.20002 6.06853 4.20002 6.39991C4.20002 6.73128 4.46865 6.99991 4.80002 6.99991ZM6.80002 0.799905C6.80002 0.683265 6.74911 0.572435 6.66062 0.496445C6.57213 0.420454 6.45488 0.386873 6.33958 0.404498L0.739584 1.2605C0.544277 1.29035 0.400024 1.45833 0.400024 1.65591V10.3439C0.400024 10.5415 0.544246 10.7094 0.739527 10.7393L6.33953 11.5961C6.45484 11.6138 6.5721 11.5802 6.6606 11.5042C6.7491 11.4282 6.80002 11.3174 6.80002 11.2007V5.99992L10.9378 5.99992L10.1403 6.69888C9.97432 6.84435 9.9575 7.09706 10.1027 7.26331C10.248 7.42957 10.5003 7.44641 10.6662 7.30094L12.2636 5.90094C12.3503 5.82499 12.4 5.71526 12.4 5.59991C12.4 5.48457 12.3503 5.37483 12.2636 5.29888L10.6662 3.89888C10.5003 3.75341 10.248 3.77025 10.1027 3.93651C9.9575 4.10276 9.97432 4.35547 10.1403 4.50094L10.9378 5.19992L6.80002 5.19992V0.799905ZM6.00002 1.26569V10.7349L1.20002 10.0005V1.99941L6.00002 1.26569ZM8.00002 10.7999H7.60002V6.79991H8.40002V10.3999C8.40002 10.6208 8.22094 10.7999 8.00002 10.7999ZM7.60002 4.39991V1.19991H8.00002C8.22094 1.19991 8.40002 1.37899 8.40002 1.59991V4.39991H7.60002Z"
                                            fill="#FC465D" />
                                    </svg>
                                    <span className=''>
                                        গ্রুপ লিভ
                                    </span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className='flex gap-4'>
                        <div className='w-full space-y-2'>
                            {showMembers ? (
                                <MembersComponent
                                    group={club as Club}
                                    members={members as Memberr[]}
                                    setMembers={setMembers}
                                    id={user?.id as string}
                                    page={page}
                                    setPage={setPage}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    totalPages={totalPages}
                                />
                            ) : (
                                <>
                                    {club?.is_member && (
                                        <CreatePost group_type={club?.type} group_id={club?.id as string} subject_id={club?.data?.subject as string} />
                                    )}

                                    {pinnedPosts.length > 0 && club.is_member && (
                                        <div className="relative z-[2] mx-auto gap-2 mt-4 w-full justify-center p-4 rounded-xl ring-1 ring-ash dark:ring-ash/20 bg-white dark:bg-gray-900/40 backdrop-blur-sm">
                                            <h2 className='text-base font-semibold pb-2'>পিন করা পোস্ট </h2>
                                            <div className="w-full flex justify-center">
                                                <PinnedPosts posts={pinnedPosts} unpin={unpinPost} />
                                            </div>
                                        </div>
                                    )}

                                    {!!club?.id && club.is_member && (
                                        <NewsFeed groupId={club?.id as string} refetch={() => setRefetchPinnedPosts(prev => !prev)} />
                                    )}
                                    {!!club?.id && !club.is_member && (
                                        <div className='flex flex-col gap-4 py-4'>
                                            {pinnedPosts.map((x) => (
                                                <PostComponent
                                                    key={x.id}
                                                    post={x}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}



                        </div>

                        <div className='max-w-[250px] w-full py-4 hidden lg:block'>
                            <div className='bg-white dark:bg-gray-600/20 grid gap-4 rounded-xl p-4 shadow-sm'>
                                <h2 className='text-lg font-semibold'>গ্রুপ সম্পর্কে</h2>
                                <p className='text-sm'>
                                    <AppMath formula={club?.description || ''} />
                                </p>
                                {/* <Link href='#' className='leading-none hover:bg-gradientje !duration-300 hover:text-white flex items-center justify-center gap-2 text-sm text-center text-[#1C1C1C] dark:text-white transition-colors rounded-full px-2 py-2 bg-ash dark:bg-ash/10'>
                                    <span className='pt-1'>
                                        আরও জানো
                                    </span>
                                    <ArrowRight size={16} />
                                </Link> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className='w-full min-h-screen bg-[#F5F6F7] dark:bg-[#171717] z-0 text-black dark:text-white'>
            <GroupSkeleton />
        </div>

    )
}