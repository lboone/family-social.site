import { LoaderIcon } from "lucide-react";
const PageLoader = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <LoaderIcon className="w-20 h-20 animate-spin" />
    </div>
  );
};
export default PageLoader;
