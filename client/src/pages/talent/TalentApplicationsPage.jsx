import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

// ─── Status ──────────────────────────────────────────────────
const STATUS_MAP = {
  submitted:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "Submitted" },
  shortlisted: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Shortlisted" },
  accepted:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Accepted" },
  rejected:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400",    label: "Rejected" },
  withdrawn:   { bg: "bg-slate-100", text: "text-slate-500",  dot: "bg-slate-400",  label: "Withdrawn" },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.submitted;
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

const ALL_STATUSES = ["all", "submitted", "shortlisted", "accepted", "rejected", "withdrawn"];

// ─── Application card ────────────────────────────────────────
function AppCard({ app, onWithdraw, withdrawingId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      layout
      variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-200"
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FileText size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                {app.challenge?.title ?? "Challenge"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={12} />
                Applied {formatDate(app.createdAt)}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {app.challenge?._id && (
              <Link
                to={`/challenges/${app.challenge._id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-600"
              >
                View challenge <ArrowUpRight size={12} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              {expanded ? "Hide details" : "View details"}
            </button>
            {app.status === "submitted" && (
              <button
                type="button"
                disabled={withdrawingId === app._id}
                onClick={() => onWithdraw(app._id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {withdrawingId === app._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
              {app.coverMessage && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Cover message</p>
                  <p className="text-sm leading-6 text-slate-700">{app.coverMessage}</p>
                </div>
              )}
              {Array.isArray(app.relevantSkills) && app.relevantSkills.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Relevant skills</p>
                  <div className="flex flex-wrap gap-2">
                    {app.relevantSkills.map(s => (
                      <span key={s} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(app.portfolioLinks) && app.portfolioLinks.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio links</p>
                  <div className="space-y-1">
                    {app.portfolioLinks.map((link, i) => (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
                        <ArrowUpRight size={13} />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function TalentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawError, setWithdrawError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/applications/my");
      const d = res?.data;
      setApplications(Array.isArray(d) ? d : (Array.isArray(d?.applications) ? d.applications : []));
    } catch (err) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleWithdraw(id) {
    setWithdrawingId(id);
    setWithdrawError("");
    try {
      await apiRequest(`/applications/${id}/withdraw`, { method: "PATCH" });
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: "withdrawn" } : a));
    } catch (err) {
      setWithdrawError(err.message || "Failed to withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  }

  const filtered = statusFilter === "all"
    ? applications
    : applications.filter(a => a.status === statusFilter);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Talent Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">My Applications</h2>
        <p className="mt-1 text-sm text-slate-500">Track and manage all your challenge applications.</p>
      </motion.div>

      {/* Stats strip */}
      {!loading && !error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-wrap gap-3">
          {[
            { label: "Total", value: applications.length, color: "text-slate-700" },
            { label: "Accepted", value: counts.accepted ?? 0, color: "text-green-700" },
            { label: "Shortlisted", value: counts.shortlisted ?? 0, color: "text-amber-700" },
            { label: "Pending", value: counts.submitted ?? 0, color: "text-blue-700" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter tabs */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === status
                  ? "bg-teal-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "all" ? `All (${applications.length})` : `${status} (${counts[status] ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {/* Error alerts */}
      {withdrawError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {withdrawError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-64 rounded bg-slate-200" />
                  <div className="h-4 w-32 rounded bg-slate-100" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <RefreshCw size={26} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-slate-900">Failed to load applications</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Clock3 size={26} className="mx-auto text-teal-700" />
          <h3 className="mt-4 font-semibold text-slate-900">
            {statusFilter === "all" ? "No applications yet" : `No ${statusFilter} applications`}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {statusFilter === "all"
              ? "Start by browsing challenges and submitting your first application."
              : "Try a different status filter."}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(app => (
              <AppCard key={app._id} app={app} onWithdraw={handleWithdraw} withdrawingId={withdrawingId} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
