import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import LeftSidebar from "./LeftSidebar";

const SidebarMobile = () => {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger>
          <div className="px-3 py-2 border shadow-md rounded-sm mt-2 ml-2">
            <MenuIcon className="text-gray-400 h-6 w-6" />
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
          <LeftSidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
};
export default SidebarMobile;
