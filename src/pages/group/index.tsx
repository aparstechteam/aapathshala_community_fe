/* eslint-disable @typescript-eslint/no-unused-vars */
import { Group } from '@/@types'
import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import { ClubListCard, GroupLists } from '@/features'
import axios from 'axios'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'

const GroupPage = () => {

    const [groups, setGroups] = useState<Group[]>([])
    const [courses, setCourses] = useState<Group[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function getGroups() {
            try {
                setLoading(true)
                const batch = localStorage.getItem("hsc_batch")
                const response = await axios.get(`${secondaryAPI}/api/group?hsc_batch=${batch}`, {
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



    // useEffect(() => {
    //     async function fetchClubs() {
    //         const response = await axios.get(`${secondaryAPI}/api/group?group_type=CLUB`, {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //             }
    //         })
    //         if (response.data.groups)
    //             setClubs(response.data.groups)
    //     }
    //     fetchClubs()
    // }, [])

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const batch = localStorage.getItem("hsc_batch")
                const response = await axios.get(`${secondaryAPI}/api/group?group_type=COURSE&hsc_batch=${batch}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setCourses(response.data.groups);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    return (
        <>
            <Head>
                <title>Smart Community | Groups</title>
            </Head>
            <Layout>
                <div className='px-2 grid w-full gap-4 pt-6 lg:pt-4 pb-5 max-w-5xl mx-auto min-h-[calc(100vh-80px)] !text-black dark:!text-white'>
                    {groups?.length > 0 && (
                        <div className='w-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>গ্রুপ সমূহ</h2>
                                <GroupLists className="max-h-full" groups={groups} loading={loading} />
                            </div>
                        </div>
                    )}
                    {/* {clubs?.filter((c) => c.is_member)?.length > 0 && (
                        <div className='w-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>জয়েন্ড ক্লাব সমূহ</h2>
                                <GroupLists groups={clubs.filter((c) => c.is_member)} loading={loading} />
                            </div>
                        </div>
                    )} */}
                    {/* {groups?.filter((g) => !g.is_member)?.length > 0 && (
                        <div className='w-full space-y-4 h-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>অন্যান্য গ্রুপ সমূহ</h2>
                                <ClubListCard clubs={groups.filter((g) => !g.is_member)} loading={loading} className="min-h-[250px]" />
                            </div>
                        </div>
                    )} */}
                    {courses?.filter((c) => !c.is_member)?.length > 0 && (
                        <div className='w-full space-y-4 h-full'>
                            <div className='p-4 grid gap-4 rounded-xl ring-ash dark:ring-ash/20 ring-1 bg-white dark:bg-gray-600/20'>
                                <h2 className='text-lg font-medium'>কোর্স সমূহ</h2>
                                <ClubListCard clubs={courses} loading={loading} className="min-h-[250px]" />
                            </div>
                        </div>
                    )}

                </div>
            </Layout>
        </>
    )
}

export default GroupPage