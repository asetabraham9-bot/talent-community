import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";

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

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  

  useEffect(() => {
    let cancelled = false;

    async function loadChallenges() {
      setLoading(true);
      setError("");

      try {
        const result = await apiRequest(
          `/challenges?page=${page}&limit=9`
        );

        if (cancelled) return;

        setChallenges(
          Array.isArray(result.data) ? result.data : []
        );

        setPagination(
          result.pagination ?? {
            page,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (err) {
        if (cancelled) return;

        setChallenges([]);
        setError(err.message || "Unable to load challenges.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChallenges();

    return () => {
      cancelled = true;
    };
  }, [page, retryCount]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Explore opportunities
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Discover challenges. Build your potential.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Explore real opportunities published by organizations
            and find challenges where your skills can make a difference.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Available challenges
            </h2>

            {!loading && !error && (
              <p className="mt-1 text-sm text-slate-500">
                {pagination.total} published{" "}
                {pagination.total === 1 ? "challenge" : "challenges"}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-slate-200 bg-white p-10 text-center"
          >
            <p className="font-medium text-slate-700">
              Loading challenges...
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Fetching the latest opportunities from the server.
            </p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-white p-8"
          >
            <h3 className="font-semibold text-red-800">
              We couldn't load challenges
            </h3>
            <p className="mt-2 text-sm text-slate-600">{error}</p>

            <button
              type="button"
              onClick={() => setPage((current) => current)}
              className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Try again
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No published challenges yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              There are no public challenges to display on this page right
              now. Check back when organizations publish opportunities.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {challenges.map((challenge) => (
                <article
                  key={challenge._id ?? challenge.id}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {challenge.category && (
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                        {challenge.category}
                      </span>
                    )}

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                      Published
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-7 text-slate-900">
                    {challenge.title || "Untitled challenge"}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {challenge.description || "No description provided."}
                  </p>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-slate-500">
                        Location
                      </dt>
                      <dd className="mt-0.5 text-slate-800">
                        {challenge.location || "Not specified"}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-medium text-slate-500">
                        Participation
                      </dt>
                      <dd className="mt-0.5 capitalize text-slate-800">
                        {challenge.participationType || "Not specified"}
                      </dd>
                    </div>

                    <div>
                      <dt className="font-medium text-slate-500">
                        Application deadline
                      </dt>
                      <dd className="mt-0.5 text-slate-800">
                        {formatDeadline(challenge.deadline)}
                      </dd>
                    </div>
                  </dl>

                  {Array.isArray(challenge.requiredSkills) &&
                    challenge.requiredSkills.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Required skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {challenge.requiredSkills.slice(0, 5).map(
                            (skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <div className="mt-auto pt-6">
                    <p className="text-xs text-slate-500">
                      Organization details will appear when supplied by
                      the API response.
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <nav
                aria-label="Challenge pages"
                className="mt-10 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setRetryCount((count) => count + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
