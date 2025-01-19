import React from 'react'
import { Notification } from '@/@types';
import { fromNow, Layout, NotificationIcon, useUser } from '@/components';
import { useNotifications } from '@/hooks';
import { useToast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import Router from 'next/router';
import { cn } from '@/lib/utils';
import { secondaryAPI } from '@/configs';
import { handleError } from '@/hooks/error-handle';
import Head from 'next/head';


const NotificationsPage = () => {
    const { allNotifications, loadingNotifications, refetch } = useNotifications();
    const { user } = useUser();
    const { toast } = useToast();

    async function handleRead(id: string, link: string) {
        try {
            await axios.post(`${secondaryAPI}/api/notification/mark-as-read`, { notificationId: id }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    "X-Key-Id": user?.id as string,
                },
            });
            refetch.notifications()
            toast({
                title: "Marked as read",
                description: "Notification has been marked as read",
            })
            Router.push(link)
        } catch (err) {
            handleError(err as AxiosError, () => handleRead(id, link))
        }
    }

    async function handleAllRead() {
        try {
            await axios.post(`${secondaryAPI}/api/notification/mark-all-as-read`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    "X-Key-Id": user?.id as string,
                },
            });
            refetch.notifications()
            toast({
                title: "Marked as read",
                description: "Notification has been marked as read",
            })
        } catch (err) {
            handleError(err as AxiosError, () => handleAllRead())
        }
    }

    return (
        <>
            <Head>
                <title>Notifications</title>
            </Head>
            <Layout>
                <div className="px-4 xl:pt-4 pt-10 min-h-[calc(100vh-80px)]">
                    <div
                        className="max-w-5xl mx-auto w-full relative z-[9] !p-4 bg-white ring-ash ring-1 rounded-xl dark:!bg-gray-900/95 backdrop-blur-lg !border-1 shadow dark:border-purple-700/50"
                    >
                        <div className="flex items-center justify-between gap-2 text-lg py-2 font-semibold text-gray-700 dark:text-gray-200">
                            <p className="flex items-center gap-2">
                                <NotificationIcon type='default' />
                                নোটিফিকেশন
                            </p>
                            <div className="flex justify-end items-center">
                                <button type="button" onClick={() => handleAllRead()} className="text-base text-sky-500 hover:text-sky-600">Mark all as read</button>
                            </div>
                        </div>
                        {loadingNotifications ? (
                            <div className="flex items-center justify-center">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="grid divide-y dark:divide-gray-800 divide-gray-200">
                                    {allNotifications?.map((x: Notification) => (
                                        <div key={x?.id} className="flex items-center gap-2 py-2">
                                            <div>
                                                <NotificationIcon type={x?.type} />
                                            </div>
                                            <div>
                                                <button type="button" onClick={() => handleRead(x?.id, x?.link)} className={cn(
                                                    !x.read_status && "font-semibold",
                                                    x.read_status && "font-normal",
                                                    "text-gray-700 text-start outline-none focus:outline-none ring-0 focus:ring-0 border-none focus:border-none dark:text-gray-200 text-sm")}>{x?.message}</button>
                                                <p className="text-xs dark:text-gray-400 text-light">{fromNow(new Date(x?.created_at))}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default NotificationsPage