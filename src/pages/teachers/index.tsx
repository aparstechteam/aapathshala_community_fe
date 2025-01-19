/* eslint-disable @typescript-eslint/no-unused-vars */
import { Teacher } from '@/@types'
import { Avatar, AvatarFallback, AvatarImage, Header, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'

import Router from 'next/router'
import React, { useState } from 'react'


const TeachersPage = () => {

    const [teachers, setTeachers] = useState<Teacher[]>([])
    // useEffect(() => {
    //     async function getTeachers() {
    //         try {
    //             // const response = await axios.get(`${secondaryAPI}/api/utils/teachers`, {
    //             //     headers: {
    //             //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //             //     }
    //             // })
    //             // setTeachers(response.data)
    //         } catch {
    //             // handleError(error as AxiosError)
    //         }
    //     }
    //     getTeachers()
    // }, [])

    return (
        <div className='text-white w-full h-screen bg-[#171717]'>
            <Header />
            <div className='max-w-6xl pt-[72px] w-full mx-auto'>
                {teachers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-2 gap-2 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className='flex items-center gap-3'>
                            <Avatar className="w-8 h-8 cursor-pointer" onClick={() => Router.push(`/teachers/${t.id}`)}>
                                <AvatarImage src={t.profilePic} alt={t.name} referrerPolicy="no-referrer" />
                                <AvatarFallback>
                                    {t.name ? t.name?.split(' ').map((n: string) => n[0]).join('') : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col justify-start flex-1 min-w-0 line-clamp-2">
                                <h3 className="text-sm text-start font-semibold truncate cursor-pointer hover:text-teal-500" onClick={() => Router.push(`/teachers/${t.id}`)}>
                                    {t.name}
                                </h3>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <p className="text-xs text-start text-gray-600 truncate max-w-36 dark:text-gray-400">{t.email}</p>
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-teal-500 text-white'>{t.email}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeachersPage