import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

const faqs = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is Talent Community?",
        a: "Talent Community is a platform that connects skilled individuals with organizations that have real challenges to solve. Talents can discover opportunities, apply their skills, and build a visible portfolio. Organizations can publish challenges and find capable people to collaborate with.",
      },
      {
        q: "Is it free to join?",
        a: "Yes — joining as a talent or as an organization is completely free. We believe access to opportunity should not depend on the ability to pay.",
      },
      {
        q: "Who can join as a talent?",
        a: "Anyone with skills they want to apply and grow. Whether you're a student, a recent graduate, or an experienced professional looking for meaningful work, you're welcome here.",
      },
      {
        q: "What kinds of organizations can join?",
        a: "We welcome businesses, NGOs, startups, educational institutions, and government bodies. If you have a real challenge worth solving, you belong here.",
      },
    ],
  },
  {
    category: "Challenges & applications",
    items: [
      {
        q: "How do challenges work?",
        a: "Organizations publish challenges on the platform describing a problem, the skills required, the expected deliverables, and an application deadline. Talents browse these challenges and apply by submitting their interest and relevant context.",
      },
      {
        q: "Can I apply to multiple challenges at once?",
        a: "Yes. You can apply to as many challenges as you're genuinely interested in. We encourage thoughtful applications that clearly explain why your background is relevant.",
      },
      {
        q: "What happens after I apply?",
        a: "The organization reviews applications and selects participants. You'll be notified of the decision through the platform. If selected, the organization will reach out to begin collaboration.",
      },
      {
        q: "Are challenges paid opportunities?",
        a: "That depends on each organization. Some challenges offer compensation; others are unpaid learning opportunities. The terms will be described in the challenge details.",
      },
    ],
  },
  {
    category: "Profiles & projects",
    items: [
      {
        q: "What should I include in my talent profile?",
        a: "Your profile should highlight your skills, education or background, the kind of work you're interested in, and any projects you've completed. A strong profile makes it easier for organizations to discover you.",
      },
      {
        q: "How are projects different from challenges?",
        a: "A challenge is an open opportunity you apply to. A project is created when a challenge moves into active collaboration — it represents the work you're doing with an organization.",
      },
      {
        q: "Can organizations browse talent profiles?",
        a: "Yes. Organizations can explore the talent showcase to find people whose skills match their needs, even outside of active challenge applications.",
      },
    ],
  },
  {
    category: "Technical & account",
    items: [
      {
        q: "How do I reset my password?",
        a: "From the login page, click 'Forgot password?' and enter your registered email address. You'll receive instructions to reset your password.",
      },
      {
        q: "Can I change my role after signing up?",
        a: "Not directly. Roles are set at registration. If you need to change your role, please contact us through the contact page and we'll help you.",
      },
      {
        q: "How is my data protected?",
        a: "We store your data securely and do not share it with third parties without your consent. Your password is never stored in plain text. For more details, review our privacy policy.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-slate-900 sm:text-base">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-0.5 shrink-0 text-slate-400"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-7 text-slate-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <HelpCircle size={28} />
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-teal-700">
              FAQs
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Frequently asked questions
            </h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
              Everything you need to know about Talent Community. Can't find
              what you're looking for?{" "}
              <Link
                to="/contact"
                className="font-semibold text-teal-700 hover:text-teal-600"
              >
                Send us a message.
              </Link>
            </p>
          </motion.div>
        </section>

        {/* FAQ sections */}
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl space-y-14">
            {faqs.map((section, si) => (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: si * 0.05 }}
              >
                <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                  {section.category}
                </h2>
                <div className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-20 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl rounded-3xl bg-[#102c46] px-8 py-12 text-center"
          >
            <h2 className="text-2xl font-extrabold text-white">
              Still have questions?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
              Our team is happy to help. Reach out and we'll get back to you as
              soon as possible.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-400"
            >
              Contact us
            </Link>
          </motion.div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
