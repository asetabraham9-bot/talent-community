import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigationByRole = {
  talent: [
    { label: "Overview", path: "/talent/dashboard" },
    { label: "My Profile", path: "/talent/profile" },
    { label: "Browse Challenges", path: "/challenges" },
    { label: "My Applications", path: "/talent/applications" },
    { label: "My Projects", path: "/talent/projects" },
  ],
  organization: [
    { label: "Overview", path: "/organization/dashboard" },
    { label: "Organization Profile", path: "/organization/profile" },
    { label: "My Challenges", path: "/organization/challenges" },
    { label: "Applications", path: "/organization/applications" },
    { label: "Projects", path: "/organization/projects" },
  ],
  admin: [
    { label: "Overview", path: "/admin/dashboard" },
    { label: "Organizations", path: "/admin/organizations" },
    { label: "Users", path: "/admin/users" },
  ],
};

export default function DashboardSidebar({ role = "talent" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navigation = navigationByRole[role] ?? navigationByRole.talent;

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="bg-[#102c46] text-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto">
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-500 text-sm font-extrabold tracking-wide text-white shadow-sm">
            TC
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold tracking-tight">
              Talent Community
            </span>
            <span className="mt-0.5 block text-xs text-slate-300">
              Skills into opportunities
            </span>
          </span>
        </NavLink>
      </div>

      {/* Nav */}
      <div className="px-4 pt-5 md:px-4">
        <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace menu
        </p>

        <nav
          aria-label="Dashboard navigation"
          className="flex gap-2 overflow-x-auto pb-4 md:flex-col md:overflow-visible md:pb-0"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith("/dashboard")}
              className={({ isActive }) =>
                [
                  "shrink-0 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300",
                  isActive
                    ? "bg-teal-500 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className="hidden flex-1 md:block" />

      {/* User info + logout */}
      <div className="hidden border-t border-white/10 p-5 md:block">
        {user && (
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-500 text-sm font-bold text-white">
              {user.name?.[0]?.toUpperCase() ?? <User size={16} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-xs capitalize text-slate-400">
                {user.email ?? user.role}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </div>
    </aside>
  );
}
