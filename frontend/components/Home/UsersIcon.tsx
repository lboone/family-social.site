"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { API_URL_USER } from "@/server";
import { User } from "@/types";
import axios from "axios";
import { UsersIcon as UsersIconOriginal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FormattedBio from "../Form/FormattedBio";
import PageLoader from "../Form/PageLoader";
import { handleAuthRequest } from "../utils/apiRequests";

interface UserGeneral extends User {
  postCount: number;
}
const UsersIcon = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserGeneral[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [open, setOpen] = useState(false);

  const handleClickSearch = () => {
    if (open === false) {
      const getAllUsersGeneral = async () => {
        const getAllUsersGeneralReq = async () =>
          await axios.get(`${API_URL_USER}/all-general`, {
            withCredentials: true,
          });
        const result = await handleAuthRequest(
          null,
          getAllUsersGeneralReq,
          setIsLoading
        );
        if (result) {
          console.log({ result });
          setUsers(result.data.data.users);
          setUsersCount(result.data.data.users.length);
        }
      };
      getAllUsersGeneral();
    }
    setOpen(!open);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open === false) {
          const getAllUsersGeneral = async () => {
            const getAllUsersGeneralReq = async () =>
              await axios.get(`${API_URL_USER}/all-general`, {
                withCredentials: true,
              });
            const result = await handleAuthRequest(
              null,
              getAllUsersGeneralReq,
              setIsLoading
            );
            if (result) {
              console.log({ result });
              setUsers(result.data.data.users);
              setUsersCount(result.data.data.users.length);
            }
          };
          getAllUsersGeneral();
        }
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen, setIsLoading]);
  return (
    <>
      <div
        onClick={handleClickSearch}
        className="flex items-center mb-2 rounded-lg p-3 cursor-pointer group transition-all duration-200 hover:bg-gray-100 space-x-2"
      >
        <div className="group-hover:scale-110 transition-all duration-200">
          <UsersIconOriginal />
        </div>
        <div className="lg:text-lg text-base flex items-center gap-3">
          <p>Users</p>
          <p className="text-muted-foreground text-sm">
            <span className="inline-block md:hidden lg:inline-block  mr-1">
              Press{" "}
            </span>
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">⌘</span>U
            </kbd>
          </p>
        </div>
      </div>
      {isLoading ? (
        <PageLoader />
      ) : (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search for user by username..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={`${usersCount} Users`}>
              {users.map((user) => (
                <CommandItem
                  key={user.username}
                  onSelect={() => {
                    router.push(`/profile/${user._id}`);
                  }}
                  className="flex flex-col items-start gap-1 p-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="font-semibold">
                      @{user.username.toLowerCase()}
                    </div>
                    <div className="text-sm text-muted-foreground flex-shrink-0 font-semibold">
                      {user.postCount} {user.postCount === 1 ? "post" : "posts"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground break-words w-full">
                    {user.bio ? (
                      <FormattedBio bio={user.bio} maxLength={60} />
                    ) : (
                      "User has no bio at this time."
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      )}
    </>
  );
};
export default UsersIcon;
