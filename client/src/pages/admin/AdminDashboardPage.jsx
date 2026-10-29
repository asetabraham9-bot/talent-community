import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Trash2,
  Users,
  X,
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
  return new Date(d).toLocaleString("en-ET", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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

// ─── Audit Log Modal ─────────────────────────────────────────
function AuditLogModal({ log, mode, onClose, onSave }) {
  const isEdit = mode === "edit";
  const [formData, setFormData] = useState(log || {
    action: "",
    resourceType: "system",
    resourceId: "",
    reason: "",
    metadata: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!formData.action.trim()) {
      setError("Action is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await apiRequest(`/admin/audit-logs/${log.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            reason: formData.reason,
            metadata: formData.metadata ? JSON.parse(formData.metadata) : undefined,
          }),
        });
      } else {
        await apiRequest("/admin/audit-logs", {
          method: "POST",
          body: JSON.stringify({
            action: formData.action.trim(),
            resourceType: formData.resourceType,
            resourceId: formData.resourceId.trim() || undefined,
            reason: formData.reason.trim(),
            metadata: formData.metadata ? JSON.parse(formData.metadata) : undefined,
          }),
        });
      }
      onSave();
    } catch (err) {
      setError(err.message || "Failed to save audit log.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Audit Log" : "Create Audit Log"}</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {!isEdit && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Action <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.action}
                  onChange={e => setFormData({ ...formData, action: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="e.g. manual_system_check"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Resource Type <span className="text-red-500">*</span></label>
                <select
                  value={formData.resourceType}
                  onChange={e => setFormData({ ...formData, resourceType: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="talent_profile">Talent Profile</option>
                  <option value="organization">Organization</option>
                  <option value="challenge">Challenge</option>
                  <option value="application">Application</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Resource ID (optional)</label>
                <input
                  type="text"
                  value={formData.resourceId}
                  onChange={e => setFormData({ ...formData, resourceId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="MongoDB ObjectId"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Reason</label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Metadata (JSON)</label>
            <textarea
              rows={2}
              value={formData.metadata}
              onChange={e => setFormData({ ...formData, metadata: e.target.value })}
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 font-mono text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder='{"key": "value"}'
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />{error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" disabled={loading} onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────
function DeleteModal({ log, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/admin/audit-logs/${log.id}`, { method: "DELETE" });
      onConfirm();
    } catch (err) {
      setError(err.message || "Failed to delete audit log.");
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
          <h3 className="text-lg font-bold text-slate-900">Delete Audit Log</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-800">This action cannot be undone.</p>
              <p className="mt-1 text-xs text-red-700">The audit log will be permanently removed from the database.</p>
            </div>
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
            <button type="button" disabled={loading} onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState("");
  const [logsError, setLogsError] = useState("");
  const [modalState, setModalState] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

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

  const fetchAuditLogs = useCallback(async () => {
    setLogsLoading(true);
    setLogsError("");
    try {
      const res = await apiRequest(`/admin/audit-logs?page=${page}&limit=10`);
      const d = res?.data;
      setAuditLogs(Array.isArray(d?.logs) ? d.logs : []);
      setPagination(d?.pagination ?? { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      setLogsError(err.message || "Failed to load audit logs.");
    } finally {
      setLogsLoading(false);
    }
  }, [page, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  function handleModalClose() {
    setModalState(null);
    setRetryKey(k => k + 1);
    setSuccessMsg(
      modalState?.type === "create" ? "Audit log created successfully." :
      modalState?.type === "edit" ? "Audit log updated successfully." :
      "Audit log deleted successfully."
    );
    setTimeout(() => setSuccessMsg(""), 5000);
  }

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
          <StatCard icon={FileText} label="Audit Logs" value={pagination.total}
            sub="Total recorded activities" color="blue" />
        </motion.div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <RefreshCw size={16} />{error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left column: Pending orgs */}
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

        {/* Right column: Quick links */}
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

      {/* Audit Logs Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Platform Audit Logs</h3>
          <button
            onClick={() => setModalState({ type: "create" })}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">
            <Plus size={15} />
            Create Log
          </button>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-12 text-slate-600">
            <Loader2 size={20} className="animate-spin" /> Loading audit logs…
          </div>
        ) : logsError ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />{logsError}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <FileText size={26} className="mx-auto text-teal-700" />
            <h4 className="mt-4 font-semibold text-slate-900">No audit logs yet</h4>
            <p className="mt-2 text-sm text-slate-500">Start by creating your first audit log entry.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map(log => (
              <motion.div key={log.id} variants={cardAnim} initial="hidden" animate="visible"
                className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{log.action}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {log.resourceType}
                      </span>
                    </div>
                    {log.reason && <p className="mt-1 text-sm text-slate-600">{log.reason}</p>}
                    {log.metadata && (
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                    <p className="mt-2 text-xs text-slate-400">{formatDate(log.createdAt)}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setModalState({ type: "edit", log })}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setModalState({ type: "delete", log })}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!logsLoading && !logsError && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3">
            <p className="text-sm text-slate-600">
              Page <span className="font-bold">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
              {" "} · {pagination.total} total logs
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
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalState?.type === "create" && (
          <AuditLogModal mode="create" onClose={() => setModalState(null)} onSave={handleModalClose} />
        )}
        {modalState?.type === "edit" && (
          <AuditLogModal log={modalState.log} mode="edit" onClose={() => setModalState(null)} onSave={handleModalClose} />
        )}
        {modalState?.type === "delete" && (
          <DeleteModal log={modalState.log} onClose={() => setModalState(null)} onConfirm={handleModalClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
