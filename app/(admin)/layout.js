import Sidebar from "../../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
