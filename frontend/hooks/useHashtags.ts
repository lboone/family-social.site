import { API_URL_POST } from "@/server";
import axios from "axios";
import { useEffect, useState } from "react";

interface Hashtag {
  hashtag: string;
  count: number;
}

export const useHashtags = () => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHashtags = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL_POST}/hashtags`, {
        withCredentials: true,
      });

      if (response.data?.status === "success") {
        setHashtags(response.data.data.hashtags || []);
      }
    } catch (err) {
      setError("Failed to fetch hashtags");
      console.error("Error fetching hashtags:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHashtags();
  }, []);

  return { hashtags, isLoading, error, refetch: fetchHashtags };
};
