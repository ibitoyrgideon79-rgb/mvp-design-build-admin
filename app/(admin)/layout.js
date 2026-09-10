import Sidebar from "../../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-1">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
