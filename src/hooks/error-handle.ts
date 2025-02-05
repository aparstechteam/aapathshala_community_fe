
import { secondaryAPI } from '@/configs';
import axios, { AxiosError } from 'axios';
import Router from 'next/router';
import { toast } from './use-toast';
import Cookies from 'js-cookie';

export const handleError = async (error: AxiosError, refetch?: () => void) => {


    if (error.response && error.response.status === 402) {
        toast({
            title: 'Developer Error',
            description: 'No Token Found',
            variant: 'destructive'
        })
        localStorage.clear()
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        Router.push('/auth')
        return
    }


    if (error.response && error.response.status === 404) {
        Router.push('/auth')
        return
    }

    if (error.response && error.response.status === 401) {
        try {
            const refreshResponse = await axios.post(`${secondaryAPI}/api/auth/refresh`, {
                refreshToken: localStorage.getItem('refreshToken')
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            localStorage.setItem('accessToken', refreshResponse.data.accessToken)
            localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
            Cookies.set('accessToken', refreshResponse.data.accessToken)
            Cookies.set('refreshToken', refreshResponse.data.refreshToken)

            if (refetch) {
                refetch()
            }
        } catch {
            Router.push('/auth')
        }
    }

};
