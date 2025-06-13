/* eslint-disable @typescript-eslint/no-unused-vars */
import { THomework } from "@/@types/homeworks"
import { HwqCard } from "./HwqCard"
import { PostSkeleton } from "@/components"
import { useEffect, useRef, useState } from "react"


type Props = {
    homeworks: THomework[]
    loading: boolean
    setPage: (page: number) => void
    page: number
    handleDelete: (id: string) => void
    hasMore: boolean
    isFetching: boolean
    setIsFetching: (isFetching: boolean) => void
}
export function HomeworkMain(props: Props) {
    const { homeworks, loading, setPage, page, handleDelete, hasMore, isFetching, setIsFetching } = props
    const loadMoreTrigger = useRef<HTMLDivElement>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, hasMore, isFetching]);

    useEffect(() => {
        if (!isFetching) return;

        setTimeout(() => {
            setPage(page + 1);
            setIsFetching(false);
        }, 300);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching]);

    return (
        <div className="grid gap-2 sm:gap-4">
            {homeworks?.map((hw) => (
                <HwqCard key={hw.id} homework={hw} handleDelete={() => handleDelete(hw.id)} />
            ))}

            {loading && (<PostSkeleton />)}
            {loading && homeworks.length === 0 && (
                Array.from({ length: 4 }).map((_, index) => (
                    <PostSkeleton key={index} />
                ))
            )}
            {hasMore && <div ref={loadMoreTrigger} className="h-10 w-full" />}
        </div>
    )
}

