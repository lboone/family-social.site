"use client";
import useFcmToken from "@/hooks/useFcmToken";
import useGetUser from "@/hooks/useGetUser";
import { useMobilePullToRefresh } from "@/hooks/useMobilePullToRefresh";
import { API_URL_POST, API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { setPosts } from "@/store/postSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { handleAuthRequest } from "../utils/apiRequests";
import Feed from "./Feed";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import SidebarMobile from "./SidebarMobile";

const Home = () => {
  const { user, isActive, isVerified } = useGetUser();
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, notificationPermissionStatus, isNewToken } = useFcmToken();

  // Custom refresh function that refreshes feed data instead of page reload
  const refreshFeedData = useCallback(async () => {
    try {
      // Clear Redux store first to force a complete refresh
      dispatch(setPosts([]));

      // Refresh the posts feed with cache-busting
      const getAllPostReq = async () =>
        await axios.get(
          `${API_URL_POST}/all?page=1&limit=10&_t=${Date.now()}`,
          {
            withCredentials: true,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

      const result = await handleAuthRequest(null, getAllPostReq);

      if (result?.data?.data?.posts) {
        dispatch(setPosts(result.data.data.posts));
        toast.success("Feed updated!");
      }
    } catch (error) {
      console.error("❌ Failed to refresh feed data:", error);
      toast.error("Failed to refresh feed");
      throw error; // Re-throw to let the hook handle fallback
    }
  }, [dispatch]);

  // Initialize pull-to-refresh for mobile/PWA users
  const { isMobileDevice, isEnabled, isRefreshing } = useMobilePullToRefresh({
    onRefresh: refreshFeedData, // Use custom refresh instead of page reload
    enabled: true,
    visibilityReloadDelay: 3000, // 3 seconds delay after tab becomes visible
    throttleInterval: 30000, // 30 seconds minimum between reloads (matches your backend throttle)
  });

  // Log pull-to-refresh status for debugging
  useEffect(() => {
    console.log("🔄 Pull-to-refresh status:", {
      isMobileDevice,
      isEnabled,
      isRefreshing,
      userAgent: navigator.userAgent,
      isPWA: window.matchMedia("(display-mode: standalone)").matches,
    });
  }, [isMobileDevice, isEnabled, isRefreshing]);

  useEffect(() => {
    // Only send FCM token to backend if:
    // 1. Permission is granted
    // 2. We have a token
    // 3. It's a new token (first time or refreshed)
    if (notificationPermissionStatus === "granted" && token && isNewToken) {
      console.log("🔌 Sending new/refreshed FCM token to backend:", token);

      const pns = {
        fcmToken: token,
        pushEnabled: true,
        comments: false,
        follow: false,
        likes: false,
        postType: "none",
        unfollow: false,
      };
      const newFormData = new FormData();
      newFormData.append("pushNotificationSettings", JSON.stringify(pns));

      axios
        .post(`${API_URL_USER}/edit-profile`, newFormData, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.data.status === "success") {
            dispatch(setAuthUser(response.data.data.user));
            console.log("✅ FCM token successfully updated on backend");
          }
        })
        .catch((error) => {
          console.error("❌ Failed to update FCM token on backend:", error);
        });
    } else if (
      notificationPermissionStatus === "granted" &&
      token &&
      !isNewToken
    ) {
      console.log(
        "🔌 FCM token already exists and is current - skipping backend update"
      );
    } else if (notificationPermissionStatus === "denied") {
      console.log("🔌 Push notifications denied by user");
    } else if (!token) {
      console.log("🔌 No FCM token available");
    }
  }, [dispatch, token, notificationPermissionStatus, isNewToken]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/signup");
    } else if (!isVerified) {
      router.push("/auth/verify");
    } else if (!isActive) {
      router.push("/auth/not-active");
    }
  }, [user, isActive, isVerified, router, dispatch]);

  if (!user || !isVerified || !isActive) {
    return null; // or return a loading spinner
  }

  return (
    <div className="flex">
      <div className="hidden md:block border-r-2 h-screen fixed w-[20%] z-10">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <SidebarMobile />
        <Feed />
      </div>
      <div className="w-[30%] pt-8 px-6 lg:block hidden">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
