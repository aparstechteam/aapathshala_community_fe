/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Club } from '@/@types'
import { Layout, useUser } from '@/components'
import { ClubComponent } from '@/features'
import Head from 'next/head'
import axios, { AxiosError } from 'axios'
import { recaptchaKey, secondaryAPI } from '@/configs'
import { handleError } from '@/hooks/error-handle'
import { useRouter } from 'next/router'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const ClubPage = () => {

    const router = useRouter()
    const { slug } = router.query
    const { user } = useUser()

    const [club, setClub] = useState<Club | null>(null)
    const [clubs, setClubs] = useState<Club[]>([])
    const [courses, setCourses] = useState<Club[]>([])
    const [loading, setLoading] = useState<boolean>(false)


    useEffect(() => {
        async function getGroup() {
            try {
                setLoading(true)
                if (!!slug) {
                    const response = await axios.get(`${secondaryAPI}/api/group/${slug}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    })
                    setClub(response.data.group)
                }
                setLoading(false)
            } catch (err) {
                handleError(err as AxiosError, () => getGroup())
                setLoading(false)
                console.log(err)
            }
        }
        getGroup()
    }, [slug, router])

    useEffect(() => {
        const getMyGroups = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${secondaryAPI}/api/group/mygroups`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setClubs(response.data.groups);
                setCourses(response.data.courseGroups);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                handleError(err as AxiosError, () => getMyGroups())
            }
        };
        getMyGroups()
    }, []);

    return (
        <>
            <Head>
                <title>Club</title>
            </Head>
            <Layout>
                <div className='min-h-[calc(100vh-80px)] flex flex-col justify-center gap-4'>
                    <GoogleReCaptchaProvider
                        reCaptchaKey={recaptchaKey ?? "NOT DEFINED"}
                        scriptProps={{
                            async: true,
                            defer: true,
                            appendTo: 'head',
                            nonce: undefined,
                        }}
                    >
                        <ClubComponent club={club as Club} id={user.id} clubs={clubs} courses={courses} />
                    </GoogleReCaptchaProvider>
                </div>
            </Layout>
        </>
    )
}

export default ClubPage