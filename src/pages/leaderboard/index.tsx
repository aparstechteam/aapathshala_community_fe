import { LeaderboardEntry, Pagination } from '@/@types'
import { Layout } from '@/components'
import { secondaryAPI } from '@/configs'
import { months } from '@/data/months'
import { LeaderBoardComponent } from '@/features'
import axios, { AxiosError } from 'axios'
import { NextPage } from 'next'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'


const LeaderBoardPage: NextPage = () => {

    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
    const [data, setData] = useState<{ leaderboard: LeaderboardEntry[], pagination: Pagination }>({
        leaderboard: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 5,
        }
    });
    const [firstThree, setFirstThree] = useState<LeaderboardEntry[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const currentMonth = months[currentMonthIndex];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`${secondaryAPI}/api/utils/leaderboard`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    params: {
                        monthYear: currentMonth,
                        limit: 12,
                        page: page
                    }
                });
                setData(response.data);
                setLoading(false)
                if (response.data.leaderboard.length === 0)
                    setError('No data found');
            } catch (error) {
                if (error instanceof AxiosError)
                    setError(error.response?.data.message);
                setLoading(false)
            }
        };
        fetchLeaderboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, page]);

    useEffect(() => {
        if (firstThree.length === 0)
            setFirstThree(data.leaderboard.slice(0, 3));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, currentMonthIndex]);

    const nextMonth = () => {
        if (currentMonthIndex < months.length - 1) {
            setFirstThree([]);
            setCurrentMonthIndex((prev: number) => prev + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonthIndex > 0) {
            setFirstThree([]);
            setCurrentMonthIndex((prev: number) => prev - 1);
        }
    };

    return (
        <>
            <Head>
                <title>Smart Community | Leaderboard</title>
            </Head>
            <Layout variant='home'>
                <div className='max-w-5xl pb-5 xl:max-w-[calc(100vw_-_750px)] p-2 2xl:max-w-[calc(100vw_-_850px)] mx-auto !w-full min-h-screen relative z-[4]'>
                    <LeaderBoardComponent
                        merit={firstThree}
                        limit={12} nextMonth={nextMonth} prevMonth={prevMonth}
                        currentMonthIndex={currentMonthIndex} currentMonth={currentMonth}
                        data={data as { leaderboard: LeaderboardEntry[], pagination: Pagination }}
                        page={page}
                        setPage={setPage}
                        loading={loading}
                        error={error}
                    />
                </div>
            </Layout>
        </>
    )
}

export default LeaderBoardPage