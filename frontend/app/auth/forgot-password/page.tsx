import ForgotPassword from "@/components/Auth/ForgotPassword";
import LoggedInProvider from "@/HOC/LoggedInProvider";

const ForgotPasswordPage = () => {
  return (
    <LoggedInProvider>
      <ForgotPassword />
    </LoggedInProvider>
  );
};
export default ForgotPasswordPage;
