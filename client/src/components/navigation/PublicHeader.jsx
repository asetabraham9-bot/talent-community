
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "Challenges", to: "/challenges" },
  { label: "Talent Showcase", to: "/talents" },
  { label: "About", to: "/about" },
];

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
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

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
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

        <div className="hidden items-center gap-4 lg:flex">
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
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 lg:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
              >
                {link.label}
              </Link>
            ))}
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
              className="mt-2 rounded-xl bg-teal-700 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Join the community
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
