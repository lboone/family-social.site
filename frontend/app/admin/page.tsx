import Admin from "@/components/Home/Admin";
import AdminProvider from "@/HOC/AdminProvider";

const AdminPage = () => {
  return (
    <AdminProvider>
      <Admin />
    </AdminProvider>
  );
};
export default AdminPage;
