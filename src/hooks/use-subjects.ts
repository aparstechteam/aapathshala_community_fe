import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { secondaryAPI } from '@/configs';
import { handleError } from './error-handle';
import { useUser } from '@/components';
import { Chapter, Subject } from '@/@types';

export const useSubject = () => {
    const { user } = useUser();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topicLoading, setTopicLoading] = useState<boolean>(false);
    const [subLoading, setSubLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setSubLoading(true);
                const subjectResponse = await axios.get(`${secondaryAPI}/api/subjects`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                setSubjects(subjectResponse.data);

            } catch (err) {
                handleError(err as AxiosError, fetchSubjects);
            } finally {
                setSubLoading(false);
            }
        };

        fetchSubjects();
    }, [user]);

    async function getChapters(subjectId: string) {
        try {
            setTopicLoading(true);
            const response = await axios.get(`${secondaryAPI}/api/subjects/${subjectId}/chapters`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setTopicLoading(false);
            return response.data.chapters as Chapter[];
        } catch (error) {
            setTopicLoading(false);
            handleError(error as AxiosError, () => getChapters(subjectId))
            return [] as Chapter[]
        }
    }

    return { subjects, getChapters, topicLoading, subLoading };
};
