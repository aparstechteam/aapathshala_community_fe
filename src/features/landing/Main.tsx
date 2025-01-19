import { useUser } from '@/components'
import { Footer } from '@/components'
import Image from 'next/image'
import React from 'react'


export const LandingPage = () => {
    const { user } = useUser();
    if (!user) return;
    return (
        <div className="w-full bg-white dark:bg-[#171717] font-siliguri">
            <header className="w-full py-4 px-10 bg-light/20 flex items-center">
                <div className="flex w-full items-center space-x-2 justify-between">
                    <Image src="/afs.png" alt="Logo" width={40} height={40} className="dark:invert" />
                    <nav className="w-full">

                    </nav>
                    <Image src={user.profilePic} alt="User" width={40} height={40} className="dark:invert rounded-full" />
                </div>
            </header>
            <div className="w-full p-6 h-[calc(100vh_-_100px)] flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-gradientje max-w-2xl mx-auto max-h-[400px] p-1 dark:bg-[#171717] ring-1 ring-ash">
                    <div className='w-full h-full rounded-lg bg-white/90 px-4 py-2 text-purple-600'>
                        <div className='w-full flex justify-center py-6'>
                            <Image src="/afs.png" alt="Logo" width={100} height={100} className="dark:invert" />
                        </div>
                        <h2 className='text-2xl font-bold text-center'>Smart কমিনিউটিতে তোমাকে স্বাগতম</h2>
                        <h2 className='text-lg py-5 font-semibold text-black/70 text-center'>তোমার রেজিস্ট্রেশন সম্পন্ন হয়েছে। খুব শীঘ্রই আমাদের এডমিন টিম তোমার একাউন্ট সক্রিয় করবেন।</h2>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}