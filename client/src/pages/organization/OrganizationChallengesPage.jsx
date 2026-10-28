import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Globe2,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

// ─── Constants ───────────────────────────────────────────────
const CATEGORIES = [
  "technology","education","health","agriculture","environment","business","community","engineering","other",
];

const PARTICIPATION_TYPES = ["remote","on-site","hybrid"];

const COMPENSATION_TYPES = ["paid","voluntary","supported","unspecified"];

const STATUS_STYLES = {
  draft:     { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400",  label: "Draft" },
  published: { bg: "bg-green-50",  text: "text-green-700", dot: "bg-green-500",  label: "Published" },
  paused:    { bg: "bg-amber-50",  text: "text-amber-700", dot: "bg-amber-400",  label: "Paused" },
  closed:    { bg: "bg-red-50",    text: "text-red-600",   dot: "bg-red-400",    label: "Closed" },
  archived:  { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400",  label: "Archived" },
};

const ALLOWED_TRANSITIONS = {
  draft:     ["published"],
  published: ["paused","closed"],
  paused:    ["published","closed"],
  closed:    ["archived"],
  archived:  [],
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
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

function formatCat(c) {
  if (!c) return "General";
  return c.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// ─── Empty form ──────────────────────────────────────────────
function emptyForm() {
  return {
    title: "",
    description: "",
    category: "technology",
    participationType: "remote",
    deadline: "",
    requiredSkills: [],
    location: { country: "Ethiopia", region: "", city: "" },
    compensationType: "unspecified",
    compensationDetails: "",
    eligibility: "",
    duration: "",
    expectedDeliverables: [],
  };
}

// ─── Challenge form modal ────────────────────────────────────
function ChallengeFormModal({ initial = null, onClose, onSaved }) {
  const isEditing = Boolean(initial?._id);
  const [form, setForm] = useState(() => initial
    ? {
        title: initial.title ?? "",
        description: initial.description ?? "",
        category: initial.category ?? "technology",
        participationType: initial.participationType ?? "remote",
        deadline: initial.deadline ? initial.deadline.slice(0, 10) : "",
        requiredSkills: Array.isArray(initial.requiredSkills) ? initial.requiredSkills : [],
        location: initial.location ?? { country: "Ethiopia", region: "", city: "" },
        compensationType: initial.compensationType ?? "unspecified",
        compensationDetails: initial.compensationDetails ?? "",
        eligibility: initial.eligibility ?? "",
        duration: initial.duration ?? "",
        expectedDeliverables: Array.isArray(initial.expectedDeliverables) ? initial.expectedDeliverables : [],
      }
    : emptyForm()
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");

  function setField(key, value) {
    setForm(p => ({ ...p, [key]: value }));
    setError("");
  }
  function setLocation(key, value) {
    setForm(p => ({ ...p, location: { ...p.location, [key]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...form };
      if (body.deadline) body.deadline = new Date(body.deadline).toISOString();
      const res = isEditing
        ? await apiRequest(`/challenges/${initial._id}`, { method: "PATCH", body: JSON.stringify(body) })
        : await apiRequest("/challenges", { method: "POST", body: JSON.stringify(body) });
      onSaved(res.data);
    } catch (err) {
      setError(err.message || "Failed to save challenge.");
    } finally {
      setSaving(false);
    }
  }

  function Field({ label, children, required }) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
      </div>
    );
  }

  const inputClass = "block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Challenge" : "Create New Challenge"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <Field label="Title" required>
            <input required className={inputClass} placeholder="A compelling challenge title" value={form.title}
              onChange={e => setField("title", e.target.value)} minLength={5} maxLength={150} />
          </Field>

          <Field label="Description" required>
            <textarea required rows={4} className={`${inputClass} resize-none`}
              placeholder="Describe the challenge, context, goals, and expected outcomes…"
              value={form.description} onChange={e => setField("description", e.target.value)}
              minLength={30} maxLength={5000} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <select required className={inputClass} value={form.category} onChange={e => setField("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{formatCat(c)}</option>)}
              </select>
            </Field>
            <Field label="Participation type" required>
              <select required className={inputClass} value={form.participationType} onChange={e => setField("participationType", e.target.value)}>
                {PARTICIPATION_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace("-", " ")}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Deadline" required>
              <input required type="date" className={inputClass} value={form.deadline}
                onChange={e => setField("deadline", e.target.value)} />
            </Field>
            <Field label="Duration">
              <input className={inputClass} placeholder="e.g. 4 weeks" value={form.duration}
                onChange={e => setField("duration", e.target.value)} maxLength={100} />
            </Field>
          </div>

          {/* Location */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Country">
              <input className={inputClass} placeholder="Ethiopia" value={form.location.country}
                onChange={e => setLocation("country", e.target.value)} />
            </Field>
            <Field label="Region">
              <input className={inputClass} placeholder="Region" value={form.location.region}
                onChange={e => setLocation("region", e.target.value)} />
            </Field>
            <Field label="City">
              <input className={inputClass} placeholder="City" value={form.location.city}
                onChange={e => setLocation("city", e.target.value)} />
            </Field>
          </div>

          {/* Required skills */}
          <Field label="Required skills">
            {form.requiredSkills.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {form.requiredSkills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                    {s}
                    <button type="button" onClick={() => setField("requiredSkills", form.requiredSkills.filter((_, j) => j !== i))} className="hover:text-red-500"><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} placeholder="Add a skill" value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newSkill.trim()) { e.preventDefault(); setField("requiredSkills", [...form.requiredSkills, newSkill.trim()]); setNewSkill(""); } }}
                maxLength={60} />
              <button type="button"
                onClick={() => { if (newSkill.trim()) { setField("requiredSkills", [...form.requiredSkills, newSkill.trim()]); setNewSkill(""); } }}
                className="rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                <Plus size={16} />
              </button>
            </div>
          </Field>

          {/* Compensation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Compensation type">
              <select className={inputClass} value={form.compensationType} onChange={e => setField("compensationType", e.target.value)}>
                {COMPENSATION_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </Field>
            <Field label="Compensation details">
              <input className={inputClass} placeholder="e.g. Stipend of 3,000 ETB/month" value={form.compensationDetails}
                onChange={e => setField("compensationDetails", e.target.value)} maxLength={1000} />
            </Field>
          </div>

          <Field label="Eligibility criteria">
            <textarea rows={2} className={`${inputClass} resize-none`} placeholder="Who can apply? (e.g. Open to undergraduate students)"
              value={form.eligibility} onChange={e => setField("eligibility", e.target.value)} maxLength={2000} />
          </Field>

          {/* Deliverables */}
          <Field label="Expected deliverables">
            {form.expectedDeliverables.length > 0 && (
              <ul className="mb-2 space-y-1">
                {form.expectedDeliverables.map((d, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
                    <span>{d}</span>
                    <button type="button" onClick={() => setField("expectedDeliverables", form.expectedDeliverables.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} placeholder="Add a deliverable" value={newDeliverable}
                onChange={e => setNewDeliverable(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newDeliverable.trim()) { e.preventDefault(); setField("expectedDeliverables", [...form.expectedDeliverables, newDeliverable.trim()]); setNewDeliverable(""); } }} />
              <button type="button"
                onClick={() => { if (newDeliverable.trim()) { setField("expectedDeliverables", [...form.expectedDeliverables, newDeliverable.trim()]); setNewDeliverable(""); } }}
                className="rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                <Plus size={16} />
              </button>
            </div>
          </Field>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {saving ? "Saving…" : isEditing ? "Update Challenge" : "Create Challenge"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Status change modal ─────────────────────────────────────
function StatusModal({ challenge, onClose, onUpdated }) {
  const nexts = ALLOWED_TRANSITIONS[challenge.status] ?? [];
  const [selected, setSelected] = useState(nexts[0] ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/challenges/${challenge._id}/status`, {
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
        <h3 className="text-lg font-bold text-slate-900">Change Status</h3>
        <p className="mt-1 text-sm text-slate-500">Current: <span className="font-semibold capitalize">{challenge.status}</span></p>

        {nexts.length === 0 ? (
          <p className="mt-5 text-sm text-slate-500">No further transitions available for this challenge.</p>
        ) : (
          <div className="mt-5 space-y-2">
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
            <button type="button" onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
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

// ─── Challenge card ──────────────────────────────────────────
function ChallengeCard({ challenge, onEdit, onChangeStatus }) {
  return (
    <motion.article variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{challenge.title}</h3>
          <span className="mt-1 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
            {formatCat(challenge.category)}
          </span>
        </div>
        <StatusBadge status={challenge.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{challenge.description}</p>

      <div className="mt-4 space-y-1.5 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-teal-600" /> Deadline: {formatDate(challenge.deadline)}</div>
        <div className="flex items-center gap-1.5"><Globe2 size={13} className="text-teal-600" /> <span className="capitalize">{(challenge.participationType ?? "").replace("-", " ")}</span></div>
        {challenge.location?.city && (
          <div className="flex items-center gap-1.5"><MapPin size={13} className="text-teal-600" /> {[challenge.location.city, challenge.location.region].filter(Boolean).join(", ")}</div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button type="button" onClick={() => onEdit(challenge)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          <Edit3 size={13} /> Edit
        </button>
        <button type="button" onClick={() => onChangeStatus(challenge)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
          Change status
        </button>
      </div>
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function OrganizationChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest("/challenges/my");
      const d = res?.data;
      setChallenges(Array.isArray(d) ? d : []);
    } catch (err) {
      setError(err.message || "Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  function handleSaved(updated) {
    setChallenges(prev => {
      const idx = prev.findIndex(c => c._id === updated._id);
      if (idx >= 0) return prev.map((c, i) => i === idx ? updated : c);
      return [updated, ...prev];
    });
    setShowCreate(false);
    setEditTarget(null);
  }

  function handleStatusUpdated(updated) {
    setChallenges(prev => prev.map(c => c._id === updated._id ? { ...c, status: updated.status } : c));
    setStatusTarget(null);
  }

  const ALL_STATUSES = ["all", "draft", "published", "paused", "closed", "archived"];
  const filtered = statusFilter === "all" ? challenges : challenges.filter(c => c.status === statusFilter);
  const counts = challenges.reduce((acc, c) => { acc[c.status] = (acc[c.status] ?? 0) + 1; return acc; }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Organization Workspace</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">My Challenges</h2>
            <p className="mt-1 text-sm text-slate-500">Create, manage, and track the challenges your organization publishes.</p>
          </div>
          <button type="button" onClick={() => setShowCreate(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800">
            <Plus size={17} />
            New Challenge
          </button>
        </div>
      </motion.div>

      {/* Status tabs */}
      {!loading && (
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <button key={s} type="button" onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${statusFilter === s ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s === "all" ? `All (${challenges.length})` : `${STATUS_STYLES[s]?.label ?? s} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex justify-between">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
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
          <p className="mt-3 font-semibold text-slate-900">Failed to load challenges</p>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button type="button" onClick={() => setRetryKey(k => k + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h3 className="font-semibold text-slate-900">
            {statusFilter === "all" ? "No challenges yet" : `No ${statusFilter} challenges`}
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
            {statusFilter === "all" ? "Create your first challenge to start attracting talent." : "No challenges match this filter."}
          </p>
          {statusFilter === "all" && (
            <button type="button" onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">
              <Plus size={15} /> Create challenge
            </button>
          )}
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(c => (
              <ChallengeCard key={c._id} challenge={c} onEdit={setEditTarget} onChangeStatus={setStatusTarget} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(showCreate || editTarget) && (
          <ChallengeFormModal
            initial={editTarget}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
            onSaved={handleSaved}
          />
        )}
        {statusTarget && (
          <StatusModal challenge={statusTarget} onClose={() => setStatusTarget(null)} onUpdated={handleStatusUpdated} />
        )}
      </AnimatePresence>
    </div>
  );
}
