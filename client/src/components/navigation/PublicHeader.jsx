import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Challenges", to: "/challenges" },
  { label: "Talent Showcase", to: "/talents" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const dashboardPath = {
  talent: "/talent/dashboard",
  organization: "/organization/dashboard",
  admin: "/admin/dashboard",
};

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  }

  const userDashboard = user ? (dashboardPath[user.role] ?? "/") : "/";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 font-bold text-white shadow-sm">
            TC
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-900">
              Talent Community
            </span>
            <span className="hidden text-xs text-slate-500 sm:block">
              Skills into opportunities
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-teal-700"
                    : "text-slate-600 hover:text-teal-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:bg-teal-50"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-700 text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </span>
                <span className="max-w-[140px] truncate">
                  {user?.name ?? "Account"}
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
                  >
                    <div className="border-b border-slate-100 px-4 pb-2">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                        {user?.name}
                      </p>
                      <p className="text-xs capitalize text-teal-700">
                        {user?.role}
                      </p>
                    </div>
                    <Link
                      to={userDashboard}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <LayoutDashboard size={16} />
                      Go to Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-teal-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md"
              >
                Join the community
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-800 transition hover:bg-slate-50 lg:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile navigation"
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-slate-100 pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={userDashboard}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="mt-2 block rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Join the community
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
