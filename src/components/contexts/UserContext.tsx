import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { UserData } from '@/@types';
import { secondaryAPI } from '@/configs';
import { handleError } from '@/hooks/error-handle';

type UserContextType = {
    user: UserData
    pageLoading: boolean
    setPageLoading: (l: boolean) => void
    setUser: (l: UserData) => void
    activeUsers: number
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {

    const [user, setUser] = useState<UserData>({
        email: '',
        hsc_batch: '',
        id: '',
        name: '',
        phone: '',
        profilePic: '',
        level: 0,
        is_paid: false,
        institute_name: '',
    });
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const [activeUsers, setActiveUsers] = useState<number>(0);

    useEffect(() => {
        async function getme() {
            const usercache = localStorage.getItem('user') || ''
            if (!!usercache) {
                const usercached = JSON.parse(usercache as string)
                setUser(usercached)
                getActiveUsers(usercached?.id as string)
            } else {
                try {
                    const response = await axios.get(`${secondaryAPI}/api/auth/user`, {
                       
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        }
                    });
                    setUser(response.data.user as UserData)
                    getActiveUsers(response.data.user?.id as string)
                    localStorage.setItem('user', JSON.stringify(response.data.user))
                } catch (error) {
                    handleError(error as AxiosError, getme)
                }
            }
        }
        getme()

        async function getActiveUsers(i: string) {
            try {
                if (!!i) {
                    const response = await axios.get(`${secondaryAPI}/api/active?uid=${i}`, {
                        // withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        }
                    });
                    setActiveUsers(response.data.activeUsers)
                }
            } catch (error) {
                console.log(error)
                handleError(error as AxiosError, () => getActiveUsers(i))
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <UserContext.Provider value={{ setUser, user, pageLoading, setPageLoading, activeUsers }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
