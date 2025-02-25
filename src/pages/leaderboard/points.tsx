import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import { PointsCount } from '@/features'
import axios from 'axios'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

export type TScore = {
    created_at: string
    id: string
    points: number
    type: string
}

const ScoreInfoPage = () => {

    const router = useRouter()
    const { uid } = router.query

    const [score, setScore] = useState<TScore[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState<number>(0)

    useEffect(() => {
        async function getinfo() {
            try {
                const res = await axios.get(`${secondaryAPI}/api/admin/users/activity/${uid}?limit=20&page=${page}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setTotalPages(Number(res.data.totalPages))
                if (score.length === 0) {
                    setScore(res.data.data)
                } else {
                    setScore((prev) => [...prev, ...res.data.data])
                }
            } catch {

            }
        }
        if (uid) getinfo()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, uid])
    return (
        <>
            <Head>
                <title>Score History</title>
            </Head>
            <Layout>
                <PointsCount score={score} total={totalPages} page={page} setPage={setPage} title='স্কোর কাউন্ট' />
            </Layout>
        </>
    )
}

export default ScoreInfoPage