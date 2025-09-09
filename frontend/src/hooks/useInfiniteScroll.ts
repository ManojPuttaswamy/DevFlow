import { useState, useEffect, useCallback } from "react";


interface UseInfiniteScrollOptions {
    threshold?: number;
    hasMore: boolean;
    loading: boolean;
}

export const useInfiniteScroll = (
    callback: () => void,
    options: UseInfiniteScrollOptions
) => {
    const { threshold = 100, hasMore, loading } = options;
    const [isFetching, setIsFetching] = useState(false);


    const handleScroll = useCallback(() => {
        if (loading || hasMore || isFetching ) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

        if(scrollTop + clientHeight >= scrollHeight - threshold){
            setIsFetching(true);
        }
    },[loading, hasMore, isFetching, threshold]);

    useEffect(()=> {
        if (!isFetching) return;
        callback();
        setIsFetching(false);
    },[isFetching, callback]);

    useEffect(() => {
        window.addEventListener('scroll',handleScroll);
        return () => window.removeEventListener('scroll',handleScroll);
    },[handleScroll]);

    return {isFetching};
};