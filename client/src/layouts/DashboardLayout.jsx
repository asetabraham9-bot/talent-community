
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/navigation/DashboardSidebar";

const workspaceTitles = {
  talent: "Talent Workspace",
  organization: "Organization Workspace",
  admin: "Admin Workspace",
};

export default function DashboardLayout({ role = "talent" }) {
  const workspaceTitle = workspaceTitles[role] ?? "Workspace";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
      <DashboardSidebar role={role} />

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Talent Community
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {workspaceTitle}
              </h1>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
              <span
                className="h-2 w-2 rounded-full bg-teal-500"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-600">
                Your workspace
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
