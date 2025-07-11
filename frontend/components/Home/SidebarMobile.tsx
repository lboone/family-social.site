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
          <MenuIcon />
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
