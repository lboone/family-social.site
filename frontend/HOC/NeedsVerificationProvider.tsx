"use client";
import PageLoader from "@/components/Form/PageLoader";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NeedsVerificationProviderProps {
  children: React.ReactNode;
}
const NeedsVerificationProvider = ({
  children,
}: NeedsVerificationProviderProps) => {
  const router = useRouter();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user, isVerified } = useGetUser();

  useEffect(() => {
    if (user && !isVerified) {
      router.push("/auth/verify");
    }
    setIsPageLoading(false);
  }, [router, user, isVerified, setIsPageLoading]);

  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default NeedsVerificationProvider;
