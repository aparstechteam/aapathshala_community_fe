import { Group } from '@/@types'
import { Layout, PageLoaders, useUser } from '@/components'
import { recaptchaKey, secondaryAPI } from '@/configs'
import { GroupComponent } from '@/features'
import { handleError } from '@/hooks/error-handle'
import axios, { AxiosError } from 'axios'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

const GroupPage = () => {

    const { user } = useUser()
    const router = useRouter()
    const slug = router?.query?.slug
    const [group, setGroup] = useState<Group>()
    const [loading, setLoading] = useState<boolean>(false)
    const [myGroups, setMyGroups] = useState<Group[]>([])
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
                    setGroup(response.data.group)
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
            } catch (err) {
                handleError(err as AxiosError, () => fetchGroups())
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    return (
        <>
            <Head>
                <title>Smart Community | Group</title>
            </Head>
            <Layout>
                <div className='min-h-[calc(100vh-80px)] flex flex-col justify-center gap-4'>
                    {loading && !group && (
                        <PageLoaders loading={loading} />
                    )}
                    {group && (
                        <GoogleReCaptchaProvider
                            reCaptchaKey={recaptchaKey ?? "NOT DEFINED"}
                            scriptProps={{
                                async: true,
                                defer: true,
                                appendTo: 'head',
                                nonce: undefined,
                            }}
                        >
                            <GroupComponent group={group as Group} id={user.id} groups={myGroups} />
                        </GoogleReCaptchaProvider>
                    )}
                </div>
            </Layout>
        </>
    )
}

export default GroupPage