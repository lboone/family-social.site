"use client";

import PageLoader from "@/components/Form/PageLoader";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthenticatedProviderProps {
  children: React.ReactNode;
}
const AuthenticatedProvider = ({ children }: AuthenticatedProviderProps) => {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/auth/forgot-password");
      toast.error("Email is required to reset password");
    } else {
      setIsPageLoading(false);
    }
  }, [email, router]);

  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default AuthenticatedProvider;
