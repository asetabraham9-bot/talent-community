
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/navigation/DashboardSidebar";

export default function DashboardLayout({ role = "talent" }) {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar role={role} />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">TALENT COMMUNITY</p>
            <h1>Workspace</h1>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
