import { Exams } from '@/@types'
import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import { DailyQuiz } from '@/features'
import axios from 'axios'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'


const QuizPage = () => {

    const [exams, setExams] = useState<Exams[]>([])

    useEffect(() => {
        async function getquestions() {
            try {
                const res = await axios.get(`${secondaryAPI}/api/exam`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setExams(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        getquestions()
    }, [])

    return (
        <>
            <Head>
                <title>Daily Quiz</title>
            </Head>
            <Layout>
                <div>
                    <DailyQuiz exams={exams} />
                </div>
            </Layout>
        </>
    )
}

export default QuizPage