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
    institute_name: string;
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
    course_enrolled?: string[];
    hsc_batch: string;
};

type DashboardData = {
    totalPosts: number;
    totalComments: number;
    totalSatisfied: number;
};

export type UserProfile = {
    userData: UserData;
    dashboard: DashboardData;
    course_enrolled: string[];
};



const UserDetailsPage = () => {

    const router = useRouter()
    const id = router?.query?.id

    const [userProfile, setUserProfile] = useState<UserProfile>()
    const [loading, setLoading] = useState<boolean>(false)
    const [following, setFollowing] = useState<boolean>(true)


    useEffect(() => {
        async function getUserProfile() {
            try {
                setLoading(true)

                const response = await axios.get(`${secondaryAPI}/api/auth/profile/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                })
                setFollowing(response?.data?.userData.isFollowing);
                setUserProfile(response.data)
                setLoading(false)
            } catch (err) {
                setLoading(false)
                handleError(err as AxiosError, () => getUserProfile())
            }
        }
        if (!!id) getUserProfile()
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