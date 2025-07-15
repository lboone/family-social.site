import {
  HeartIcon,
  HomeIcon,
  LucideIcon,
  MessageCircleIcon,
  SearchIcon,
  SquarePlusIcon,
} from "lucide-react";

interface SidebarLink {
  icon: LucideIcon;
  label: string;
  href?: string;
}

export const SidebarLinks: SidebarLink[] = [
  {
    icon: HomeIcon,
    label: "Home",
    href: "/",
  },
  {
    icon: SearchIcon,
    label: "Search",
    href: "/search",
  },
  {
    icon: MessageCircleIcon,
    label: "Messages",
    href: "/messages",
  },
  {
    icon: HeartIcon,
    label: "Notifications",
    href: "/notifications",
  },
  {
    icon: SquarePlusIcon,
    label: "Create",
    href: "/create",
  },
];

// Special link for profile (since it uses Avatar component)
export const ProfileLink = {
  label: "Profile",
  href: "/profile",
};

export const HASHTAG_REGEX = /(?:^|[\s\n])(#[a-zA-Z0-9_]+)(?=[\s\n]|$)/g;
