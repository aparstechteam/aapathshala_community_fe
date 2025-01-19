import React from 'react'
import { useUser } from '../contexts'
import { ValidImage } from './ValidImage'


export const UserImage = () => {
    const { user } = useUser()
    return (
        <ValidImage
            src={user?.image as string}
            alt="user"
            size='sm'
            className='!w-5 !h-5 rounded-full'
        />
    )
}