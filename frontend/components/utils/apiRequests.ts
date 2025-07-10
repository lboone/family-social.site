import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorResponse {
  message: string;
}

export const handleAuthRequest = async <T>(
  formData: T,
  requestCallback: (formData: T) => Promise<T>,
  setLoading?: (loading: boolean) => void
): Promise<T | null> => {
  if (setLoading) setLoading(true);
  try {
    const response = await requestCallback(formData);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    //console.error("API Error:", axiosError);
    if (axiosError.response?.data?.message) {
      //console.error("Error message:", axiosError.response.data.message);
      toast.error(axiosError.response.data.message);
    } else {
      toast.error("An unexpected error occurred");
    }
    return error as T; // Return the error as T for consistency
  } finally {
    if (setLoading) setLoading(false);
  }
};
