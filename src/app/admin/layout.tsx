import AdminLayout from "@/components/admin/layout/LayoutTest";
import { PropsWithChildren } from "react";
const Layout = ({ children }: PropsWithChildren) => {
    return <AdminLayout>{children}</AdminLayout>;
};

export default Layout;