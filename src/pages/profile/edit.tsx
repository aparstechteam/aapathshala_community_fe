"use client"

import Head from "next/head"
import { Layout, useUser } from "@/components"
import { useState } from "react"
import { secondaryAPI } from "@/configs"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { ProfileEdit, UserEdit } from "@/features"
import { handleError } from "@/hooks/error-handle"

export default function ProfilePage() {
    const { user } = useUser()
    const [profileImage, setProfileImage] = useState('')
    const [loading, setLoading] = useState(false)
    const [me, setMe] = useState<UserEdit>({
        name: user?.name,
        phone: user?.phone,
        email: user?.email,
        instituteName: user?.instituteName,
        hsc_batch: user?.hsc_batch,
        gender: user?.gender,
        group: user?.group,
        goal: user?.goal
    })

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
        console.log(profileImage)
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setMe({ ...me, [e.target.id]: e.target.value })
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            setLoading(true)
            const res = await axios.post(`${secondaryAPI}/api/auth/update`, me, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            const updatedUser = res.data.message
            if (updatedUser) localStorage.removeItem('user')
            toast({
                title: 'Profile updated successfully',
                description: 'Your profile has been updated successfully',
                variant: 'success'
            })
            setLoading(false)
        } catch (err) {
            setLoading(false)
            handleError(err as AxiosError)
        }
    }

    return (
        <>
            <Head>
                <title>Smart Community | Edit</title>
            </Head>
            <Layout>
                <ProfileEdit
                    me={me}
                    setImage={handleImageChange}
                    handleChange={handleChange}
                    onSubmit={(e) => handleUpdate(e)}
                    loading={loading}
                />
            </Layout>
        </>
    )
}