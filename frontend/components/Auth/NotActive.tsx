import { ShieldOffIcon } from "lucide-react";
import LogoutButton from "./LogoutButton";

const NotActive = () => {
  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <ShieldOffIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">Account Inactive</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        Your account has not been activated yet.
      </p>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        Please check you email for the notification when your account becomes
        active.
      </p>
      <LogoutButton variant="outline">Logout Out</LogoutButton>
    </div>
  );
};
export default NotActive;
