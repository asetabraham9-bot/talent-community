import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import PublicHeader from "../../components/navigation/PublicHeader";
import PublicFooter from "../../components/navigation/PublicFooter";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
});

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@talentcommunity.et",
    href: "mailto:hello@talentcommunity.et",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Addis Ababa, Ethiopia",
    href: null,
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Usually within 24 hours",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    // Simulate submission — replace with real API call when endpoint exists
    await new Promise((res) => setTimeout(res, 1200));
    setStatus("success");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <PublicHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 lg:py-20">
          <motion.div
            variants={fadeUp(0)}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-teal-700">
              Get in touch
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              We'd love to hear from you
            </h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
              Have a question, a partnership idea, or just want to say hello?
              Send us a message and we'll get back to you.
            </p>
          </motion.div>
        </section>

        {/* Content */}
        <section className="px-5 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <motion.div
              variants={fadeUp(0.1)}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-2xl font-bold text-slate-900">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill out the form below and we'll respond as soon as we can.
              </p>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 flex flex-col items-center rounded-2xl border border-teal-200 bg-teal-50 px-8 py-12 text-center"
                >
                  <CheckCircle2 size={48} className="text-teal-600" />
                  <h3 className="mt-4 text-xl font-bold text-slate-900">
                    Message sent!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-7 text-slate-600">
                    Thank you for reaching out. We'll review your message and
                    get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="mt-6 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                  noValidate
                >
                  {errorMsg && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                      <AlertCircle size={17} className="mt-0.5 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Full name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Email address
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what's on your mind…"
                      className="block w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60 sm:w-auto"
                  >
                    <MessageSquare size={17} />
                    {status === "loading" ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info panel */}
            <motion.div
              variants={fadeUp(0.2)}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7">
                <h3 className="font-bold text-slate-900">Contact information</h3>
                <div className="mt-6 space-y-5">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <item.icon size={19} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="mt-0.5 text-sm font-medium text-teal-700 hover:text-teal-600"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-sm text-slate-800">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#102c46] p-7 text-white">
                <h3 className="font-bold">Looking to partner?</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  If you're an organization interested in publishing challenges
                  or exploring a partnership, we'd love to hear from you.
                  Reach out and let's start a conversation.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
