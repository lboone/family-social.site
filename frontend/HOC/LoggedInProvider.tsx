"use client";

import PageLoader from "@/components/Form/PageLoader";
import useGetUser from "@/hooks/useGetUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LoggedInProviderProps {
  children: React.ReactNode;
}
const LoggedInProvider = ({ children }: LoggedInProviderProps) => {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { user } = useGetUser();

  useEffect(() => {
    if (user) {
      router.push("/");
    } else {
      setIsPageLoading(false);
    }
  }, [user, router]);

  return <>{isPageLoading ? <PageLoader /> : children}</>;
};
export default LoggedInProvider;
