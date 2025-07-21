"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL_POST } from "@/server";
import axios from "axios";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import DynamicBreadcrumb from "../Breadcrumb/DynamicBreadcrumb";
import PageLoader from "../Form/PageLoader";
import LoadingSpinner from "../ui/LoadingSpinner";
import { handleAuthRequest } from "../utils/apiRequests";

interface Hashtag {
  hashtag: string;
  count: number;
}

export default function FeedHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Load initial hashtags
  useEffect(() => {
    const getAllHashtags = async () => {
      const getAllHashtagsReq = async () =>
        await axios.get(`${API_URL_POST}/hashtags?page=1&limit=10`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(
        null,
        getAllHashtagsReq,
        setIsLoading
      );
      if (result) {
        setHashtags(result.data.data.hashtags);
        setHasMore(result.data.data.hashtags.length === 10);
        setPage(2);
      }
    };
    getAllHashtags();
  }, []);

  // Load more hashtags
  const loadMoreHashtags = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const getAllHashtagsReq = async () =>
        await axios.get(`${API_URL_POST}/hashtags?page=${page}&limit=10`, {
          withCredentials: true,
        });
      const result = await handleAuthRequest(null, getAllHashtagsReq);
      if (result && result.data.data.hashtags.length > 0) {
        setHashtags((prev) => [...prev, ...result.data.data.hashtags]);
        setHasMore(result.data.data.hashtags.length === 10);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more hashtags:", error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

  // Intersection Observer callback
  const lastHashtagElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreHashtags();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, loadMoreHashtags]
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-2 w-full md:w-[70%] md:px-0 mx-auto">
      <DynamicBreadcrumb className="mb-4" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Popular Hashtags
        </h1>
        <p className="text-lg text-gray-600 text-center">
          Discover trending topics and join the conversation
        </p>
      </div>

      {hashtags.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            No Hashtags Found
          </h2>
          <p className="text-gray-500">
            Start creating posts with hashtags to see them here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Hashtag</TableHead>
                  <TableHead className="text-center">Post Count</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hashtags.map((hashtag, index) => {
                  // Attach ref to the last hashtag for infinite scrolling
                  const isLastItem = hashtags.length === index + 1;
                  return (
                    <TableRow
                      key={hashtag.hashtag}
                      ref={isLastItem ? lastHashtagElementRef : null}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        <span className="text-lg font-semibold text-blue-600">
                          #{hashtag.hashtag}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {hashtag.count}{" "}
                          {hashtag.count === 1 ? "post" : "posts"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/hashtags/${encodeURIComponent(
                            hashtag.hashtag
                          )}`}
                        >
                          <Button variant="outline" size="sm">
                            View Posts
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Load More Button */}
          {hasMore && !isLoadingMore && hashtags.length >= 10 && (
            <div className="flex justify-center">
              <Button
                onClick={loadMoreHashtags}
                variant="outline"
                className="w-full max-w-sm"
              >
                Load More Hashtags
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator for more hashtags */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="md" text="Loading more hashtags..." />
        </div>
      )}

      {/* End message when no more hashtags */}
      {!hasMore && hashtags.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">
            You&apos;ve seen all available hashtags
          </p>
        </div>
      )}
    </div>
  );
}
