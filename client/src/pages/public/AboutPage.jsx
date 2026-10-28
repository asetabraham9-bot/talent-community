import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Users,
  Globe2,
  Lightbulb,
  Heart,
  ArrowRight,
  GraduationCap,
  Building2,
} from "lucide-react";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay } },
});

const values = [
  {
    icon: Target,
    title: "Purpose-driven",
    description:
      "Every challenge on the platform is a real opportunity — meaningful work that creates genuine impact.",
  },
  {
    icon: Users,
    title: "Community first",
    description:
      "We believe the best results come from collaboration. People grow when they work alongside others.",
  },
  {
    icon: Lightbulb,
    title: "Learn by doing",
    description:
      "Practical experience shapes competence. We connect ambition with real problems to solve.",
  },
  {
    icon: Globe2,
    title: "Open to all",
    description:
      "Talent exists everywhere. We work to make opportunities accessible to people across Ethiopia.",
  },
  {
    icon: Heart,
    title: "Built with care",
    description:
      "The platform is designed with both talents and organizations in mind — a space where both sides thrive.",
  },
];

const team = [
  {
    name: "Platform Team",
    role: "Engineering & Design",
    initials: "PT",
    color: "bg-teal-500",
  },
  {
    name: "Community Team",
    role: "Partnerships & Growth",
    initials: "CT",
    color: "bg-blue-500",
  },
  {
    name: "Operations Team",
    role: "Support & Quality",
    initials: "OT",
    color: "bg-violet-500",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#102c46] px-5 py-24 sm:px-8 lg:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
            <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              animate="visible"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-teal-300">
                Who we are
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                A platform built to connect{" "}
                <span className="text-teal-300">talent with opportunity</span>
              </h1>
              <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">
                Talent Community was created to bridge the gap between skilled
                people looking for experience and organizations with meaningful
                challenges worth solving.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                variants={fadeUp(0)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  Our mission
                </p>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Turn skills into impact through real collaboration
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  We believe that practical experience is the most powerful path
                  to growth. Talent Community creates an environment where
                  people can discover challenges, apply their abilities, and
                  build something meaningful alongside organizations working on
                  real problems.
                </p>
                <p className="mt-4 leading-8 text-slate-600">
                  For organizations, we provide a way to bring fresh
                  perspectives and capable people to problems worth solving —
                  while supporting the next generation of professionals in their
                  journey.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp(0.15)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="grid gap-5 sm:grid-cols-2"
              >
                {[
                  {
                    icon: GraduationCap,
                    label: "For talents",
                    text: "Build your profile, explore challenges, and demonstrate your value through real projects.",
                    bg: "bg-teal-50",
                    color: "text-teal-700",
                  },
                  {
                    icon: Building2,
                    label: "For organizations",
                    text: "Publish challenges, receive applications, and collaborate with driven talent.",
                    bg: "bg-blue-50",
                    color: "text-blue-700",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}
                    >
                      <item.icon size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="mx-auto mb-14 max-w-2xl text-center"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                What guides us
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Our values
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                These principles shape every decision we make and every feature
                we build.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((value, i) => (
                <motion.article
                  key={value.title}
                  variants={fadeUp(i * 0.08)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <value.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {value.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div
              variants={fadeUp(0)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto mb-14 max-w-2xl text-center"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                The people behind it
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Our teams
              </h2>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  variants={fadeUp(i * 0.1)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex w-56 flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
                >
                  <div
                    className={`grid h-16 w-16 place-items-center rounded-full ${member.color} text-lg font-bold text-white`}
                  >
                    {member.initials}
                  </div>
                  <p className="mt-4 font-bold text-slate-900">{member.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 sm:px-8 lg:pb-24">
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-3xl bg-teal-800 px-8 py-14 text-center sm:py-16"
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-teal-100">
              Whether you're a talent or an organization, there's a place for
              you here.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-teal-900 transition hover:bg-teal-50"
              >
                Join the community
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/challenges"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Browse challenges
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
