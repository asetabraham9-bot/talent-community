import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  FolderOpen,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
});

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const cardAnim = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

const CHALLENGE_STATUS_STYLES = {
  draft:      { bg: "bg-slate-100", text: "text-slate-600", label: "Draft" },
  published:  { bg: "bg-green-50",  text: "text-green-700", label: "Published" },
  paused:     { bg: "bg-amber-50",  text: "text-amber-700", label: "Paused" },
  closed:     { bg: "bg-red-50",    text: "text-red-600",   label: "Closed" },
  archived:   { bg: "bg-slate-100", text: "text-slate-500", label: "Archived" },
};

function ChallengeBadge({ status }) {
  const s = CHALLENGE_STATUS_STYLES[status] ?? CHALLENGE_STATUS_STYLES.draft;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>{s.label}</span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colors = {
    teal:  { icon: "bg-teal-50 text-teal-700",  val: "text-teal-700" },
    blue:  { icon: "bg-blue-50 text-blue-700",  val: "text-blue-700" },
    amber: { icon: "bg-amber-50 text-amber-700",val: "text-amber-700" },
    green: { icon: "bg-green-50 text-green-700",val: "text-green-700" },
  };
  const c = colors[color] ?? colors.teal;
  return (
    <motion.div variants={cardAnim} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.icon}`}><Icon size={22} /></div>
        <p className={`text-3xl font-extrabold ${c.val}`}>{value}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

function QuickLink({ to, icon: Icon, label, description }) {
  return (
    <motion.div variants={cardAnim}>
      <Link to={to}
        className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg">
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
export default function OrganizationDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [profileRes, challengesRes, projectsRes] = await Promise.allSettled([
          apiRequest("/organization/profile"),
          apiRequest("/challenges/my?limit=50"),
          apiRequest("/projects/my"),
        ]);
        if (profileRes.status === "fulfilled") setProfile(profileRes.value?.data?.profile ?? null);
        if (challengesRes.status === "fulfilled") {
          const d = challengesRes.value?.data;
          setChallenges(Array.isArray(d) ? d : []);
        }
        if (projectsRes.status === "fulfilled") {
          const d = projectsRes.value?.data;
          setProjects(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const publishedChallenges = challenges.filter(c => c.status === "published");
  const orgName = profile?.organizationName ?? user?.name ?? "Your organization";
  const isVerified = profile?.verificationStatus === "verified";
  const isPending = profile?.verificationStatus === "pending" || !profile;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible"
        className="relative overflow-hidden rounded-2xl bg-[#102c46] px-7 py-8 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Organization Workspace</span>
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">Welcome, {orgName}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {isVerified
                ? "Your organization is verified. Publish challenges and connect with talent."
                : isPending
                  ? "Your organization is awaiting verification. Set up your profile to get started."
                  : "Complete your profile and wait for admin verification."}
            </p>
          </div>
          {isPending && (
            <Link to="/organization/profile"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-400">
              Set up profile <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </motion.div>

      {/* Verification notice */}
      {!isVerified && profile && (
        <motion.div variants={fadeUp(0.05)} initial="hidden" animate="visible"
          className={`flex items-start gap-3 rounded-xl border px-5 py-4 text-sm ${
            profile.verificationStatus === "rejected"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}>
          <Clock3 size={17} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              {profile.verificationStatus === "rejected" ? "Verification rejected" : "Verification pending"}
            </p>
            <p className="mt-0.5 text-xs">
              {profile.verificationStatus === "rejected"
                ? "Your organization was not verified. Please contact support for details."
                : "An admin will review your organization profile. You will be notified once approved."}
            </p>
          </div>
        </motion.div>
      )}

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
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={BookOpen} label="Total Challenges" value={challenges.length} sub="All time" color="teal" />
          <StatCard icon={CheckCircle2} label="Published" value={publishedChallenges.length} sub="Visible to talents" color="green" />
          <StatCard icon={FolderOpen} label="Projects" value={projects.length} sub="Active collaborations" color="blue" />
          <StatCard icon={Building2} label="Profile" value={isVerified ? "Verified" : "Pending"} sub={isVerified ? "Organization verified" : "Awaiting review"} color={isVerified ? "green" : "amber"} />
        </motion.div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <RefreshCw size={16} />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent challenges */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Challenges</h3>
            <Link to="/organization/challenges" className="text-xs font-semibold text-teal-700 hover:text-teal-600">View all →</Link>
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
          ) : challenges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <Briefcase size={26} className="mx-auto text-teal-700" />
              <h4 className="mt-4 font-semibold text-slate-900">No challenges yet</h4>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                Publish your first challenge to start connecting with talented individuals.
              </p>
              <Link to="/organization/challenges"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
                Create challenge <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {challenges.slice(0, 5).map(challenge => (
                <motion.div key={challenge._id} variants={cardAnim}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-200 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{challenge.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Deadline: {formatDate(challenge.deadline)}
                      </p>
                    </div>
                    <ChallengeBadge status={challenge.status} />
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
            <QuickLink to="/organization/profile" icon={Building2} label="Organization Profile" description="Edit details and contact info" />
            <QuickLink to="/organization/challenges" icon={BookOpen} label="My Challenges" description="Create and manage challenges" />
            <QuickLink to="/organization/applications" icon={Users} label="Applications" description="Review talent applications" />
            <QuickLink to="/organization/projects" icon={FolderOpen} label="Projects" description="Manage active projects" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
