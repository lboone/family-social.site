"use client";
import PageLoader from "@/components/Form/PageLoader";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface VerifiedProviderProps {
  children: React.ReactNode;
}
const VerifiedProvider = ({ children }: VerifiedProviderProps) => {
  const router = useRouter();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user, isVerified } = useGetUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else if (user && isVerified) {
      router.push("/");
    } else {
      setIsPageLoading(false);
    }
  }, [user, router, isVerified]);
  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default VerifiedProvider;
