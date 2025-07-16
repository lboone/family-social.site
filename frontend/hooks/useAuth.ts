import { handleAuthRequest } from "@/components/utils/apiRequests";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface FollowUnfollowResponse {
  setLoading?: (loading: boolean) => void;
}
export const useFollowUnfollow = ({ setLoading }: FollowUnfollowResponse) => {
  const dispatch = useDispatch();

  const handleFollowUnfollow = async (userId: string) => {
    const followUnfollowReq = async () =>
      await axios.post(
        `${API_URL_USER}/follow-unfollow/${userId}`,
        {},
        { withCredentials: true }
      );

    const result = await handleAuthRequest(null, followUnfollowReq, setLoading);
    if (result?.data.status === "success") {
      dispatch(setAuthUser(result?.data.data.user));
      toast.success(result?.data.message);
      // Remove router.refresh() and router.push('/') to prevent navigation
      // The Redux state update will automatically update the UI
    }
  };
  return {
    handleFollowUnfollow,
  };
};
