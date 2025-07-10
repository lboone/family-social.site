"use client";
import useGetUser from "@/hooks/useGetUser";
import LogoutButton from "../Auth/LogoutButton";

const Home = () => {
  const { user } = useGetUser();

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">
        Welcome to Family Social
        {user && (
          <LogoutButton variant="outline" size="sm">
            Sign Out
          </LogoutButton>
        )}
      </h1>
    </div>
  );
};
export default Home;
