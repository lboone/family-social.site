"use client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { API_URL_POST } from "@/server";
import axios from "axios";
import { SearchIcon as SearchIconOriginal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "../Form/PageLoader";
import { handleAuthRequest } from "../utils/apiRequests";

interface Hashtag {
  count: number;
  hashtag: string;
}
const SearchIcon = () => {
  const router = useRouter();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [hashtagCount, setHashtagCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [open, setOpen] = useState(false);

  const handleClickSearch = () => {
    if (open === false) {
      const getAllHashtags = async () => {
        const getAllHashtagsReq = async () =>
          await axios.get(`${API_URL_POST}/hashtags`, {
            withCredentials: true,
          });
        const result = await handleAuthRequest(
          null,
          getAllHashtagsReq,
          setIsLoading
        );
        if (result) {
          console.log({ result });
          setHashtags(result.data.data.hashtags);
          setHashtagCount(result.data.results);
        }
      };
      getAllHashtags();
    }
    setOpen(!open);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (open === false) {
          const getAllHashtags = async () => {
            const getAllHashtagsReq = async () =>
              await axios.get(`${API_URL_POST}/hashtags`, {
                withCredentials: true,
              });
            const result = await handleAuthRequest(
              null,
              getAllHashtagsReq,
              setIsLoading
            );
            if (result) {
              console.log({ result });
              setHashtags(result.data.data.hashtags);
              setHashtagCount(result.data.results);
            }
          };
          getAllHashtags();
        }
        setOpen((prev) => !prev);
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
          <SearchIconOriginal />
        </div>
        <div className="lg:text-lg text-base flex items-center gap-3">
          <p>Search</p>
          <p className="text-muted-foreground text-sm">
            <span className="inline-block md:hidden lg:inline-block  mr-1">
              Press{" "}
            </span>
            <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
              <span className="text-xs">⌘</span>J
            </kbd>
          </p>
        </div>
      </div>
      {isLoading ? (
        <PageLoader />
      ) : (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search for a hashtag..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={`${hashtagCount} Hashtags`}>
              {hashtags.map((hashtag) => (
                <CommandItem
                  key={hashtag.hashtag}
                  onSelect={(currentValue) => {
                    router.push(`/hashtags/${hashtag.hashtag}`);
                    console.log("Current value:", currentValue);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="font-semibold">
                    #{hashtag.hashtag.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    {hashtag.count} {hashtag.count === 1 ? "post" : "posts"}
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
export default SearchIcon;
