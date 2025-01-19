import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import axios from 'axios'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

type QuizLeaderboard = {
    id: number
    marks: number
    rank: number
    submitted_at: string
    user: {
        id: string
        name: string
        profilePic: string
    }
}

const QuizLeaderboardPage = () => {

    const router = useRouter()
    const { exam_id } = router.query

    const [quizLeaderboard, setQuizLeaderboard] = useState<QuizLeaderboard[]>([])

    useEffect(() => {
        async function getQuizLeaderboard() {
            try {
                if (!exam_id) return;
                const response = await axios.get(`${secondaryAPI}/api/exam/${exam_id}/results`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setQuizLeaderboard(response.data)
            } catch (error) {
                console.log(error)
            }
        }

        getQuizLeaderboard()
    }, [exam_id])

    return (
        <>
            <Head>
                <title>Quiz Leaderboard</title>
            </Head>
            <Layout>
                <div className='p-4'>
                    <div className='flex min-h-[calc(100vh-80px)] bg-white rounded-lg shadow-md ring-1 ring-ash p-4 max-w-6xl mx-auto w-full flex-col gap-4'>
                        <h1 className='text-2xl font-bold py-4 text-center'>ডেইলি কুইজ লিডারবোর্ড</h1>
                        <div className='flex flex-col divide-y divide-ash'>
                            {quizLeaderboard.map((item) => (
                                <div key={item.id} className='flex items-center justify-between gap-2 px-4 py-2'>
                                    <div className='flex items-center gap-4'>
                                        <p className='text-lg font-medium'>{item.rank}</p>
                                        <Image src={item.user.profilePic} alt={item.user.name} width={40} height={40} className='rounded-full' />
                                        <h2 className='text-lg font-medium'>{item.user.name}</h2>
                                    </div>
                                    <p className='text-lg font-bold'>{item.marks}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default QuizLeaderboardPage