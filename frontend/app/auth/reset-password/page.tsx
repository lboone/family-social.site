import ResetPassword from "@/components/Auth/ResetPassword";
import EmailInParams from "@/HOC/EmailInParams";
import LoggedInProvider from "@/HOC/LoggedInProvider";

const ResetPasswordPage = () => {
  return (
    <LoggedInProvider>
      <EmailInParams>
        <ResetPassword />
      </EmailInParams>
    </LoggedInProvider>
  );
};
export default ResetPasswordPage;
