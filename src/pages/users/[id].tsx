import React, { useEffect, useState } from 'react'
import { Layout, PageLoaders } from '@/components'
import { ProfileComponent } from '@/features'
import axios, { AxiosError } from 'axios'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { secondaryAPI } from '@/configs'
import { handleError } from '@/hooks/error-handle'

type UserData = {
    id: string;
    name: string;
    institute: string;
    profilePic: string;
    courses: string[];
    followers: number;
    following: number;
    school: string;
    thana: string;
    district: string;
    bio: string;
    is_paid: boolean;
    user_profile_pic: string;
    image: string;
    isFollowing: boolean;
    role: string;
    level: number;
    facebook: string;
    instagram: string;
    gender: string;
    religion: string;
};

type DashboardData = {
    totalPosts: number;
    totalComments: number;
    totalSatisfied: number;
};

export type UserProfile = {
    userData: UserData;
    dashboard: DashboardData;
};



const UserDetailsPage = () => {

    const router = useRouter()
    const id = router?.query?.id

    const [userProfile, setUserProfile] = useState<UserProfile>()
    const [loading, setLoading] = useState<boolean>(false)
    const [following, setFollowing] = useState<boolean>(!!userProfile?.userData?.isFollowing)


    useEffect(() => {
        async function getUserProfile() {
            try {
                setLoading(true)

                const response = await axios.get(`${secondaryAPI}/api/auth/profile/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setFollowing(response?.data?.userData?.isFollowing)
                setUserProfile(response.data)
                setLoading(false)

            } catch (err) {
                setLoading(false)
                handleError(err as AxiosError, () => getUserProfile())
            }
        }
        if (!!id) getUserProfile()
    }, [id, router])

    useEffect(() => {
        async function getFollowing() {
            try {
                if (!!id) {
                    const response = await axios.get(`${secondaryAPI}/api/follow?following=${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    })
                    setFollowing(response.data.following)
                }
            } catch (err) {
                handleError(err as AxiosError, () => getFollowing())
            }
        }
        if (!!id) getFollowing()
    }, [id])

    return (
        <>
            <Head>
                <title>Smart Community | User</title>
            </Head>
            <Layout variant='other'>

                {!!id && !!userProfile?.userData.id ? (
                    <ProfileComponent
                        userProfile={userProfile as UserProfile}
                        id={id as string}
                        isFollowing={following}
                        setIsFollowing={setFollowing}
                    />
                ) : (
                    <PageLoaders loading={loading} />
                )}
            </Layout>
        </>
    )
}

export default UserDetailsPage