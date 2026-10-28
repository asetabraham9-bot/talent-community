import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Globe2,
  CalendarDays,
  Clock3,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";
import { apiRequest } from "../../services/api";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

// ─── Helpers ────────────────────────────────────────────────
function formatDeadline(deadline) {
  if (!deadline) return "Not specified";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDaysRemaining(deadline) {
  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatCategory(cat) {
  if (!cat) return "General";
  return cat.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getLocation(loc) {
  if (!loc) return "Not specified";
  if (typeof loc === "string") return loc;
  return (
    [loc.city, loc.region, loc.country].filter(Boolean).join(", ") ||
    "Not specified"
  );
}

// ─── Card ────────────────────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};

function ChallengeCard({ challenge }) {
  const daysRemaining = getDaysRemaining(challenge.deadline);

  return (
    <motion.article
      layout
      variants={cardVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {challenge.category && (
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
            {formatCategory(challenge.category)}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      </div>

      <h3 className="mb-3 text-lg font-bold leading-snug text-slate-900">
        {challenge.title ?? "Untitled challenge"}
      </h3>

      <p className="mb-5 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">
        {challenge.description ??
          "Explore this opportunity and learn more about its expected outcomes."}
      </p>

      <div className="space-y-2.5 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-start gap-2">
          <MapPin size={15} className="mt-0.5 shrink-0 text-teal-600" />
          <span>{getLocation(challenge.location)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Globe2 size={15} className="mt-0.5 shrink-0 text-teal-600" />
          <span className="capitalize">
            {challenge.participationType
              ? challenge.participationType.replace(/[-_]/g, " ")
              : "Not specified"}
          </span>
        </div>
        <div className="flex items-start gap-2">
          <CalendarDays size={15} className="mt-0.5 shrink-0 text-teal-600" />
          <span>Deadline: {formatDeadline(challenge.deadline)}</span>
        </div>
      </div>

      {Array.isArray(challenge.requiredSkills) &&
        challenge.requiredSkills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {challenge.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
              >
                {skill}
              </span>
            ))}
            {challenge.requiredSkills.length > 4 && (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
                +{challenge.requiredSkills.length - 4}
              </span>
            )}
          </div>
        )}

      {daysRemaining !== null && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium">
          <Clock3 size={13} />
          <span
            className={
              daysRemaining < 0
                ? "text-red-600"
                : daysRemaining <= 7
                  ? "text-amber-700"
                  : "text-slate-400"
            }
          >
            {daysRemaining < 0
              ? "Deadline passed"
              : daysRemaining === 0
                ? "Deadline is today"
                : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
          </span>
        </p>
      )}

      <Link
        to={`/challenges/${challenge._id ?? challenge.id}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-800"
      >
        Explore opportunity
        <ArrowUpRight size={16} />
      </Link>
    </motion.article>
  );
}

// ─── Page ────────────────────────────────────────────────────
const LIMIT = 9;

const PARTICIPATION_TYPES = ["all", "remote", "in-person", "hybrid"];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [participationType, setParticipationType] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (participationType !== "all") params.set("participationType", participationType);
      const result = await apiRequest(`/challenges?${params}`);
      setChallenges(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination ?? { page, total: 0, totalPages: 0 });
    } catch (err) {
      setChallenges([]);
      setError(err.message || "Unable to load challenges.");
    } finally {
      setLoading(false);
    }
  }, [page, participationType, retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Client-side search filter
  const displayed = search
    ? challenges.filter((c) => {
        const q = search.toLowerCase();
        return (
          (c.title ?? "").toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q) ||
          (c.category ?? "").toLowerCase().includes(q) ||
          (c.requiredSkills ?? []).some((s) => s.toLowerCase().includes(q))
        );
      })
    : challenges;

  function resetFilters() {
    setSearch("");
    setParticipationType("all");
    setPage(1);
  }

  const hasFilters = search || participationType !== "all";

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-slate-950">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-18">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-teal-400">
                Explore opportunities
              </p>
              <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Discover challenges.{" "}
                <span className="text-teal-300">Build your potential.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Explore real opportunities published by organizations and find
                challenges where your skills can make a difference.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters bar */}
        <section className="sticky top-[76px] z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-4 sm:px-8">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="Search challenges, skills…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Participation type */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <SlidersHorizontal size={15} />
                Filters
                {hasFilters && (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-700 text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-slate-500 hover:text-slate-800"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100"
              >
                <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-5 py-4 sm:px-8">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Participation type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PARTICIPATION_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setParticipationType(type);
                            setPage(1);
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                            participationType === type
                              ? "bg-teal-700 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {type === "all" ? "All types" : type.replace(/-/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available challenges
              </h2>
              {!loading && !error && (
                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? `${displayed.length} result${displayed.length !== 1 ? "s" : ""} for "${search}"`
                    : `${pagination.total} published ${pagination.total === 1 ? "challenge" : "challenges"}`}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div
              aria-busy="true"
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="mb-5 flex gap-2">
                    <div className="h-6 w-24 rounded-full bg-slate-200" />
                    <div className="h-6 w-20 rounded-full bg-slate-100" />
                  </div>
                  <div className="h-6 w-4/5 rounded bg-slate-200" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 rounded bg-slate-100" />
                    <div className="h-4 w-5/6 rounded bg-slate-100" />
                    <div className="h-4 w-4/6 rounded bg-slate-100" />
                  </div>
                  <div className="mt-8 h-11 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-8 text-center"
            >
              <RefreshCw size={28} className="mx-auto text-red-400" />
              <h3 className="mt-4 font-bold text-slate-900">
                We couldn't load challenges
              </h3>
              <p className="mt-2 text-sm text-slate-600">{error}</p>
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                <RefreshCw size={15} />
                Try again
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                {hasFilters
                  ? "No challenges match your filters"
                  : "No published challenges yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {hasFilters
                  ? "Try adjusting your search or filters."
                  : "Check back later as organizations publish new opportunities."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {displayed.map((challenge) => (
                    <ChallengeCard
                      key={challenge._id ?? challenge.id}
                      challenge={challenge}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {!search && pagination.totalPages > 1 && (
                <nav
                  aria-label="Challenge pages"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                            p === page
                              ? "bg-teal-700 text-white"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
