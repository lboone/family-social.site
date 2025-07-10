import Signup from "@/components/Auth/Signup";
import LoggedInProvider from "@/HOC/LoggedInProvider";

const SignUpPage = () => {
  return (
    <LoggedInProvider>
      <Signup />
    </LoggedInProvider>
  );
};
export default SignUpPage;
