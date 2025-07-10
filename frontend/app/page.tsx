import Home from "@/components/Home/Home";
import VerifiedProvider from "@/HOC/VerifiedProvider";

const HomePage = () => {
  return (
    <VerifiedProvider>
      <Home />
    </VerifiedProvider>
  );
};
export default HomePage;
