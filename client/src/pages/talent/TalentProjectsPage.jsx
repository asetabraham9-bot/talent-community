import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  FolderOpen,
  Loader2,
  RefreshCw,
  Users,
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
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Status styles ───────────────────────────────────────────
const STATUS_STYLES = {
  planned:      { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400",  label: "Planned" },
  "in-progress":{ bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   label: "In Progress" },
  completed:    { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  label: "Completed" },
  cancelled:    { bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-400",    label: "Cancelled" },
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

// ─── Project card ────────────────────────────────────────────
function ProjectCard({ project }) {
  return (
    <motion.article
      variants={fadeUp}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <FolderOpen size={20} />
        </div>
        <StatusBadge status={project.status} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">{project.title}</h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
        {project.description ?? "No description provided."}
      </p>

      <div className="mt-4 space-y-2 text-sm text-slate-500">
        {project.startDate && (
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="shrink-0 text-teal-600" />
            <span>Started {formatDate(project.startDate)}</span>
          </div>
        )}
        {project.targetCompletionDate && (
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="shrink-0 text-teal-600" />
            <span>Target completion {formatDate(project.targetCompletionDate)}</span>
          </div>
        )}
        {Array.isArray(project.contributors) && project.contributors.length > 0 && (
          <div className="flex items-center gap-2">
            <Users size={14} className="shrink-0 text-teal-600" />
            <span>{project.contributors.length} contributor{project.contributors.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {project.challenge && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <span className="text-xs text-slate-500">From challenge:</span>
          <Link
            to={`/challenges/${project.challenge._id ?? project.challenge}`}
            className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline"
          >
            {project.challenge.title ?? "View challenge"}
            <ArrowUpRight size={12} />
          </Link>
        </div>
      )}

      {project.outcomeSummary && (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
          <p className="mb-1 text-xs font-semibold text-green-700">Outcome summary</p>
          <p className="text-sm leading-5 text-green-800">{project.outcomeSummary}</p>
        </div>
      )}
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function TalentProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Talent projects come from accepted applications — list by checking project/:id on each accepted app
  // The API serves projects via /projects/:id for talent. There's no direct /projects/my for talents,
  // so we first load accepted applications then load each project by ID.
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Get accepted applications
      const appsRes = await apiRequest("/applications/my");
      const appsData = appsRes?.data;
      const apps = Array.isArray(appsData) ? appsData : (Array.isArray(appsData?.applications) ? appsData.applications : []);
      const accepted = apps.filter(a => a.status === "accepted");

      if (accepted.length === 0) {
        setProjects([]);
        return;
      }

      // For each accepted application's challenge, try to get the project
      const projectResults = await Promise.allSettled(
        accepted.map(a => {
          const cid = a.challenge?._id ?? a.challenge;
          if (!cid) return Promise.resolve(null);
          // There's no direct lookup by challenge from talent side; try by app's linked project
          return a.project
            ? apiRequest(`/projects/${a.project}`)
            : Promise.resolve(null);
        })
      );

      const loaded = projectResults
        .filter(r => r.status === "fulfilled" && r.value?.data)
        .map(r => r.value.data);

      setProjects(loaded);
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Talent Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">My Projects</h2>
        <p className="mt-1 text-sm text-slate-500">
          Projects you are contributing to through accepted challenge applications.
        </p>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex justify-between">
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-full rounded bg-slate-100" />
              <div className="mt-1 h-4 w-5/6 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white px-6 py-10 text-center">
          <RefreshCw size={26} className="mx-auto text-red-400" />
          <p className="mt-3 font-semibold text-slate-900">Failed to load projects</p>
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
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <FolderOpen size={28} className="mx-auto text-teal-700" />
          <h3 className="mt-4 font-semibold text-slate-900">No projects yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Projects appear here once your applications are accepted and an organization creates a project.
          </p>
          <Link
            to="/challenges"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
          >
            Browse challenges
          </Link>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-5 sm:grid-cols-2"
        >
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </motion.div>
      )}
    </div>
  );
}
