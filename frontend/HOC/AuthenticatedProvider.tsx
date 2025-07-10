"use client";

import PageLoader from "@/components/Form/PageLoader";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthenticatedProviderProps {
  children: React.ReactNode;
}
const AuthenticatedProvider = ({ children }: AuthenticatedProviderProps) => {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user, isVerified, isActive } = useGetUser();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    } else if (user && !isVerified) {
      router.push("/auth/verify");
    } else if (user && !isActive) {
      toast.error(
        "Your account is not active. Please look for an email from us when your account is activated."
      );
      router.push("/");
    } else {
      setIsPageLoading(false);
    }
  }, [user, router, isActive, isVerified]);

  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default AuthenticatedProvider;
