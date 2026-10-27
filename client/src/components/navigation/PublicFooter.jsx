
import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="bg-[#102c46] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500 font-bold text-white">
              TC
            </span>
            <span className="text-lg font-bold text-white">
              Talent Community
            </span>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
            A platform designed to connect talented people with organizations
            and meaningful challenges, helping skills grow through real
            opportunities and collaboration.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="hover:text-white" to="/challenges">Challenges</Link></li>
            <li><Link className="hover:text-white" to="/talents">Talent Showcase</Link></li>
            <li><Link className="hover:text-white" to="/about">About us</Link></li>
            <li><Link className="hover:text-white" to="/faqs">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-white">Get involved</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="hover:text-white" to="/register">Join as a talent</Link></li>
            <li><Link className="hover:text-white" to="/register">Join as an organization</Link></li>
            <li><Link className="hover:text-white" to="/contact">Contact us</Link></li>
            <li><Link className="hover:text-white" to="/login">Log in</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-400 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Talent Community.</p>
          <p>Connecting skills with meaningful opportunities.</p>
        </div>
      </div>
    </footer>
  );
}
