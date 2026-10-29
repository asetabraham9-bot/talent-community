import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

function formatOrgType(t) {
  if (!t) return "—";
  return t.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

const STATUS_STYLES = {
  pending:  { bg: "bg-amber-50",  text: "text-amber-700", icon: Clock3,       label: "Pending" },
  verified: { bg: "bg-green-50",  text: "text-green-700", icon: CheckCircle2, label: "Verified" },
  rejected: { bg: "bg-red-50",    text: "text-red-700",   icon: XCircle,      label: "Rejected" },
};

function VerifyBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

// ─── Confirm modal ───────────────────────────────────────────
function ConfirmModal({ org, action, onClose, onDone }) {
  const isReject = action === "reject";
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      if (isReject) {
        if (!reason.trim()) { setError("A rejection reason is required."); setLoading(false); return; }
        await apiRequest(`/admin/organizations/${org.id}/reject`, {
          method: "PATCH",
          body: JSON.stringify({ reason: reason.trim() }),
        });
      } else {
        await apiRequest(`/admin/organizations/${org.id}/verify`, { method: "PATCH" });
      }
      onDone(org.id, isReject ? "rejected" : "verified");
    } catch (err) {
      setError(err.message || "Action failed.");
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
          <h3 className="text-lg font-bold text-slate-900">
            {isReject ? "Reject Organization" : "Verify Organization"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className={`mb-4 rounded-xl border px-4 py-3 ${isReject ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            <p className={`text-sm font-semibold ${isReject ? "text-red-800" : "text-green-800"}`}>
              {isReject ? "This organization will be rejected and notified." : "This organization will be verified and can now publish challenges."}
            </p>
            <p className={`mt-1 text-xs ${isReject ? "text-red-700" : "text-green-700"}`}>{org.organizationName}</p>
          </div>

          {isReject && (
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Rejection reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Provide a clear reason for rejection…"
                className="block w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={1000}
              />
            </div>
          )}

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />{error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="button" disabled={loading} onClick={handleConfirm}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${isReject ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : isReject ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
              {loading ? "Processing…" : isReject ? "Reject" : "Verify"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Org card ────────────────────────────────────────────────
function OrgCard({ org, onAction }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article variants={fadeUp}
      className={`rounded-2xl border bg-white shadow-sm transition ${org.verificationStatus === "pending" ? "border-amber-200" : "border-slate-200"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900">{org.organizationName}</h3>
            <p className="mt-0.5 text-xs capitalize text-slate-500">{formatOrgType(org.organizationType)}</p>
          </div>
          <VerifyBadge status={org.verificationStatus} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{org.description}</p>

        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          {org.location?.city && (
            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-teal-600" />
              {[org.location.city, org.location.region, org.location.country].filter(Boolean).join(", ")}
            </div>
          )}
          {org.contactEmail && (
            <div className="flex items-center gap-1.5"><Mail size={12} className="text-teal-600" />{org.contactEmail}</div>
          )}
          {org.website && (
            <div className="flex items-center gap-1.5"><Globe2 size={12} className="text-teal-600" />
              <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline truncate max-w-[200px]">{org.website}</a>
            </div>
          )}
          <p className="text-slate-400">Registered {formatDate(org.createdAt)}</p>
        </div>

        {org.verificationStatus === "pending" && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => onAction(org, "verify")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">
              <CheckCircle2 size={13} /> Verify
            </button>
            <button type="button" onClick={() => onAction(org, "reject")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
              <XCircle size={13} /> Reject
            </button>
            <button type="button" onClick={() => setExpanded(v => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              {expanded ? "Less" : "Full description"}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 pb-5 pt-4">
              <p className="text-sm leading-6 text-slate-700">{org.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [actionTarget, setActionTarget] = useState(null); // { org, action }
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Use the new all-organizations endpoint with status filter
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await apiRequest(`/admin/organizations?page=${page}&limit=20${statusParam}`);
      const d = res?.data;
      setOrgs(Array.isArray(d?.organizations) ? d.organizations : []);
      setPagination(d?.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  function handleDone(id, newStatus) {
    setOrgs(prev => prev.filter(o => o.id !== id));
    setActionTarget(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Admin Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Organizations</h2>
        <p className="mt-1 text-sm text-slate-500">Review and verify organization registrations.</p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["pending", "verified", "rejected"].map(s => (
          <button key={s} type="button" onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {STATUS_STYLES[s]?.label ?? s}
            {s === "pending" && !loading && orgs.length > 0 && statusFilter === "pending" && (
              <span className="ml-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                {pagination.total > 99 ? "99+" : pagination.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex justify-between">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <RefreshCw size={26} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-slate-900">Failed to load organizations</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button type="button" onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : orgs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <Building2 size={28} className="mx-auto text-teal-700" />
          <h3 className="mt-4 font-semibold text-slate-900">
            {statusFilter === "pending" ? "No pending verifications" : `No ${statusFilter} organizations`}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {statusFilter === "pending"
              ? "All organizations have been reviewed. Great work!"
              : "Organizations with this status will appear here."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            {statusFilter === "pending" ? `${pagination.total} organization${pagination.total !== 1 ? "s" : ""} awaiting review` : `${orgs.length} result${orgs.length !== 1 ? "s" : ""}`}
          </p>
          <motion.div variants={stagger} initial="hidden" animate="visible"
            className="grid gap-5 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {orgs.map(org => (
                <OrgCard key={org.id} org={org} onAction={(o, a) => setActionTarget({ org: o, action: a })} />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {pagination.totalPages}</span>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Next
              </button>
            </nav>
          )}
        </>
      )}

      <AnimatePresence>
        {actionTarget && (
          <ConfirmModal
            org={actionTarget.org}
            action={actionTarget.action}
            onClose={() => setActionTarget(null)}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
