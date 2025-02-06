/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Rightbar } from './Rightbar'
import { cn } from '@/lib/utils'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'
import Image from 'next/image'
import { useUser } from '../contexts'
import { Check, ImageUp, Loader2, User } from 'lucide-react'
import { useRouter } from 'next/router'
import { handleError, toast, useCloudflareImage } from '@/hooks'
import axios, { AxiosError } from 'axios'
import { secondaryAPI } from '@/configs'
import { UserData } from '@/@types'

type Props = {
    children: ReactNode
    variant?: 'home' | 'other'
    selectedSubject?: string
    setSelectedSubject?: (subject: string) => void
}

const bg = 'dark:bg-[#000000] bg-[#F5F6F7] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]';
export const background = cn(bg, 'w-full pb-10 min-h-screen text-white pt-[100px] px-2 lg:pt-[72px]');

export const Layout = (props: Props) => {

    const { variant, selectedSubject, setSelectedSubject } = props
    const { user, setUser } = useUser()
    const router = useRouter()
    const { uploadImage } = useCloudflareImage()

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    })
    const [openInfo, setOpenInfo] = useState(false)
    const [infoStep, setInfoStep] = useState(0)
    const [imgloading, setImgloading] = useState(false)
    const [preview, setPreview] = useState<string | null>(user?.image || '')
    const [error, setError] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)
    const [myinfo, setMyInfo] = useState<{
        phone: string
        bio: string
        gender: string
        religion: string
        hsc_batch: string
    }>({
        phone: user?.phone || "",
        bio: user?.bio || "",
        gender: user?.gender || "",
        religion: user?.religion || "",
        hsc_batch: user?.hsc_batch || ""
    })

    async function handleInfoSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        console.log(myinfo);
        if (!myinfo.phone || myinfo.phone.length !== 11) {
            toast({
                title: "দুঃখিত",
                description: "সঠিক ফোন নম্বর দিতে হবে!",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        if (!myinfo.gender) {
            toast({
                title: "দুঃখিত",
                description: "ছেলে না মেয়ে সিলেক্ট করো",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        if (!myinfo.religion) {
            toast({
                title: "দুঃখিত",
                description: "ধর্ম সিলেক্ট করো",
                variant: "destructive",
            });
            setError("d");
            return;
        }
        try {
            setIsLoading(true);
            const res = await axios.put(`${secondaryAPI}/api/auth/update`,
                myinfo,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            console.log(res);
            toast({
                title: "অভিনন্দন",
                description: "তোমার প্রোফাইল সম্পন্ন হয়েছে।",
                variant: "success",
            });
            localStorage.removeItem("user");
            await getme();
            setIsLoading(false);
        } catch (error) {
            console.log(error)
            setIsLoading(false);
        }
    }

    async function getme() {

        try {
            const response = await axios.get(`${secondaryAPI}/api/auth/user`, {

                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });
            setUser(response.data.user as UserData)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('hsc_batch', response.data.user?.hsc_batch)
            setOpenInfo(false)
        } catch (error) {
            handleError(error as AxiosError, getme)
        }
    }

    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setImgloading(true);
                // setImgSrc(file)
                const imagelink = await uploadImage(file as File);
                setPreview(imagelink as string);
                // setEditOpen(false)
                setImgloading(false);
            } catch {
                setImgloading(false);
                toast({
                    title: "Image Upload Failed",
                    description: "Please try again",
                    variant: "destructive",
                });
            }
        }
    };

    useEffect(() => {
        if (user?.image) {
            setPreview(user?.image)
        }
        if (user.id && !user?.hsc_batch) {
            if (!router.pathname.includes('/auth')) {
                setTimeout(() => {
                    setOpenInfo(true)
                }, 4000)
            }
        }
    }, [user, router])

    const userinfo = (
        <Dialog
            open={openInfo}
            onOpenChange={(v) => {
                setOpenInfo(v);
                setInfoStep(0);
            }}
        >
            <DialogContent
                className={cn(
                    "bg-white duration-300 text-black p-5",
                    infoStep < 2 && "max-w-[470px]",
                    infoStep === 2 && "max-w-2xl overflow-y-auto"
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-center py-2">
                        প্রোফাইল আপডেট সম্পন্ন করো
                    </DialogTitle>
                </DialogHeader>
                {infoStep === 0 && (
                    <div className="grid gap-4 p-4">
                        {/* <h2 className='text-2xl font-semibold'>তোমার প্রোফাইল দেখো</h2> */}
                        <div className="min-w-24 mx-auto space-y-2">
                            <Label className="text-center w-full">প্রোফাইল পিকচার</Label>
                            <div className="relative flex items-center justify-center cursor-pointer duration-300 hover:text-elegant text-light">
                                <Input
                                    disabled={imgloading}
                                    className="!p-0 !opacity-0 !bg-transparent !text-transparent absolute w-full h-full !cursor-pointer"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />

                                {imgloading ? (
                                    <Loader2 className="animate-spin text-center mb-1" />
                                ) : (
                                    <p className="flex items-center gap-2 w-full">
                                        {preview ? (
                                            <Image
                                                height={80}
                                                width={80}
                                                src={preview}
                                                alt="preview"
                                                className="rounded-lg object-cover h-20 w-20"

                                            />
                                        ) : (
                                            <span className="text-base flex items-center mx-auto justify-center h-20 w-20 text-center rounded-xl ring-2 ring-ash">
                                                <ImageUp size={40} strokeWidth={1.1} />
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="w-full  ">
                            <Label>তোমার ফোন নম্বর</Label>
                            <Input required
                                className={cn(
                                    "w-full !px-4 !pb-1 focus:!ring-2 !rounded-lg !border-0 !ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                    error && !myinfo.phone && "ring-hot ring-2"
                                )}
                                type='tel'
                                value={myinfo.phone}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Only allow valid phone number formats
                                    const phoneRegex = /^[0-9]*$/;
                                    if (phoneRegex.test(value) || value === "") {
                                        setMyInfo({ ...myinfo, phone: value });
                                    }
                                }}
                                placeholder="ফোন নম্বর"

                            />
                        </div>

                        <div className="w-full  ">
                            <Label>নিজের সম্পর্কে লিখো</Label>
                            <Input
                                className="w-full !rounded-lg !h-10"
                                value={myinfo.bio}
                                onChange={(e) => setMyInfo({ ...myinfo, bio: e.target.value })}
                                placeholder="বায়ো"
                            />
                            <span className="text-xs text-light flex justify-end text-end pt-2">
                                {myinfo.bio.length}/100
                            </span>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
                            <Label className="col-span-2">তুমি একজন</Label>
                            <button
                                onClick={() => {
                                    setError("");
                                    setMyInfo({ ...myinfo, gender: "boy" });
                                }}
                                type="button"
                                className={cn(
                                    "text-sm text-black ring-2 h-10 duration-300 px-4 py-0.5 rounded-lg",
                                    error && !myinfo.gender
                                        ? "ring-hot"
                                        : myinfo.gender === "boy"
                                            ? "ring-olive"
                                            : myinfo.gender !== "boy" && "ring-ash"
                                )}
                            >
                                ছাত্র
                            </button>

                            <button
                                onClick={() => {
                                    setMyInfo({ ...myinfo, gender: "girl" });
                                    setError("");
                                }}
                                type="button"
                                className={cn(
                                    "text-sm text-black ring-2 h-10 duration-300 px-4 py-1 rounded-lg",
                                    error && !myinfo.gender
                                        ? "ring-hot"
                                        : myinfo.gender === "girl"
                                            ? "ring-olive"
                                            : myinfo.gender !== "girl" && "ring-ash"
                                )}
                            >
                                ছাত্রী
                            </button>
                        </div>
                        <div className="w-full">
                            <div className="flex flex-col gap-3">
                                <Label>তোমার ধর্ম কী?</Label>
                                <Select
                                    value={myinfo?.religion}
                                    required
                                    onValueChange={(value) => {
                                        setMyInfo({ ...myinfo, religion: value });
                                        setError("");
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                            error && !myinfo.religion && "ring-hot ring-2"
                                        )}
                                    >
                                        <SelectValue placeholder={"তুমি কোন ধর্মের অনুসারী?"} />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                    >
                                        <SelectItem
                                            value={"ISLAM"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            ইসলাম
                                        </SelectItem>

                                        <SelectItem
                                            value={"SANATAN"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            সনাতন
                                        </SelectItem>
                                        <SelectItem
                                            value={"CHRISTIANITY"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            খৃষ্টান
                                        </SelectItem>
                                        <SelectItem
                                            value={"BUDDHIST"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            বৌদ্ধ
                                        </SelectItem>

                                        <SelectItem
                                            value={"OTHERS"}
                                            className="hover:!text-white text-black dark:text-white"
                                        >
                                            অন্যান্য
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {error && !myinfo.religion && (
                                    <p className="text-hot text-xs">ধর্ম সিলেক্ট করো</p>
                                )}
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="flex flex-col gap-3">
                                <Label>তোমার ব্যাচ সিলেক্ট করো</Label>
                                <Select
                                    value={myinfo?.hsc_batch}
                                    required
                                    onValueChange={(value) => {
                                        setMyInfo({ ...myinfo, hsc_batch: value });
                                        setError("");
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "w-full !px-4 !pb-1 !rounded-lg ring-2 ring-ash shadow-none duration-300 dark:bg-life/10 bg-white dark:text-white text-gray-900 hover:bg-ash/20 dark:hover:bg-ash/20",
                                            error && !myinfo.hsc_batch && "ring-hot ring-2"
                                        )}
                                    >
                                        <SelectValue placeholder={"তুমি কোন ব্যাচে পড়ো?"} />
                                    </SelectTrigger>
                                    <SelectContent
                                        align="start"
                                        className="dark:!bg-gray-800 text-light dark:text-gray-200 !bg-white max-h-[250px]"
                                    >
                                        <SelectItem
                                            value={"HSC 25"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            HSC 2025
                                        </SelectItem>

                                        <SelectItem
                                            value={"HSC 26"}
                                            className="hover:!text-white !text-black dark:text-white"
                                        >
                                            HSC 2026
                                        </SelectItem>

                                    </SelectContent>
                                </Select>
                                {error && !myinfo.hsc_batch && (
                                    <p className="text-hot text-xs">ব্যাচ সিলেক্ট করো</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <div className="flex items-center justify-end gap-4 w-full">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex !w-28 items-center !rounded-xl gap-2 !h-9"
                            size="sm"
                            onClick={(e) => {
                                handleInfoSubmit(e);
                            }}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            সাবমিট করো
                        </Button>
                    </div>
                </DialogFooter>


            </DialogContent>
        </Dialog>
    );

    return variant === 'home' ? (

        <div className="dark:bg-[#171717] md:!bg-[#F5F6F7] dark:!text-white font-siliguri text-gray-700 relative">
            {userinfo}
            {/* Fixed Header */}
            <div className={cn("fixed top-0 left-0 w-full z-10", router.pathname.includes('/onboard') && 'hidden md:block')}>
                <Header />
            </div>

            {/* Layout Wrapper */}
            <div className="pt-[72px] flex w-full">

                {/* Left Sidebar - Fixed */}
                <div className="fixed hidden xl:block top-[73px] pl-4 2xl:pl-10 h-[calc(100vh-64px)] z-10">
                    <ScrollArea className="h-[calc(100vh-100px)] !scroll-area">
                        <Sidebar selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
                    </ScrollArea>
                </div>

                {/* Middle Content - Scrollable */}
                <div className={cn('bg-[#F5F6F7] dark:bg-[#171717] relative w-full min-h-[calc(100vh_-_72px)]')}>
                    <div className={cn('fixed bg-[#F5F6F7] dark:bg-[#171717] h-screen w-full z-[1]')} />
                    <div className="mx-auto w-full overflow-y-auto z-[2]">
                        {props.children}
                    </div>
                    {timeLeft.days > 0 && (
                        <div className='fixed bottom-5 left-0 w-full h-10 z-[999] flex items-center justify-center'>

                            <p className='text-center bg-hot max-w-4xl mx-auto rounded-full h-full px-5 w-full flex items-center justify-center text-xl text-white'>
                                ৭ দিন ফ্রি ট্রায়াল বাকি আছে
                            </p>
                        </div>
                    )}
                </div>



                {/* Right Sidebar - Fixed */}
                <div className="fixed hidden xl:block top-[73px] right-0 pr-4 2xl:pr-10 h-[calc(100vh-64px)] z-10">
                    <ScrollArea className="h-[calc(100vh-100px)] !scroll-area">
                        <Rightbar />
                    </ScrollArea>
                </div>

            </div>
        </div>

    ) : (
        <div className={cn("dark:bg-[#171717] min-h-screen dark:!text-white text-gray-700 relative font-siliguri", router.pathname.includes('/onboard') ? 'bg-white' : 'bg-[#F5F6F7]')}>
            {userinfo}
            <div className={cn("fixed top-0 left-0 w-full z-10", router.pathname.includes('/onboard') && 'hidden md:block')}>
                <Header />
            </div>
            <div className={cn('pt-10', !router.pathname.includes('/onboard') && 'pt-[100px] lg:!pt-[70px]')}>
                {props.children}
                {timeLeft.days > 0 && (
                    <div className='fixed bottom-5 left-0 w-full h-10 z-[999] flex items-center justify-center'>
                        <p className='text-center bg-hot max-w-4xl mx-auto rounded-full h-full px-5 w-full flex items-center justify-center text-xl text-white'>
                            ৭ দিন ফ্রি ট্রায়াল বাকি আছে
                        </p>
                    </div>
                )}
            </div>
        </div>

    )
}

export const BasicLayout = (props: Props) => {

    const { user } = useUser()

    return (
        <div className="dark:bg-[#171717] bg-[#F5F6F7] dark:!text-white text-gray-700 relative font-siliguri">
            <header className="w-full py-4 px-10 bg-light/20 flex items-center">
                <div className="flex w-full items-center space-x-2 justify-between">
                    <Image src="/rocket.png" alt="Logo" width={80} height={80} className="dark:invert" />
                    <nav className="w-full">

                    </nav>
                    {user.profilePic ? <Image src={user.profilePic} alt="User" width={40} height={40} className="dark:invert rounded-full" /> : (
                        <User className='dark:invert' />
                    )}
                </div>
            </header>
            {props.children}
            {/* <Footer /> */}
        </div>
    )
}