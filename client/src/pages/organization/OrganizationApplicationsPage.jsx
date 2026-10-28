import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

// ─── Status ──────────────────────────────────────────────────
const APP_STATUS = {
  submitted:   { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",  label: "Submitted" },
  shortlisted: { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400", label: "Shortlisted" },
  accepted:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500", label: "Accepted" },
  rejected:    { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400",   label: "Rejected" },
  withdrawn:   { bg: "bg-slate-100", text: "text-slate-500",  dot: "bg-slate-400", label: "Withdrawn" },
};

function StatusBadge({ status }) {
  const s = APP_STATUS[status] ?? APP_STATUS.submitted;
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

// Allowed review transitions for organization
const REVIEW_ACTIONS = {
  submitted:   ["shortlisted", "accepted", "rejected"],
  shortlisted: ["accepted", "rejected"],
  accepted:    [],
  rejected:    [],
  withdrawn:   [],
};

// ─── Review modal ────────────────────────────────────────────
function ReviewModal({ application, onClose, onReviewed }) {
  const actions = REVIEW_ACTIONS[application.status] ?? [];
  const [newStatus, setNewStatus] = useState(actions[0] ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newStatus) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(`/applications/${application._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, reviewNotes: notes }),
      });
      onReviewed(res.data);
    } catch (err) {
      setError(err.message || "Failed to update application.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">Review Application</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <p className="text-sm text-slate-500">Talent: <span className="font-semibold text-slate-900">{application.talent?.name ?? application.talent?.fullName ?? "Unknown"}</span></p>
            <p className="text-sm text-slate-500">Current status: <span className="font-semibold capitalize">{application.status}</span></p>
          </div>

          {actions.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              This application cannot be further reviewed.
            </p>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">New status</label>
                <div className="space-y-2">
                  {actions.map(a => (
                    <button key={a} type="button" onClick={() => setNewStatus(a)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${newStatus === a ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                      <span className={`h-2 w-2 rounded-full ${APP_STATUS[a]?.dot ?? "bg-slate-400"}`} />
                      {APP_STATUS[a]?.label ?? a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Review notes (optional)</label>
                <textarea rows={3}
                  className="block w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Optional notes visible to the applicant…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  maxLength={2000}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={onClose}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={!newStatus || loading}
                  className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {loading ? "Saving…" : "Confirm review"}
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── App card ────────────────────────────────────────────────
function AppCard({ app, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const canReview = (REVIEW_ACTIONS[app.status] ?? []).length > 0;

  return (
    <motion.article variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-teal-200">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold">
            {(app.talent?.name ?? app.talent?.fullName ?? "?")[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{app.talent?.name ?? app.talent?.fullName ?? "Applicant"}</p>
                <p className="text-xs text-slate-500">{app.talent?.email}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={12} />
              Applied {formatDate(app.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {canReview && (
            <button type="button" onClick={() => onReview(app)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-800">
              <User size={12} /> Review
            </button>
          )}
          <button type="button" onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-4">
              {app.coverMessage && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Cover message</p>
                  <p className="text-sm leading-6 text-slate-700">{app.coverMessage}</p>
                </div>
              )}
              {Array.isArray(app.relevantSkills) && app.relevantSkills.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Relevant skills</p>
                  <div className="flex flex-wrap gap-2">
                    {app.relevantSkills.map(s => (
                      <span key={s} className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {Array.isArray(app.portfolioLinks) && app.portfolioLinks.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Portfolio links</p>
                  {app.portfolioLinks.map((link, i) => (
                    <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-teal-700 hover:underline">
                      <ArrowUpRight size={13} /> {link}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ─── Challenge selector ──────────────────────────────────────
function ChallengeSelector({ challenges, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onChange(null)}
        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${!selected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
        All challenges
      </button>
      {challenges.map(c => (
        <button key={c._id} type="button" onClick={() => onChange(c._id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${selected === c._id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          {c.title}
        </button>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function OrganizationApplicationsPage() {
  const [challenges, setChallenges] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const chRes = await apiRequest("/challenges/my");
      const chs = Array.isArray(chRes?.data) ? chRes.data : [];
      setChallenges(chs);

      // Load applications for all published/paused/closed challenges
      const activeChs = chs.filter(c => ["published","paused","closed"].includes(c.status));

      if (activeChs.length === 0) {
        setApplications([]);
        return;
      }

      const appResults = await Promise.allSettled(
        activeChs.map(c => apiRequest(`/applications/challenge/${c._id}`))
      );

      const all = appResults.flatMap((r, i) => {
        if (r.status !== "fulfilled") return [];
        const d = r.value?.data;
        const apps = Array.isArray(d) ? d : (Array.isArray(d?.applications) ? d.applications : []);
        return apps.map(a => ({ ...a, _challengeId: activeChs[i]._id, _challengeTitle: activeChs[i].title }));
      });

      setApplications(all);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleReviewed(updated) {
    setApplications(prev => prev.map(a => a._id === updated._id ? { ...a, ...updated } : a));
    setReviewTarget(null);
  }

  const byChallenge = selectedChallenge
    ? applications.filter(a => a._challengeId === selectedChallenge)
    : applications;

  const filtered = statusFilter === "all" ? byChallenge : byChallenge.filter(a => a.status === statusFilter);

  const counts = byChallenge.reduce((acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Organization Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Applications</h2>
        <p className="mt-1 text-sm text-slate-500">Review talent applications across all your challenges.</p>
      </motion.div>

      {/* Stats strip */}
      {!loading && !error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-3">
          {[
            { label: "Total", value: applications.length },
            { label: "Submitted", value: counts.submitted ?? 0 },
            { label: "Shortlisted", value: counts.shortlisted ?? 0 },
            { label: "Accepted", value: counts.accepted ?? 0 },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <p className="text-lg font-extrabold text-slate-700">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Challenge filter */}
      {!loading && challenges.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Filter by challenge</p>
          <ChallengeSelector
            challenges={challenges.filter(c => ["published","paused","closed"].includes(c.status))}
            selected={selectedChallenge}
            onChange={c => { setSelectedChallenge(c); setStatusFilter("all"); }}
          />
        </div>
      )}

      {/* Status filter */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {["all","submitted","shortlisted","accepted","rejected","withdrawn"].map(s => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s === "all" ? `All (${byChallenge.length})` : `${APP_STATUS[s]?.label ?? s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-40 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <RefreshCw size={26} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-slate-900">Failed to load applications</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button type="button" onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FileText size={26} className="mx-auto text-teal-700" />
          <h3 className="mt-4 font-semibold text-slate-900">
            {applications.length === 0 ? "No applications yet" : "No applications match your filters"}
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
            {applications.length === 0
              ? "Applications will appear here once talents apply to your challenges."
              : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(app => (
              <div key={app._id}>
                {!selectedChallenge && app._challengeTitle && (
                  <p className="mb-2 px-1 text-xs font-semibold text-slate-400">{app._challengeTitle}</p>
                )}
                <AppCard app={app} onReview={setReviewTarget} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {reviewTarget && (
          <ReviewModal application={reviewTarget} onClose={() => setReviewTarget(null)} onReviewed={handleReviewed} />
        )}
      </AnimatePresence>
    </div>
  );
}
