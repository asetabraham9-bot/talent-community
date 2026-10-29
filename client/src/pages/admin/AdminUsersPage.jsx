import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PauseCircle,
  PlayCircle,
  Search,
  Shield,
  User,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// ─── Helpers ─────────────────────────────────────────────────
const STATUS_STYLES = {
  active:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Active" },
  suspended: { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400",    label: "Suspended" },
  deleted:   { bg: "bg-slate-50",  text: "text-slate-700",  dot: "bg-slate-400",  label: "Deleted" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.active;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Action modal ────────────────────────────────────────────
function ActionModal({ user, action, onClose, onDone }) {
  const isSuspend = action === "suspend";
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!reason.trim()) { setError("A reason is required."); return; }
    setLoading(true);
    setError("");
    try {
      const endpoint = isSuspend
        ? `/admin/users/${user.id}/suspend`
        : `/admin/users/${user.id}/reactivate`;
      const res = await apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      onDone(res.data);
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
            {isSuspend ? "Suspend User" : "Reactivate User"}
          </h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 ${isSuspend ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            {isSuspend ? <PauseCircle size={17} className="mt-0.5 shrink-0 text-red-600" /> : <PlayCircle size={17} className="mt-0.5 shrink-0 text-green-600" />}
            <div>
              <p className={`text-sm font-semibold ${isSuspend ? "text-red-800" : "text-green-800"}`}>
                {isSuspend ? "This user will lose access to the platform." : "This user will regain access to the platform."}
              </p>
              <p className={`mt-0.5 text-xs ${isSuspend ? "text-red-700" : "text-green-700"}`}>
                {user.fullName} ({user.email})
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => { setReason(e.target.value); setError(""); }}
              placeholder={isSuspend ? "State the reason for suspension…" : "State the reason for reactivation…"}
              className="block w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              maxLength={1000}
            />
          </div>

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
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${isSuspend ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : isSuspend ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
              {loading ? "Processing…" : isSuspend ? "Suspend" : "Reactivate"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── User card ───────────────────────────────────────────────
function UserCard({ user, onAction }) {
  const canSuspend = user.status === "active" && user.role !== "admin";
  const canReactivate = user.status === "suspended";

  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold">
          {user.fullName?.[0]?.toUpperCase() ?? <User size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs capitalize text-slate-400">
                {user.role === "admin" && <Shield size={11} />}
                {user.role}
              </p>
            </div>
            <StatusBadge status={user.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {canSuspend && (
              <button type="button" onClick={() => onAction(user, "suspend")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                <PauseCircle size={13} /> Suspend
              </button>
            )}
            {canReactivate && (
              <button type="button" onClick={() => onAction(user, "reactivate")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                <PlayCircle size={13} /> Reactivate
              </button>
            )}
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                <Shield size={13} /> Admin account
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTarget, setActionTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const roleParam = roleFilter !== "all" ? `&role=${roleFilter}` : "";
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await apiRequest(`/admin/users?page=${page}&limit=20${roleParam}${statusParam}`);
      const d = res?.data;
      setUsers(Array.isArray(d?.users) ? d.users : []);
      setPagination(d?.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleDone(updated) {
    setActionTarget(null);
    setSuccessMsg(`User ${updated.fullName ?? "account"} status updated to "${updated.status}".`);
    setTimeout(() => setSuccessMsg(""), 5000);
    setRetryKey(k => k + 1);
  }

  // Client-side search filter
  const displayedUsers = searchTerm.trim()
    ? users.filter(u => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Admin Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">User Management</h2>
        <p className="mt-1 text-sm text-slate-500">View and moderate all platform users.</p>
      </motion.div>

      {/* Success alert */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Search</label>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name or email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20">
              <option value="all">All Roles</option>
              <option value="talent">Talent</option>
              <option value="organization">Organization</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Loading / Error */}
      {loading && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-12 text-slate-600">
          <Loader2 size={20} className="animate-spin" /> Loading users…
        </motion.div>
      )}

      {error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />{error}
        </motion.div>
      )}

      {/* User list */}
      {!loading && !error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
          {displayedUsers.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-12 text-center text-slate-500">
              <User size={40} className="text-slate-300" />
              <p className="text-sm font-semibold">No users found</p>
            </div>
          )}

          {displayedUsers.map(user => (
            <UserCard key={user.id} user={user} onAction={(u, a) => setActionTarget({ ...u, action: a })} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3">
          <p className="text-sm text-slate-600">
            Page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
            {" "} · {pagination.total} total users
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Action modal */}
      <AnimatePresence>
        {actionTarget && (
          <ActionModal
            user={actionTarget}
            action={actionTarget.action}
            onClose={() => setActionTarget(null)}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
