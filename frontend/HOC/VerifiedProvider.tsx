"use client";
import PageLoader from "@/components/Form/PageLoader";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VerifiedProviderProps {
  children: React.ReactNode;
}
const VerifiedProvider = ({ children }: VerifiedProviderProps) => {
  const router = useRouter();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user, isVerified, isActive } = useGetUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }

    if (user && isVerified) {
      if (!isActive) {
        toast.error(
          "Your account is not active.  Please wait for admin to approve it."
        );
      }
      router.push("/");
    }
    setIsPageLoading(false);
  }, [router, user, isVerified, isActive, setIsPageLoading]);

  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default VerifiedProvider;
