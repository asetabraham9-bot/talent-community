import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicHeader />

      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Compass size={40} />
          </div>

          <p className="text-6xl font-extrabold text-teal-700">404</p>

          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Page not found
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-slate-600">
            The page you're looking for doesn't exist or may have been moved.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              <ArrowLeft size={17} />
              Back to home
            </Link>
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Browse challenges
            </Link>
          </div>
        </motion.div>
      </main>

      <PublicFooter />
    </div>
  );
}
