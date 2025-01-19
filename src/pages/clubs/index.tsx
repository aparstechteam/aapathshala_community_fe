import { Club } from '@/@types'
import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
// import { clubs_ } from '@/data/clubs'

import { ClubLists } from '@/features'
import axios from 'axios'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'

const ClubsPage = () => {
    const [clubs, setClubs] = useState<Club[]>([])

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

    return (
        <>
            <Head>
                <title>Clubs</title>
            </Head>
            <Layout>
                <div className='px-2 grid lg:flex w-full gap-4 py-4 max-w-6xl mx-auto min-h-[calc(100vh-80px)] dark:bg-gray-900 !text-black dark:!text-white'>

                    <div className='w-full space-y-4 h-full'>
                        <div className='p-4 grid gap-4 rounded-xl ring-ash ring-1 bg-white'>
                            <h2 className='text-xl font-semibold'>তোমার ক্লাব সমূহ</h2>
                            <ClubLists clubs={clubs || []} loading={false} />
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default ClubsPage