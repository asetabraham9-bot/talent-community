
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

function formatDeadline(value) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function ChallengeCard({ challenge }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-slate-900/5">
      {challenge.category && (
        <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
          {challenge.category}
        </span>
      )}

      <h3 className="mt-4 text-lg font-bold leading-7 text-slate-900">
        {challenge.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
        {challenge.description || "Explore this opportunity to learn more."}
      </p>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-800">Location: </span>
          {challenge.location || "Not specified"}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Deadline: </span>
          {formatDeadline(challenge.deadline)}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 transition group-hover:gap-3"
        >
          Explore challenges <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [challenges, setChallenges] = useState([]);
  const [challengeState, setChallengeState] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedChallenges() {
      try {
        const result = await apiRequest("/challenges?page=1&limit=3");

        if (cancelled) return;

        setChallenges(Array.isArray(result.data) ? result.data : []);
        setChallengeState("success");
      } catch {
        if (cancelled) return;

        setChallenges([]);
        setChallengeState("error");
      }
    }

    loadFeaturedChallenges();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-800">
      <PublicHeader />

      <main>
        <section className="relative isolate overflow-hidden bg-[#102c46]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-teal-400/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-48 -left-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-28">
            <div className="animate-[fadeInUp_700ms_ease-out_both]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-teal-200">
                Skills. Opportunities. Growth.
              </span>

              <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your talent deserves{" "}
                <span className="text-teal-300">an opportunity</span> to shine.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Discover meaningful challenges, showcase what you can do,
                and connect with organizations that need your skills.
                Turn your potential into practical experience.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/challenges"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-400"
                >
                  Explore challenges <span aria-hidden="true">→</span>
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Join the community
                </Link>
              </div>

              <p className="mt-6 text-sm text-slate-400">
                For talented individuals and organizations across Ethiopia.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg animate-[fadeInUp_900ms_ease-out_both]">
              <div className="absolute -inset-5 rounded-[2rem] bg-teal-400/10 blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      A place to move forward
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Make your next step count
                    </p>
                  </div>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-400/15 text-xl text-teal-200">
                    ↗
                  </span>
                </div>

                <div className="mt-7 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-5 transition duration-300 hover:translate-x-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                      For talents
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-white">
                      Put your skills into practice.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Build your profile and find challenges that help you
                      learn, contribute, and grow.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-5 transition duration-300 hover:translate-x-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      For organizations
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-white">
                      Find people ready to contribute.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Share meaningful challenges and connect with people
                      who can help move your ideas forward.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                  <p className="text-xs leading-5 text-slate-300">
                    Start with your skills. Grow through real opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Find your pathway"
              title="One community. Different ways to grow."
              description="Whether you're developing your skills or looking for people to help solve a problem, start with the pathway that fits your goals."
            />

            <div className="grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-xl text-teal-800">
                  ↗
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Grow as a talent
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Showcase your abilities, share your interests, and apply
                  for challenges where you can make a contribution.
                </p>
                <Link
                  to="/register"
                  className="mt-6 inline-flex font-semibold text-teal-700 hover:text-teal-900"
                >
                  Create your profile →
                </Link>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-xl text-blue-800">
                  +
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Connect as an organization
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Introduce your organization, publish challenges after
                  verification, and review applications from interested talents.
                </p>
                <Link
                  to="/register"
                  className="mt-6 inline-flex font-semibold text-teal-700 hover:text-teal-900"
                >
                  Register your organization →
                </Link>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-xl text-violet-800">
                  ◎
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  Discover challenges
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Browse public opportunities and find problems that match
                  your interests and the skills you want to develop.
                </p>
                <Link
                  to="/challenges"
                  className="mt-6 inline-flex font-semibold text-teal-700 hover:text-teal-900"
                >
                  Browse opportunities →
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  Real opportunities
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Featured challenges
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  Explore opportunities published by organizations in the community.
                </p>
              </div>

              <Link
                to="/challenges"
                className="w-fit font-semibold text-teal-700 hover:text-teal-900"
              >
                View all challenges →
              </Link>
            </div>

            {challengeState === "loading" ? (
              <div role="status" className="rounded-2xl border border-slate-200 p-10 text-center text-slate-600">
                Loading published opportunities...
              </div>
            ) : challengeState === "error" ? (
              <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
                <h3 className="font-semibold text-slate-900">
                  Challenges are temporarily unavailable
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  We couldn't retrieve current opportunities. Please visit the challenges page to try again.
                </p>
                <Link to="/challenges" className="mt-4 inline-block font-semibold text-teal-800">
                  Open challenges →
                </Link>
              </div>
            ) : challenges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <h3 className="text-lg font-bold text-slate-900">
                  New opportunities are yet to be published
                </h3>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
                  There are no public challenges available right now. You can still join the community, prepare your profile, and check back for new opportunities.
                </p>
                <Link
                  to="/register"
                  className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Get started
                </Link>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge._id ?? challenge.id}
                    challenge={challenge}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Your journey"
              title="Three steps to get started"
              description="The community helps bring talented people and meaningful opportunities closer together."
            />

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Create your profile",
                  description: "Register as a talent or an organization and provide the information needed to get started.",
                },
                {
                  number: "02",
                  title: "Discover opportunities",
                  description: "Talents explore published challenges. Organizations prepare challenges and complete verification.",
                },
                {
                  number: "03",
                  title: "Apply and collaborate",
                  description: "Talents submit applications. Organizations review candidates and work with accepted contributors.",
                },
              ].map((step) => (
                <article key={step.number} className="relative rounded-2xl border border-slate-200 bg-white p-7">
                  <span className="text-sm font-extrabold tracking-widest text-teal-700">
                    STEP {step.number}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-[#102c46] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                For organizations
              </p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                Have a challenge worth solving?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Bring your organization to Talent Community. Complete your
                profile, go through verification, and share opportunities
                that invite people to contribute their skills.
              </p>
            </div>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-teal-400"
            >
              Join as an organization →
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
