import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

// ─── Status ──────────────────────────────────────────────────
const STATUS_STYLES = {
  planned:      { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400",  label: "Planned" },
  "in-progress":{ bg: "bg-blue-50",  text: "text-blue-700",  dot: "bg-blue-500",   label: "In Progress" },
  completed:    { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500",   label: "Completed" },
  cancelled:    { bg: "bg-red-50",   text: "text-red-600",   dot: "bg-red-400",     label: "Cancelled" },
};

const STATUS_TRANSITIONS = {
  planned:      ["in-progress", "cancelled"],
  "in-progress":["completed", "cancelled"],
  completed:    [],
  cancelled:    [],
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.planned;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Edit project modal ──────────────────────────────────────
function EditProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title ?? "",
    description: project.description ?? "",
    startDate: project.startDate ? project.startDate.slice(0, 10) : "",
    targetCompletionDate: project.targetCompletionDate ? project.targetCompletionDate.slice(0, 10) : "",
    outcomeSummary: project.outcomeSummary ?? "",
    deliverableLinks: Array.isArray(project.deliverableLinks) ? project.deliverableLinks : [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newLink, setNewLink] = useState("");

  const inputClass = "block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  function setField(key, value) {
    setForm(p => ({ ...p, [key]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form };
      if (body.startDate) body.startDate = new Date(body.startDate).toISOString();
      if (body.targetCompletionDate) body.targetCompletionDate = new Date(body.targetCompletionDate).toISOString();
      const res = await apiRequest(`/projects/${project._id}`, { method: "PATCH", body: JSON.stringify(body) });
      onSaved(res.data);
    } catch (err) {
      setError(err.message || "Failed to update project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }} className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">Edit Project</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Project title</label>
            <input required className={inputClass} value={form.title} onChange={e => setField("title", e.target.value)} maxLength={150} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea required rows={3} className={`${inputClass} resize-none`} value={form.description}
              onChange={e => setField("description", e.target.value)} maxLength={5000} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start date</label>
              <input type="date" className={inputClass} value={form.startDate} onChange={e => setField("startDate", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Target completion</label>
              <input type="date" className={inputClass} value={form.targetCompletionDate} onChange={e => setField("targetCompletionDate", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Outcome summary</label>
            <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Summarize the project outcome…"
              value={form.outcomeSummary} onChange={e => setField("outcomeSummary", e.target.value)} maxLength={3000} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deliverable links</label>
            {form.deliverableLinks.length > 0 && (
              <ul className="mb-2 space-y-1">
                {form.deliverableLinks.map((l, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    <span className="truncate">{l}</span>
                    <button type="button" onClick={() => setField("deliverableLinks", form.deliverableLinks.filter((_, j) => j !== i))} className="ml-2 shrink-0 text-slate-400 hover:text-red-500"><X size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input type="url" className={`${inputClass} flex-1`} placeholder="https://…" value={newLink} onChange={e => setNewLink(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newLink.trim()) { e.preventDefault(); setField("deliverableLinks", [...form.deliverableLinks, newLink.trim()]); setNewLink(""); } }} />
              <button type="button" onClick={() => { if (newLink.trim()) { setField("deliverableLinks", [...form.deliverableLinks, newLink.trim()]); setNewLink(""); } }}
                className="rounded-xl bg-teal-700 px-3 text-white hover:bg-teal-800"><Plus size={16} /></button>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Status modal ────────────────────────────────────────────
function StatusModal({ project, onClose, onUpdated }) {
  const nexts = STATUS_TRANSITIONS[project.status] ?? [];
  const [selected, setSelected] = useState(nexts[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/projects/${project._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: selected }),
      });
      onUpdated(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Update Project Status</h3>
        <p className="mt-1 text-sm text-slate-500">Current: <span className="font-semibold capitalize">{STATUS_STYLES[project.status]?.label ?? project.status}</span></p>
        {nexts.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">No further transitions available.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {nexts.map(s => (
              <button key={s} type="button" onClick={() => setSelected(s)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${selected === s ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[s]?.dot ?? "bg-slate-400"}`} />
                {STATUS_STYLES[s]?.label ?? s}
              </button>
            ))}
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {nexts.length > 0 && (
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={!selected || loading} onClick={handleChange}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
              {loading ? <Loader2 size={15} className="animate-spin" /> : null}
              Confirm
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Project card ────────────────────────────────────────────
function ProjectCard({ project, onEdit, onChangeStatus }) {
  return (
    <motion.article variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FolderOpen size={20} />
        </div>
        <StatusBadge status={project.status} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{project.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        {project.startDate && (
          <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-teal-600" />Started {formatDate(project.startDate)}</div>
        )}
        {project.targetCompletionDate && (
          <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-teal-600" />Target {formatDate(project.targetCompletionDate)}</div>
        )}
        {Array.isArray(project.contributors) && project.contributors.length > 0 && (
          <div className="flex items-center gap-1.5"><Users size={13} className="text-teal-600" />{project.contributors.length} contributor{project.contributors.length !== 1 ? "s" : ""}</div>
        )}
      </div>

      {project.challenge && (
        <Link to={`/challenges/${project.challenge._id ?? project.challenge}`}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
          <ArrowUpRight size={13} /> View challenge
        </Link>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={() => onEdit(project)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Edit3 size={13} /> Edit
        </button>
        <button type="button" onClick={() => onChangeStatus(project)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
          Change status
        </button>
      </div>
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function OrganizationProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/projects/my");
      const d = res?.data;
      setProjects(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  function handleSaved(updated) {
    setProjects(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
    setEditTarget(null);
  }

  function handleStatusUpdated(updated) {
    setProjects(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p));
    setStatusTarget(null);
  }

  const ALL_STATUSES = ["all","planned","in-progress","completed","cancelled"];
  const filtered = statusFilter === "all" ? projects : projects.filter(p => p.status === statusFilter);
  const counts = projects.reduce((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Organization Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Projects</h2>
        <p className="mt-1 text-sm text-slate-500">Manage and track all ongoing and completed projects.</p>
      </motion.div>

      {/* Status filter */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s === "all" ? `All (${projects.length})` : `${STATUS_STYLES[s]?.label ?? s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex justify-between">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <RefreshCw size={26} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-slate-900">Failed to load projects</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button type="button" onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FolderOpen size={28} className="mx-auto text-teal-700" />
          <h3 className="mt-4 font-semibold text-slate-900">
            {projects.length === 0 ? "No projects yet" : "No projects match this filter"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            {projects.length === 0
              ? "Projects are created when you accept applications and launch a challenge project."
              : "Try a different status filter."}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => (
              <ProjectCard key={p._id} project={p} onEdit={setEditTarget} onChangeStatus={setStatusTarget} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {editTarget && <EditProjectModal project={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
        {statusTarget && <StatusModal project={statusTarget} onClose={() => setStatusTarget(null)} onUpdated={handleStatusUpdated} />}
      </AnimatePresence>
    </div>
  );
}
