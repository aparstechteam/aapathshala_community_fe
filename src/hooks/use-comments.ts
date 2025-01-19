import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { Comment } from '@/@types';
import { secondaryAPI } from '@/configs';
import { handleError } from './error-handle';


export function useComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();
    const postId = router?.query?.slug as string;

    const fetchComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axios.get<Comment[]>(`${secondaryAPI}/api/post/${postId}/comments`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setComments(data);

            if (data.length === 0) {
                const res = await axios.post(`${secondaryAPI}/api/post/${postId}/comments/ai`, { postId }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                if (res.status === 200) {
                    fetchComments();
                }
            }
        } catch (err) {
            handleError(err as AxiosError, fetchComments)
            setError(err as Error);
            setLoading(false)
        }
    }, [postId]);

    const addComment = useCallback(async (
        content: string,
        image: string | null = null,
        parentCommentId: string | null = null,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const { data: newComments } = await axios.post<Comment[]>(`${secondaryAPI}/api/post/${postId}/comments`, {
                content,
                parentCommentId,
                image,
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            setComments(prevComments => {
                const updatedComments = [...prevComments];
                newComments.forEach((comment) => {
                    if (parentCommentId) {
                        const parentComment = updatedComments.find(c => c.id === parentCommentId);
                        if (parentComment) {
                            parentComment.replies.push(comment);
                        }
                    } else {
                        updatedComments.push(comment);
                    }
                });
                return updatedComments;
            });
        } catch (err) {
            setError(err as Error);
            handleError(err as AxiosError, () => addComment(content, image, parentCommentId))
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }, [postId]);

    const deleteComment = useCallback(async (commentId: string) => {
        try {
            await axios.delete(`${secondaryAPI}/api/post/${postId}/comments/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
        } catch (err) {
            setError(err as Error);
            handleError(err as AxiosError, () => deleteComment(commentId))
        }
    }, [postId]);

    return {
        comments,
        loading,
        error,
        addComment,
        fetchComments,
        deleteComment,
    };
}