import { useCallback, useEffect, useRef, useState } from "react";

// Define a type constraint for items that must have an ID
interface WithId {
  _id?: string;
  id?: string;
}

interface UseInfiniteScrollProps<T extends WithId> {
  fetchFunction: (
    page: number
  ) => Promise<{ data: T[]; hasMore: boolean; totalCount?: number }>;
  dependencies?: React.DependencyList;
  resetTrigger?: string | number | boolean;
}

interface UseInfiniteScrollReturn<T extends WithId> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  totalCount: number;
  lastElementRef: (node: HTMLElement | null) => void;
  loadMore: () => Promise<void>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useInfiniteScroll<T extends WithId>({
  fetchFunction,
  dependencies = [],
  resetTrigger,
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const observer = useRef<IntersectionObserver | null>(null);

  // Reset function
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(false);
    setIsLoadingMore(false);
    setTotalCount(0);
    if (observer.current) {
      observer.current.disconnect();
    }
  }, []);

  // Reset when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      reset();
    }
  }, [resetTrigger, reset]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFunction(1);
        setData(result.data);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount || result.data.length);
        setPage(2); // Next page to load
      } catch (error) {
        console.error("Error loading initial data:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, fetchFunction]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchFunction(page);
      if (result.data.length > 0) {
        setData((prev) => {
          // Create a set of existing IDs for deduplication
          const existingIds = new Set(prev.map((item) => item._id || item.id));

          // Filter out duplicates from new data
          const newItems = result.data.filter(
            (item) => !existingIds.has(item._id || item.id)
          );

          return [...prev, ...newItems];
        });
        setHasMore(result.hasMore);
        setPage((prev) => prev + 1);
        if (result.totalCount !== undefined) {
          setTotalCount(result.totalCount);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more data:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [fetchFunction, page, hasMore, isLoadingMore]);

  // Intersection Observer callback
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMore]
  );

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    totalCount,
    lastElementRef,
    loadMore,
    reset,
    setData,
  };
}
