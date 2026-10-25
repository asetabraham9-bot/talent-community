
import { NavLink } from "react-router-dom";

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
    { label: "Users", path: "/admin/users" },
    { label: "Organizations", path: "/admin/organizations" },
    { label: "Challenges", path: "/admin/challenges" },
  ],
};

export default function DashboardSidebar({ role = "talent" }) {
  const navigation = navigationByRole[role] ?? navigationByRole.talent;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">TC</span>
        <span>Talent Community</span>
      </div>

      <p className="sidebar-section-label">WORKSPACE</p>

      <nav aria-label="Dashboard navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.endsWith("/dashboard")}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-role">
          {role.charAt(0).toUpperCase() + role.slice(1)} workspace
        </span>
      </div>
    </aside>
  );
}
