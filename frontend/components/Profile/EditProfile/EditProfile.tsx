"use client";

import LeftSidebar from "../../Home/LeftSidebar";
import SidebarMobile from "../../Home/SidebarMobile";
import ChangeBioAndImage from "./ChangeBioAndImage";
import ChangePassword from "./ChangePassword";

const EditProfile = () => {
  return (
    <div className="flex">
      <div className="hidden md:block border-r-2 h-screen fixed w-[20%]">
        <LeftSidebar />
      </div>
      <div className="flex-1 md:ml-[20%] overflow-y-auto">
        <SidebarMobile />
        <div className="w-[80%] mx-auto">
          <ChangeBioAndImage />
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};
export default EditProfile;
