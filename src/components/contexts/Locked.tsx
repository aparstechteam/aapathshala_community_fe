import { UserData } from '@/@types';
import { secondaryAPI } from '@/configs';
// import { handleError } from '@/hooks/error-handle';
import axios, { AxiosError } from 'axios';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Cookies from 'js-cookie';

export type AuthTypes = GetServerSidePropsContext & {
    user: UserData
}

export function withAuth(gssp: GetServerSideProps) {
    return async (context: GetServerSidePropsContext) => {
        const { req } = context;
        const token = req.cookies['accessToken'];

        if (!token) {
            return {
                redirect: {
                    destination: '/auth',
                    permanent: false,
                },
            };
        }

        try {
            const response = await axios.get(`${secondaryAPI}/api/auth/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            (context as AuthTypes).user = response.data.user;

            return await gssp(context);
        } catch (error) {
            errorHandler(error as AxiosError);
            return;
        }
    };
}


const errorHandler = async (err: AxiosError) => {
    if (err.response && err.response.status === 401) {
        try {
            const token = Cookies.get('accessToken');
            const refreshResponse = await axios.post(`${secondaryAPI}/api/auth/refresh`, {
                refreshToken: token
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            localStorage.setItem('accessToken', refreshResponse.data.accessToken)
            localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
            Cookies.set('accessToken', refreshResponse.data.accessToken)
            Cookies.set('refreshToken', refreshResponse.data.refreshToken)
        } catch {
            return {
                redirect: {
                    destination: '/auth',
                    permanent: false,
                },
            };
        }
    }
}
