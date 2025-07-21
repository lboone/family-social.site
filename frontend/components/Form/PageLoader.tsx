import LoadingSpinner from "../ui/LoadingSpinner";

const PageLoader = () => {
  return (
    <div className="h-screen flex justify-center items-center py-20">
      <LoadingSpinner size="lg" />
    </div>
  );
};
export default PageLoader;
