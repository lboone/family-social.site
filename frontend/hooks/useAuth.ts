import { handleAuthRequest } from "@/components/utils/apiRequests";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface FollowUnfollowResponse {
  setLoading?: (loading: boolean) => void;
}
export const useFollowUnfollow = ({ setLoading }: FollowUnfollowResponse) => {
  const dispatch = useDispatch();
  const router = useRouter();

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
      router.refresh();
      router.push(`/`);
    }
  };
  return {
    handleFollowUnfollow,
  };
};
