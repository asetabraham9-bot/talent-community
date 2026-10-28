import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import { apiRequest } from "../../services/api";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

// ─── Helpers ────────────────────────────────────────────────
function formatDeadline(deadline) {
  if (!deadline) return "Not specified";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Not specified";
  return date.toLocaleDateString("en-ET", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysRemaining(deadline) {
  if (!deadline) return null;
  const time = new Date(deadline).getTime();
  if (Number.isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatCategory(category) {
  if (!category) return "General";
  return category.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function getLocation(location) {
  if (!location) return "Location not specified";
  if (typeof location === "string") return location;
  return [location.city, location.region, location.country].filter(Boolean).join(", ") || "Location not specified";
}

// ─── Motion variants ─────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: "easeOut" } },
});

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── Sub-components ──────────────────────────────────────────
function ChallengeCard({ challenge }) {
  const daysRemaining = getDaysRemaining(challenge.deadline);

  return (
    <motion.article
      variants={cardAnim}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
          {formatCategory(challenge.category)}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      </div>

      <h3 className="mb-3 text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-teal-700">
        {challenge.title}
      </h3>

      <p className="mb-5 line-clamp-3 flex-1 text-sm leading-7 text-slate-600">
        {challenge.description ?? "Explore this opportunity and learn more about its expected outcomes."}
      </p>

      <div className="space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-start gap-2.5">
          <MapPin size={17} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
          <span>{getLocation(challenge.location)}</span>
        </div>
        <div className="flex items-start gap-2.5">
          <Globe2 size={17} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
          <span className="capitalize">
            {challenge.participationType ? challenge.participationType.replace(/[-_]/g, " ") : "Participation type not specified"}
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <CalendarDays size={17} className="mt-0.5 shrink-0 text-teal-700" aria-hidden="true" />
          <span>Deadline: {formatDeadline(challenge.deadline)}</span>
        </div>

        {Array.isArray(challenge.requiredSkills) && challenge.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {challenge.requiredSkills.slice(0, 3).map((skill) => (
              <span key={skill} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {skill}
              </span>
            ))}
            {challenge.requiredSkills.length > 3 && (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                +{challenge.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {daysRemaining !== null && (
        <p className="mt-4 flex items-center gap-2 text-xs font-medium">
          <Clock3 size={14} aria-hidden="true" />
          <span className={daysRemaining < 0 ? "text-red-600" : daysRemaining <= 7 ? "text-amber-700" : "text-slate-500"}>
            {daysRemaining < 0 ? "Deadline passed" : daysRemaining === 0 ? "Deadline is today" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
          </span>
        </p>
      )}

      <Link
        to={`/challenges/${challenge._id}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-teal-700 hover:bg-teal-50 hover:text-teal-800"
      >
        Explore opportunity
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </motion.article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      variants={fadeUp(0)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto mb-12 max-w-2xl text-center"
    >
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 leading-7 text-slate-600">{description}</p>
    </motion.div>
  );
}

// ─── Stats ───────────────────────────────────────────────────
const stats = [
  { label: "Challenges published", value: "50+" },
  { label: "Talented members", value: "200+" },
  { label: "Organizations", value: "30+" },
  { label: "Projects completed", value: "80+" },
];

// ─── Page ────────────────────────────────────────────────────
export default function HomePage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/challenges?limit=3");
      if (!Array.isArray(result.data)) throw new Error("Invalid response.");
      setChallenges(result.data.slice(0, 3));
    } catch (err) {
      setChallenges([]);
      setError(err.message || "Unable to load challenges.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges, retryCount]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-800">
      <PublicHeader />

      <main>
        {/* ─── Hero ──────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-slate-950">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-teal-500/15 blur-3xl" />
            <div className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-32">
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              animate="visible"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-teal-100">
                <Sparkles size={16} className="text-teal-300" />
                A place for talent to meet opportunity
              </div>

              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your potential deserves a{" "}
                <span className="text-teal-300">place to grow.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Discover real-world challenges, showcase what you can do, and
                connect with organizations turning ideas into impact.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/challenges"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-teal-400"
                >
                  Explore challenges
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10"
                >
                  Join the community
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              <a
                href="#how-it-works"
                className="mt-9 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
              >
                Discover how it works
                <ArrowDown size={15} />
              </a>
            </motion.div>

            {/* Hero card */}
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              animate="visible"
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-6 rounded-[2rem] bg-teal-400/10 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <p className="text-sm text-slate-400">The journey starts here</p>
                    <h2 className="mt-1 text-xl font-bold text-white">Discover your next step</h2>
                  </div>
                  <div className="rounded-2xl bg-teal-400/10 p-3 text-teal-300">
                    <GraduationCap size={28} />
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  {[
                    { number: "01", icon: Search, title: "Discover opportunities", description: "Explore challenges from organizations." },
                    { number: "02", icon: BookOpen, title: "Show your abilities", description: "Apply your skills to meaningful problems." },
                    { number: "03", icon: Users, title: "Build something together", description: "Collaborate and turn ideas into outcomes." },
                  ].map((item) => (
                    <div
                      key={item.number}
                      className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.035] p-4 transition-colors duration-200 hover:border-teal-400/30 hover:bg-white/[0.07]"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.number}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-teal-400/10 p-4">
                  <CheckCircle2 size={20} className="shrink-0 text-teal-300" />
                  <p className="text-sm leading-6 text-teal-100">Learn by doing. Grow through collaboration.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Stats ─────────────────────────────────────────────── */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
            >
              {stats.map((stat) => (
                <motion.div key={stat.label} variants={cardAnim} className="text-center">
                  <p className="text-3xl font-extrabold text-[#102c46] sm:text-4xl">{stat.value}</p>
                  <p className="mt-1.5 text-sm text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Pathways ──────────────────────────────────────────── */}
        <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Find your place"
              title="One community. Different ways to make an impact."
              description="Whether you are developing your abilities, building an organization, or looking for a problem worth solving, there is a path for you."
            />

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-5 md:grid-cols-3"
            >
              {[
                {
                  icon: GraduationCap,
                  title: "For talents",
                  description: "Discover practical opportunities, apply your skills, build projects, and make your abilities visible through meaningful work.",
                  link: "/register",
                  label: "Join as a talent",
                  bg: "bg-teal-50",
                  text: "text-teal-800",
                },
                {
                  icon: BriefcaseBusiness,
                  title: "For organizations",
                  description: "Share real challenges, connect with capable people, and collaborate with talents who want to help solve meaningful problems.",
                  link: "/register",
                  label: "Join as an organization",
                  bg: "bg-blue-50",
                  text: "text-blue-800",
                },
                {
                  icon: Globe2,
                  title: "Explore opportunities",
                  description: "Explore published challenges across Ethiopia and find opportunities that fit your interests and ambitions.",
                  link: "/challenges",
                  label: "Browse challenges",
                  bg: "bg-violet-50",
                  text: "text-violet-800",
                },
              ].map((pathway) => (
                <motion.article
                  key={pathway.title}
                  variants={cardAnim}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${pathway.bg} ${pathway.text}`}>
                    <pathway.icon size={27} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{pathway.title}</h3>
                  <p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{pathway.description}</p>
                  <Link
                    to={pathway.link}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-teal-800 transition-all group-hover:gap-3"
                  >
                    {pathway.label}
                    <ArrowRight size={17} />
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Featured challenges ────────────────────────────────── */}
        <section id="featured-challenges" className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <motion.div
                variants={fadeUp(0)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="max-w-2xl"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Real opportunities</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Challenges worth solving</h2>
                <p className="mt-4 leading-7 text-slate-600">
                  Explore opportunities published by organizations. Every challenge shown here comes from the platform.
                </p>
              </motion.div>

              <Link
                to="/challenges"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-700 hover:text-teal-800 sm:self-auto"
              >
                View all challenges
                <ArrowRight size={17} />
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="h-6 w-28 rounded-full bg-slate-200" />
                    <div className="mt-6 h-6 w-4/5 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
                    <div className="mt-8 h-11 rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
                <RefreshCw size={28} className="mx-auto text-red-400" />
                <h3 className="mt-4 font-bold text-slate-900">We couldn't load the challenges</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{error}</p>
                <button
                  type="button"
                  onClick={() => setRetryCount((c) => c + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              </div>
            ) : challenges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <BookOpen size={28} className="mx-auto text-teal-700" />
                <h3 className="mt-5 text-xl font-bold text-slate-900">New opportunities are on the way</h3>
                <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600">
                  Check back later as organizations publish new opportunities.
                </p>
                <Link to="/challenges" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-800 hover:text-teal-600">
                  Explore the challenge directory <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-5 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={16} className="text-teal-700" />
                  Showing {challenges.length} real published {challenges.length === 1 ? "challenge" : "challenges"}
                </p>
                <motion.div
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
                >
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge._id} challenge={challenge} />
                  ))}
                </motion.div>
                <div className="mt-9 text-center">
                  <Link
                    to="/challenges"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-teal-800"
                  >
                    Discover more opportunities
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ─── How it works ───────────────────────────────────────── */}
        <section id="how-it-works" className="px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="A simple process"
              title="Turn your ambition into action"
              description="A clear path from discovering an opportunity to collaborating on a real project."
            />

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid gap-8 md:grid-cols-3"
            >
              {[
                { number: "01", title: "Create your profile", description: "Introduce your interests, skills, experience, and the kind of work you want to pursue." },
                { number: "02", title: "Find your opportunity", description: "Explore published challenges and apply to opportunities that interest you." },
                { number: "03", title: "Collaborate and build", description: "Work toward expected deliverables, contribute to projects, and demonstrate what you can do." },
              ].map((step) => (
                <motion.article
                  key={step.number}
                  variants={cardAnim}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-slate-200 bg-white p-7"
                >
                  <p className="text-sm font-extrabold tracking-widest text-teal-700">STEP {step.number}</p>
                  <h3 className="mt-5 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─── Talent showcase intro ──────────────────────────────── */}
        <section className="bg-slate-50 px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 lg:flex-row lg:items-center"
          >
            <div className="flex items-start gap-5">
              <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 sm:flex">
                <Users size={27} />
              </div>
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Talent showcase</p>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">Your work should speak for itself.</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Build your profile, develop practical projects, and make your skills easier for organizations to discover.
                </p>
              </div>
            </div>
            <Link
              to="/talents"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-teal-800"
            >
              Browse talents
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>

        {/* ─── Organization CTA ───────────────────────────────────── */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-teal-800 px-7 py-12 sm:px-12 sm:py-16"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">For organizations</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">Have a challenge worth solving?</h2>
                <p className="mt-4 max-w-xl leading-7 text-teal-50/90">
                  Bring your real-world problems to a community of emerging talent. Publish opportunities, connect with capable people,
                  and support practical learning through real projects.
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-6 py-3 font-bold text-teal-900 transition-all hover:-translate-y-0.5 hover:bg-teal-50"
              >
                Join as an organization
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
