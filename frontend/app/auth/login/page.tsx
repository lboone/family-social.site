import Login from "@/components/Auth/Login";
import LoggedInProvider from "@/HOC/LoggedInProvider";

const LoginPage = () => {
  return (
    <LoggedInProvider>
      <Login />
    </LoggedInProvider>
  );
};
export default LoginPage;
