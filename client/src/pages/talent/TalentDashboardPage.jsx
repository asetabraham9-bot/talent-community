import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

// ─── Motion helpers ──────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
});

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// ─── Helpers ─────────────────────────────────────────────────
const STATUS_STYLES = {
  submitted:  { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Submitted" },
  shortlisted:{ bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Shortlisted" },
  accepted:   { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Accepted" },
  rejected:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400",    label: "Rejected" },
  withdrawn:  { bg: "bg-slate-100", text: "text-slate-500",  dot: "bg-slate-400",  label: "Withdrawn" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.submitted;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Stat card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal:   { icon: "bg-teal-50 text-teal-700",  val: "text-teal-700" },
    blue:   { icon: "bg-blue-50 text-blue-700",  val: "text-blue-700" },
    amber:  { icon: "bg-amber-50 text-amber-700",val: "text-amber-700" },
    green:  { icon: "bg-green-50 text-green-700",val: "text-green-700" },
  };
  const c = colors[color] ?? colors.teal;

  return (
    <motion.div
      variants={cardAnim}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.icon}`}>
          <Icon size={22} />
        </div>
        <p className={`text-3xl font-extrabold ${c.val}`}>{value}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

// ─── Quick link ──────────────────────────────────────────────
function QuickLink({ to, icon: Icon, label, description }) {
  return (
    <motion.div variants={cardAnim}>
      <Link
        to={to}
        className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
          <Icon size={21} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
        </div>
        <ArrowRight size={17} className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
      </Link>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function TalentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profileRes, appsRes] = await Promise.allSettled([
          apiRequest("/talent/profile"),
          apiRequest("/applications/my?limit=5"),
        ]);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value?.data?.profile ?? null);
        if (appsRes.status === "fulfilled") {
          const d = appsRes.value?.data;
          setApplications(Array.isArray(d) ? d : (Array.isArray(d?.applications) ? d.applications : []));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const appCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  const firstName = (user?.name || user?.fullName || "there").split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <motion.div
        variants={fadeUp(0)}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl bg-[#102c46] px-7 py-8 text-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-teal-400/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-blue-400/5 blur-xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-teal-300" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Talent Workspace</span>
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Welcome back, {firstName}!
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {profile
                ? "Your profile is live. Keep exploring new opportunities."
                : "Get started by completing your talent profile."}
            </p>
          </div>
          {!profile && (
            <Link
              to="/talent/profile"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
            >
              Complete profile
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex justify-between">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="h-8 w-12 rounded bg-slate-200" />
              </div>
              <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <RefreshCw size={16} className="shrink-0" />
          {error}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard icon={FileText} label="Total Applications" value={applications.length} sub="All time" color="teal" />
          <StatCard icon={CheckCircle2} label="Accepted" value={appCounts.accepted ?? 0} sub="Applications accepted" color="green" />
          <StatCard icon={Clock3} label="Pending Review" value={(appCounts.submitted ?? 0) + (appCounts.shortlisted ?? 0)} sub="Awaiting response" color="amber" />
          <StatCard icon={User} label="Profile" value={profile ? "Live" : "Incomplete"} sub={profile ? "Visible to organizations" : "Needs completion"} color="blue" />
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent applications */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Applications</h3>
            <Link to="/talent/applications" className="text-xs font-semibold text-teal-700 hover:text-teal-600">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex justify-between">
                    <div className="h-5 w-48 rounded bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <BookOpen size={26} className="mx-auto text-teal-700" />
              <h4 className="mt-4 font-semibold text-slate-900">No applications yet</h4>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                Browse the challenges directory and apply to opportunities that interest you.
              </p>
              <Link
                to="/challenges"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
              >
                Browse challenges
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <motion.div
                  key={app._id}
                  variants={cardAnim}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {app.challenge?.title ?? "Challenge"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Applied {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-4 text-base font-bold text-slate-900">Quick Actions</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            <QuickLink to="/talent/profile" icon={User} label="My Profile" description="Edit skills, bio and portfolio" />
            <QuickLink to="/challenges" icon={BookOpen} label="Browse Challenges" description="Discover new opportunities" />
            <QuickLink to="/talent/applications" icon={Briefcase} label="Applications" description="Track your submissions" />
            <QuickLink to="/talent/projects" icon={FolderOpen} label="Projects" description="View projects you joined" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
