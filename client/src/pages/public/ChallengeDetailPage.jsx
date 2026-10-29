import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Globe2,
  MapPin,
  Tag,
  Clock3,
  CheckCircle2,
  Users,
  ArrowRight,
  AlertCircle,
  Building2,
} from "lucide-react";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

function formatDate(d) {
  if (!d) return "Not specified";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDaysRemaining(deadline) {
  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));
}

function DeadlineBadge({ deadline }) {
  const days = getDaysRemaining(deadline);
  if (days === null) return null;

  const color =
    days < 0
      ? "bg-red-50 text-red-700 border-red-200"
      : days <= 7
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-teal-50 text-teal-700 border-teal-200";

  const text =
    days < 0
      ? "Deadline passed"
      : days === 0
        ? "Deadline is today"
        : `${days} day${days === 1 ? "" : "s"} remaining`;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
      <Clock3 size={12} />
      {text}
    </span>
  );
}

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState("idle"); // idle | success | error
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await apiRequest(`/challenges/${id}`);
        if (cancelled) return;
        setChallenge(result.data ?? result);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load challenge.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  async function handleApply(coverMessage) {
    setApplying(true);
    setApplyError("");
    try {
      await apiRequest("/applications", {
        method: "POST",
        body: JSON.stringify({ challengeId: id, coverMessage }),
      });
      setApplyStatus("success");
    } catch (err) {
      setApplyError(err.message || "Application failed.");
      setApplyStatus("error");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Back */}
        <Link
          to="/challenges"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft size={16} />
          Back to challenges
        </Link>

        {loading ? (
          <div
            aria-busy="true"
            className="animate-pulse space-y-6 rounded-2xl border border-slate-200 bg-white p-8"
          >
            <div className="h-6 w-32 rounded-full bg-slate-200" />
            <div className="h-9 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-4/6 rounded bg-slate-100" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle size={32} className="mx-auto text-red-500" />
            <h2 className="mt-4 font-bold text-slate-900">
              Couldn't load this challenge
            </h2>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <Link
              to="/challenges"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft size={15} />
              Back to challenges
            </Link>
          </div>
        ) : challenge ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="grid gap-8 lg:grid-cols-[1fr_340px]"
          >
            {/* Main content */}
            <div className="space-y-8">
              {/* Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  {challenge.category && (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                      {challenge.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                  <DeadlineBadge deadline={challenge.deadline} />
                </div>

                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                  {challenge.title ?? "Untitled challenge"}
                </h1>

                {challenge.organization?.name && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <Building2 size={16} className="text-teal-600" />
                    Posted by{" "}
                    <span className="font-medium text-slate-800">
                      {challenge.organization.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                  About this challenge
                </h2>
                <p className="whitespace-pre-line leading-8 text-slate-600">
                  {challenge.description || "No description provided."}
                </p>
              </div>

              {/* Expected outcomes */}
              {challenge.expectedOutcomes && (
                <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    Expected outcomes
                  </h2>
                  <p className="whitespace-pre-line leading-8 text-slate-600">
                    {challenge.expectedOutcomes}
                  </p>
                </div>
              )}

              {/* Skills */}
              {Array.isArray(challenge.requiredSkills) &&
                challenge.requiredSkills.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold text-slate-900">
                      Required skills
                    </h2>
                    <div className="flex flex-wrap gap-2.5">
                      {challenge.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Apply section (mobile) */}
              <div className="lg:hidden">
                <ApplyPanel
                  challenge={challenge}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  applying={applying}
                  applyStatus={applyStatus}
                  applyError={applyError}
                  onApply={handleApply}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-5">
                <ApplyPanel
                  challenge={challenge}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  applying={applying}
                  applyStatus={applyStatus}
                  applyError={applyError}
                  onApply={handleApply}
                />

                {/* Details card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-bold text-slate-900">
                    Challenge details
                  </h3>
                  <dl className="space-y-4 text-sm">
                    <DetailRow
                      icon={CalendarDays}
                      label="Deadline"
                      value={formatDate(challenge.deadline)}
                    />
                    <DetailRow
                      icon={MapPin}
                      label="Location"
                      value={
                        typeof challenge.location === "object"
                          ? [
                              challenge.location?.city,
                              challenge.location?.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Not specified"
                          : challenge.location || "Not specified"
                      }
                    />
                    <DetailRow
                      icon={Globe2}
                      label="Participation"
                      value={
                        challenge.participationType
                          ? challenge.participationType.replace(/[-_]/g, " ")
                          : "Not specified"
                      }
                    />
                    {challenge.category && (
                      <DetailRow
                        icon={Tag}
                        label="Category"
                        value={challenge.category}
                      />
                    )}
                    {challenge.maxParticipants && (
                      <DetailRow
                        icon={Users}
                        label="Max participants"
                        value={String(challenge.maxParticipants)}
                      />
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </main>

      <PublicFooter />
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        size={16}
        className="mt-0.5 shrink-0 text-teal-600"
        aria-hidden="true"
      />
      <div>
        <dt className="font-medium text-slate-500">{label}</dt>
        <dd className="mt-0.5 capitalize text-slate-800">{value}</dd>
      </div>
    </div>
  );
}

function ApplyPanel({
  challenge,
  isAuthenticated,
  user,
  applying,
  applyStatus,
  applyError,
  onApply,
}) {
  const isTalent = user?.role === "talent";
  const deadline = challenge.deadline;
  const isPast = deadline && getDaysRemaining(deadline) < 0;

  const [applyStep, setApplyStep] = useState("idle"); // idle | form | submitting
  const [coverMessage, setCoverMessage] = useState("");
  const [localError, setLocalError] = useState("");

  function handleOpenForm() {
    setApplyStep("form");
    setLocalError("");
    setCoverMessage("");
  }

  function handleCancel() {
    setApplyStep("idle");
    setLocalError("");
    setCoverMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (coverMessage.trim().length < 20) {
      setLocalError("Cover message must be at least 20 characters.");
      return;
    }
    setApplyStep("submitting");
    await onApply(coverMessage.trim());
    // parent sets applyStatus; if error occurs, go back to form
    if (applyStatus !== "success") {
      setApplyStep("form");
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {applyStatus === "success" ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 size={36} className="text-teal-600" />
          <p className="mt-3 font-bold text-slate-900">Application submitted!</p>
          <p className="mt-1 text-sm text-slate-600">
            The organization will review your application and reach out if
            you&apos;re selected.
          </p>
        </div>
      ) : applyStep === "form" || applyStep === "submitting" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">Your application</p>

          {(applyError || localError) && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {localError || applyError}
            </div>
          )}

          <div>
            <label
              htmlFor="cover-message"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Cover message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cover-message"
              rows={5}
              required
              minLength={20}
              maxLength={3000}
              value={coverMessage}
              onChange={(e) => { setCoverMessage(e.target.value); setLocalError(""); }}
              placeholder="Tell the organization why you're a great fit for this challenge…"
              className="block w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {coverMessage.length}/3000 — min 20 characters
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applyStep === "submitting"}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
            >
              {applyStep === "submitting" ? "Submitting…" : "Submit"}
              {applyStep !== "submitting" && <ArrowRight size={15} />}
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-700">
            Interested in this challenge?
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Apply now to let the organization know you want to participate.
          </p>

          {applyStatus === "error" && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800"
            >
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {applyError}
            </div>
          )}

          <div className="mt-5">
            {!isAuthenticated ? (
              <div className="space-y-3">
                <Link
                  to="/login"
                  state={{ from: { pathname: `/challenges/${challenge._id}` } }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Sign in to apply
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Create an account
                </Link>
              </div>
            ) : !isTalent ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Only talent accounts can apply to challenges.
              </p>
            ) : isPast ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                The application deadline for this challenge has passed.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleOpenForm}
                disabled={applying}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                Apply to this challenge
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
