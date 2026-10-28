import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
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
  pending:   { bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400",  label: "Pending" },
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
                {user.name} ({user.email})
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

// ─── Lookup result card ──────────────────────────────────────
function UserResultCard({ result, onAction }) {
  const canSuspend = result.status === "active" && result.role !== "admin";
  const canReactivate = result.status === "suspended";

  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-sm font-bold">
          {result.name?.[0]?.toUpperCase() ?? <User size={18} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{result.name}</p>
              <p className="text-xs text-slate-500">{result.email}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs capitalize text-slate-400">
                {result.role === "admin" && <Shield size={11} />}
                {result.role}
              </p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {canSuspend && (
              <button type="button" onClick={() => onAction(result, "suspend")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                <PauseCircle size={13} /> Suspend
              </button>
            )}
            {canReactivate && (
              <button type="button" onClick={() => onAction(result, "reactivate")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100">
                <PlayCircle size={13} /> Reactivate
              </button>
            )}
            {result.role === "admin" && (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                <Shield size={13} /> Admin accounts cannot be moderated
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────
// Note: The backend has no endpoint to list all users. Admin can only
// suspend/reactivate users by their ID. This page provides a manual
// lookup-by-ID or direct ID action flow.
export default function AdminUsersPage() {
  const [userId, setUserId] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionTarget, setActionTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Simulate a lookup by trying to suspend/reactivate — instead we can try
  // loading the profile via auth context or a test call. Since backend does
  // not expose GET /admin/users/:id, we expose the action modals directly.
  async function handleSuspend() {
    if (!userId.trim()) return;
    setActionTarget({ id: userId.trim(), name: userId.trim(), email: "—", status: "active", role: "talent" });
  }

  async function handleReactivate() {
    if (!userId.trim()) return;
    setActionTarget({ id: userId.trim(), name: userId.trim(), email: "—", status: "suspended", role: "talent" });
  }

  function handleDone(updated) {
    setActionTarget(null);
    setUserId("");
    setSuccessMsg(`User ${updated.fullName ?? "account"} status updated to "${updated.status}".`);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Admin Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">User Management</h2>
        <p className="mt-1 text-sm text-slate-500">Suspend or reactivate user accounts by their User ID.</p>
      </motion.div>

      {/* Notice */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">Platform user list is not exposed via API</p>
          <p className="mt-0.5 text-xs">
            Enter the MongoDB User ID of an account to moderate it. You can find user IDs via direct database access or reported by users.
          </p>
        </div>
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

      {/* Action card */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">Moderate a User Account</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">User ID (MongoDB ObjectId)</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 64f1a2b3c4d5e6f7a8b9c0d1"
                  value={userId}
                  onChange={e => { setUserId(e.target.value); setError(""); }}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />{error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!userId.trim() || loading}
              onClick={handleSuspend}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <PauseCircle size={15} />}
              Suspend this user
            </button>
            <button
              type="button"
              disabled={!userId.trim() || loading}
              onClick={handleReactivate}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
              Reactivate this user
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Clicking the button will open a confirmation dialog asking for a moderation reason.
          </p>
        </div>
      </motion.div>

      {/* Quick reference */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">Moderation Guide</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: PauseCircle,
              title: "Suspend Account",
              color: "text-red-600",
              bg: "bg-red-50",
              items: [
                "Blocks all login attempts",
                "Does not delete any data",
                "Requires a documented reason",
                "Only affects non-admin accounts",
              ],
            },
            {
              icon: PlayCircle,
              title: "Reactivate Account",
              color: "text-green-600",
              bg: "bg-green-50",
              items: [
                "Restores full platform access",
                "User can log in again",
                "Requires a documented reason",
                "Only works on suspended accounts",
              ],
            },
          ].map(card => (
            <div key={card.title} className={`rounded-xl border ${card.bg} p-4`}>
              <div className={`mb-3 flex items-center gap-2 font-semibold ${card.color}`}>
                <card.icon size={17} />
                {card.title}
              </div>
              <ul className="space-y-1.5">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className={`h-1.5 w-1.5 rounded-full ${card.bg === "bg-red-50" ? "bg-red-400" : "bg-green-400"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action modal */}
      <AnimatePresence>
        {actionTarget && (
          <ActionModal
            user={actionTarget}
            action={actionTarget.status === "active" ? "suspend" : "reactivate"}
            onClose={() => setActionTarget(null)}
            onDone={handleDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
