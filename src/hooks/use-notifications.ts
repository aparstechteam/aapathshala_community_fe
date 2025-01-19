import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useUser } from "@/components";
import { Notification } from "@/@types";
import { secondaryAPI } from "@/configs";
import { handleError } from "./error-handle";


export const useNotifications = () => {
    const { user } = useUser();
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
  
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;

        try {
            setLoadingNotifications(true);
            const res = await axios.get(`${secondaryAPI}/api/notification`, {
                // withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            });
            setAllNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            handleError(error as AxiosError, () => fetchNotifications())
        } finally {
            setLoadingNotifications(false);
        }
    }, [user?.id]);

    const fetchNotificationCount = useCallback(async () => {
        if (!user?.id) return;

        try {
            const res = await axios.get(`${secondaryAPI}/api/notification/count`, {
                // withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                }
            });
            setNotificationCount(res.data);
        } catch (error) {
            console.error('Error fetching notification count:', error);
            handleError(error as AxiosError, () => fetchNotificationCount())
        }
    }, [user?.id]);

    useEffect(() => {
        fetchNotifications();
        fetchNotificationCount();
    }, [fetchNotifications, fetchNotificationCount]);

    return {
        allNotifications,
        loadingNotifications,
        notificationCount,
        refetch: {
            notifications: fetchNotifications,
            count: fetchNotificationCount,
        }
    };
};

