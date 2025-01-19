import React from 'react'
import { Avatar, AvatarFallback, AvatarImage, Button, Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '../ui'
import { Bookmark, Gem, LoaderCircle, LogOut, Logs, UserRound, WandSparkles, X } from 'lucide-react'
import { Logo2 } from '../shared'
import Link from 'next/link'
import { useUser } from '../contexts'
import { ThemeToggle } from '../theme/toggleTheme'
import { useRouter } from 'next/router'
import { cn } from '@/lib/utils'

type Props = {
    handleLogout: () => void
    loading: boolean
}

export const MobileMenu = (props: Props) => {

    const { handleLogout, loading } = props
    const { user } = useUser()
    const router = useRouter()

    return (
        <Drawer direction='right'>
            <DrawerTrigger className='flex items-center w-full justify-center text-olive dark:text-green-500'>
                <p className={cn(
                    router.pathname === '/profile' && "text-olive border-b-2 border-b-olive",
                    "text-center py-2 flex w-full justify-center duration-300")}>
                    <Avatar className={cn('w-6 h-6',
                        router.pathname === '/profile' && 'ring-2 ring-olive'
                    )}>
                        <AvatarImage src={user?.image as string || '/user.jpg'} alt="Profile" />
                        <AvatarFallback>
                            {user?.name
                                ? user?.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                : "U"}
                        </AvatarFallback>
                    </Avatar>
                </p>
            </DrawerTrigger>
            <DrawerContent className='h-screen z-[99] !rounded-none !border-none bg-white dark:bg-background text-gray-900 dark:text-gray-100'>
                <DrawerHeader>
                    <DrawerTitle className='flex items-center justify-between py-1'>
                        <Logo2 />
                        <DrawerClose>
                            <X size={25} strokeWidth={2} />
                        </DrawerClose>
                    </DrawerTitle>
                </DrawerHeader>

                <div className="px-4 grid h-full">
                    <div className="divide-gray-200 dark:divide-gray-800 h-full">
                        <div className="space-y-2 px-2 py-1">
                            <h4 className="font-medium text-gray-600 dark:text-gray-400">
                                Signed in as
                            </h4>
                            <h4 className="font-semibold text-olive dark:text-life">
                                {user?.name}
                            </h4>
                        </div>
                        <div className="grid gap-1 pt-3">

                            <Link
                                className="flex items-center gap-2 px-2 py-2 !border-0 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/profile"
                            >
                                <UserRound size={20} /> Dashboard
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/profile"
                            >
                                <Logs size={20} /> My Posts
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/saved"
                            >
                                <Bookmark size={20} /> Saved Posts
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/feature-request"
                            >
                                <WandSparkles size={20} /> Feedback
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/leaderboard"
                            >
                                <Gem size={20} /> Leaderboard
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life"
                                href="/auth?step=1"
                            >
                                <UserRound size={16} /> Switch Profile
                            </Link>
                            <DrawerClose className='w-full hidden justify-start'>
                                <ThemeToggle className="flex !shadow-none items-center text-start !justify-start gap-2 !px-2 !py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-olive dark:hover:text-life" />
                            </DrawerClose>
                        </div>


                    </div>
                </div>
                <DrawerFooter className='border-t border-gray-200 dark:border-gray-800'>
                    <DrawerClose>
                        <Button
                            onClick={handleLogout}
                            className="flex items-center !shadow-none !justify-start !border-0 !ring-0 focus:!ring-0 focus:!outline-none !outline-none gap-2 !px-2 !py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 w-full text-left"
                        >{loading ? (
                            <LoaderCircle size={20} className="animate-spin" />
                        ) : (
                            <LogOut size={20} />
                        )}
                            <span className='pt-1'>Logout</span>
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer >

    )
}