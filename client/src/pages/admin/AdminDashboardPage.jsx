import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Clock3,
  RefreshCw,
  Shield,
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

function StatCard({ icon: Icon, label, value, sub, color = "teal", alert = false }) {
  const colors = {
    teal:  { icon: "bg-teal-50 text-teal-700",  val: "text-teal-700" },
    blue:  { icon: "bg-blue-50 text-blue-700",  val: "text-blue-700" },
    amber: { icon: "bg-amber-50 text-amber-700",val: "text-amber-700" },
    red:   { icon: "bg-red-50 text-red-700",    val: "text-red-700" },
  };
  const c = colors[color] ?? colors.teal;
  return (
    <motion.div variants={cardAnim}
      className={`rounded-2xl border bg-white p-5 shadow-sm ${alert ? "border-amber-200" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.icon}`}><Icon size={22} /></div>
        <p className={`text-3xl font-extrabold ${c.val}`}>{value}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

function QuickLink({ to, icon: Icon, label, description, badge }) {
  return (
    <motion.div variants={cardAnim}>
      <Link to={to}
        className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
          <Icon size={21} />
          {badge > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-sm leading-5 text-slate-500">{description}</p>
        </div>
        <ArrowRight size={17} className="mt-1 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
      </Link>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiRequest("/admin/organizations/pending?limit=5");
        const d = res?.data;
        setPendingOrgs(Array.isArray(d?.organizations) ? d.organizations : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName = (user?.name || user?.fullName || "Admin").split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible"
        className="relative overflow-hidden rounded-2xl bg-[#102c46] px-7 py-8 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-400/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-teal-400/5 blur-xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-teal-300" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Admin Workspace</span>
          </div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Platform Administration</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            Monitor platform activity, verify organizations, and ensure quality for the entire community.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1,2,3].map(i => (
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
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Building2} label="Pending Verifications" value={pendingOrgs.length}
            sub="Organizations awaiting review" color="amber" alert={pendingOrgs.length > 0} />
          <StatCard icon={Shield} label="Admin Role" value="Active" sub="Full platform access" color="teal" />
          <StatCard icon={Users} label="Platform Status" value="Live" sub="System running normally" color="blue" />
        </motion.div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <RefreshCw size={16} />{error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Pending orgs */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Pending Organization Verifications</h3>
            <Link to="/admin/organizations" className="text-xs font-semibold text-teal-700 hover:text-teal-600">View all →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex justify-between">
                    <div className="h-5 w-48 rounded bg-slate-200" />
                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                  </div>
                  <div className="mt-3 h-4 w-32 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : pendingOrgs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <Building2 size={26} className="mx-auto text-teal-700" />
              <h4 className="mt-4 font-semibold text-slate-900">No pending verifications</h4>
              <p className="mt-2 text-sm text-slate-500">All organizations have been reviewed. Check back later.</p>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              {pendingOrgs.map(org => (
                <motion.div key={org.id} variants={cardAnim}
                  className="rounded-2xl border border-amber-200 bg-white p-5 transition hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{org.organizationName}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs capitalize text-slate-500">
                        <Building2 size={11} />
                        {(org.organizationType ?? "").replace("_", " ")}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock3 size={11} />
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Registered {formatDate(org.createdAt)}</p>
                  <Link to="/admin/organizations"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-600">
                    Review <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-4 text-base font-bold text-slate-900">Admin Actions</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
            <QuickLink to="/admin/organizations" icon={Building2} label="Organizations"
              description="Verify or reject pending organizations" badge={pendingOrgs.length} />
            <QuickLink to="/admin/users" icon={Users} label="Users"
              description="Suspend or reactivate user accounts" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
