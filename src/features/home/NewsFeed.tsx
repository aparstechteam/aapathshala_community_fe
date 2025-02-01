import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { PostSkeleton, useDebounce, useUser } from '@/components';
import { Post } from '@/@types';
import { PostComponent } from '../posts';
import { secondaryAPI } from '@/configs';
import { handleError } from '@/hooks/error-handle';

type TNewsFeed = {
  authorId?: string
  groupId?: string
  selectedSubject?: string
  sort?: string
  refetch?: () => void

}

export function NewsFeed(props: TNewsFeed) {

  const { groupId, selectedSubject, sort, refetch } = props
  const { user } = useUser()

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadMoreTrigger = useRef<HTMLDivElement>(null);

  const dSelectedSubject = useDebounce(selectedSubject, 600)
  const dsort = useDebounce(sort, 700)

  useEffect(() => {
    setTimeout(() => {
      setPosts([])
    })
  }, [dsort, dSelectedSubject, success])

  useEffect(() => {
    const getPosts = async () => {
      try {
        setError('')
        setLoading(true);
        const batchName = localStorage.getItem("hsc_batch") || user?.hsc_batch;
        if (!!user?.id) {
          const POST_API_URL = `${secondaryAPI}/api/post?page=${page}&pageSize=10&subjectId=${dSelectedSubject || ''}&sortedBy=${dsort || ''}&group=${groupId}&hsc_batch=${batchName}`;

          const response = await axios.get(POST_API_URL, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
              'X-Key-Id': user?.id
            }
          });
          const newPosts = await response.data.posts;
          if (posts.length === 0) {
            setPosts(newPosts);
          } else {
            setPosts((prevPosts) => [...prevPosts, ...newPosts]);
          }
          setIsFetching(false)
          setPage(page);
          setHasMore(newPosts.length > 0);
        }
        setLoading(false);
      } catch (err) {
        handleError(err as AxiosError, () => getPosts())
        setError('Failed to fetch posts');
        setLoading(false);
      }
    };

    getPosts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user, groupId, dSelectedSubject, dsort, success]);

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore || isFetching) return;

      const triggerElement = loadMoreTrigger.current;
      if (!triggerElement) return;

      const { top } = triggerElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (top <= windowHeight) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, isFetching]);

  useEffect(() => {
    if (!isFetching) return;

    setTimeout(() => {
      setPage(page + 1);
      setIsFetching(false);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);


  const updateReact = async (postId: string, t: string) => {
    const u = posts?.map((post) => {
      if (post.id === postId) {
        const existingReaction = post.reactions.find(x => x.user.id === user.id);
        if (existingReaction) {
          existingReaction.type = t;
        } else {
          post?.reactions?.push({ type: t, user: { id: user?.id, name: user?.name, profilePic: user?.profilePic, role: user?.role as string } });
        }
      }
      return post
    })
    setPosts(u)
  }

  return (
    <div className="grid gap-2 w-full">

      {error && (<div>Error: {error}</div>)}

      <div className="grid gap-2 w-full">
        {posts?.map((post) => (
          <PostComponent
            key={post?.id}
            post={post}
            updateReact={(t) => updateReact(post.id, t)}
            setSuccess={() => setSuccess((prev) => !prev)}
            refetch={refetch}
          />
        ))}
        {loading && (<PostSkeleton />)}
        {loading && posts.length === 0 && (
          Array.from({ length: 4 }).map((_, index) => (
            <PostSkeleton key={index} />
          ))
        )}
        {hasMore && <div ref={loadMoreTrigger} className="h-10 w-full" />}
      </div>
    </div>
  );
}