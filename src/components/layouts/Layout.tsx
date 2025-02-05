/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Rightbar } from './Rightbar'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui'
import Image from 'next/image'
import { useUser } from '../contexts'
import { User } from 'lucide-react'
import { useRouter } from 'next/router'

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
    const router = useRouter()
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
    })


    return variant === 'home' ? (

        <div className="dark:bg-[#171717] md:!bg-[#F5F6F7] dark:!text-white font-siliguri text-gray-700 relative">
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