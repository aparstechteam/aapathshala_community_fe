import { Club, Group } from '@/@types'
import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import { ClubListCard, GroupLists } from '@/features'
import axios from 'axios'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'

const GroupPage = () => {

    const [groups, setGroups] = useState<Group[]>([])
    const [myGroups, setMyGroups] = useState<Group[]>([])
    const [clubs, setClubs] = useState<Club[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function getGroups() {
            try {
                setLoading(true)
                const response = await axios.get(`${secondaryAPI}/api/group?group_type=SUBJECT`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setGroups(response.data.groups)
                setLoading(false)
            } catch {
                setLoading(false)
            }
        }
        getGroups()
    }, [])



    useEffect(() => {
        async function fetchClubs() {
            const response = await axios.get(`${secondaryAPI}/api/group?group_type=CLUB`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            if (response.data.groups)
                setClubs(response.data.groups)
        }
        fetchClubs()
    }, [])

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${secondaryAPI}/api/group/mygroups`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setMyGroups(response.data.groups);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    return (
        <>
            <Head>
                <title>Smart Community | Groups</title>
            </Head>
            <Layout>
                <div className='px-2 grid w-full gap-4 pt-6 lg:pt-4 pb-5 max-w-5xl mx-auto min-h-[calc(100vh-80px)] !text-black dark:!text-white'>
                    {myGroups?.length > 0 && (
                        <div className='w-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>জয়েন্ড গ্রুপ সমূহ</h2>
                                <GroupLists className="max-h-full" groups={myGroups.filter((g) => g.type !== 'CLUB')?.map((g) => ({ ...g, is_member: true }))} loading={loading} />
                            </div>
                        </div>
                    )}
                    {clubs.filter((c) => c.is_member)?.length > 0 && (
                        <div className='w-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>জয়েন্ড ক্লাব সমূহ</h2>
                                <GroupLists groups={clubs.filter((c) => c.is_member)} loading={loading} />
                            </div>
                        </div>
                    )}
                    {groups.filter((g) => !g.is_member)?.length > 0 && (
                        <div className='w-full space-y-4 h-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>অন্যান্য গ্রুপ সমূহ</h2>
                                <ClubListCard clubs={groups.filter((g) => !g.is_member)} loading={loading} className="min-h-[250px]" />
                            </div>
                        </div>
                    )}
                    {clubs.filter((c) => !c.is_member)?.length > 0 && (
                        <div className='w-full space-y-4 h-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>অন্যান্য ক্লাব সমূহ</h2>
                                <ClubListCard clubs={clubs.filter((c) => !c.is_member)} loading={loading} className="min-h-[250px]" />
                            </div>
                        </div>
                    )}

                </div>
            </Layout>
        </>
    )
}

export default GroupPage