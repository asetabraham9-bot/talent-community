import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, MapPin, Code2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function TalentCard({ talent }) {
  const skills = Array.isArray(talent.skills) ? talent.skills : [];
  const displayName = talent.name ?? talent.user?.name ?? "Talent";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const location =
    [talent.location?.city, talent.location?.country]
      .filter(Boolean)
      .join(", ") || null;

  return (
    <motion.article
      variants={cardVariant}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-lg font-extrabold text-teal-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-slate-900">{displayName}</h3>
          {talent.headline && (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {talent.headline}
            </p>
          )}
          {location && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin size={12} />
              {location}
            </div>
          )}
        </div>
      </div>

      {talent.bio && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {talent.bio}
        </p>
      )}

      {skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
}

export default function TalentsPage() {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await apiRequest("/talent-profiles");
        if (cancelled) return;
        setTalents(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Unable to load talents.");
        setTalents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = talents.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (t.name ?? t.user?.name ?? "").toLowerCase();
    const headline = (t.headline ?? "").toLowerCase();
    const skills = (t.skills ?? []).join(" ").toLowerCase();
    return name.includes(q) || headline.includes(q) || skills.includes(q);
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-[#102c46] px-5 py-16 sm:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-4xl"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-teal-300">
              Talent showcase
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Meet the community
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-7 text-slate-300">
              Explore talented individuals from across Ethiopia — each with
              unique skills and a drive to build something meaningful.
            </p>

            {/* Search */}
            <div className="relative mt-8 max-w-lg">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by name, skill, or role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30"
              />
            </div>
          </motion.div>
        </section>

        {/* Grid */}
        <section className="px-5 py-14 sm:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div
                aria-busy="true"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 rounded bg-slate-100" />
                      <div className="h-3 w-5/6 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                role="alert"
                className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={26} />
                </div>
                <h3 className="font-bold text-slate-900">
                  Couldn't load talent profiles
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                  {error}
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  {search ? <Search size={26} /> : <Users size={26} />}
                </div>
                <h3 className="font-bold text-slate-900">
                  {search ? "No matching talents" : "No talent profiles yet"}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                  {search
                    ? `No profiles matched "${search}". Try a different search.`
                    : "Be the first to join the community and create your profile."}
                </p>
                {!search && (
                  <Link
                    to="/register"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Create your profile
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            ) : (
              <>
                <p className="mb-6 text-sm text-slate-500">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "talent" : "talents"} found
                </p>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filtered.map((talent) => (
                    <TalentCard
                      key={talent._id ?? talent.id}
                      talent={talent}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </section>

        {/* Join CTA */}
        <section className="px-5 pb-20 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:flex-row sm:p-10"
          >
            <div className="flex items-center gap-5">
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 sm:flex">
                <Code2 size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Want to be featured here?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Create your talent profile and let organizations discover what
                  you can do.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Join as talent
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
