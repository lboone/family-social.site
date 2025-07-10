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
  const { user, isVerified } = useGetUser();

  useEffect(() => {
    if (user && !isVerified) {
      router.push("/auth/verify");
      toast.error("Please verify your account to access this page.");
    } else {
      setIsPageLoading(false);
    }
  }, [router, user, isVerified]);
  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default VerifiedProvider;
