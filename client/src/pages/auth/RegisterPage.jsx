import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Building2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit: (dir) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.2 } }),
};

const roles = [
  {
    id: "talent",
    icon: GraduationCap,
    title: "I'm a talent",
    description:
      "Discover challenges, showcase your skills, and connect with organizations looking for capability.",
    color: "teal",
  },
  {
    id: "organization",
    icon: Building2,
    title: "I'm an organization",
    description:
      "Share real problems, collaborate with talented people, and support practical learning.",
    color: "blue",
  },
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = role select, 2 = form
  const [direction, setDirection] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function goToStep2(role) {
    setSelectedRole(role);
    setDirection(1);
    setStep(2);
    setError("");
  }

  function goBack() {
    setDirection(-1);
    setStep(1);
    setError("");
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role: selectedRole }),
      });

      login(result.data ?? result);

      const role = result.data?.user?.role ?? result.user?.role ?? selectedRole;
      navigate(
        role === "talent"
          ? "/talent/dashboard"
          : role === "organization"
            ? "/organization/dashboard"
            : "/",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 font-bold text-white">
              TC
            </span>
            <span className="text-sm font-bold text-slate-900">
              Talent Community
            </span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-teal-700 text-white"
                    : "border border-slate-300 text-slate-400"
                }`}
              >
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 2 && (
                <div
                  className={`h-0.5 w-10 rounded-full transition-colors ${
                    step > s ? "bg-teal-700" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-8 sm:p-10"
              >
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Join the community
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  Choose how you'd like to participate.
                </p>

                <div className="mt-7 space-y-4">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => goToStep2(role.id)}
                      className={`group flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        role.color === "teal"
                          ? "border-slate-200 hover:border-teal-300 hover:bg-teal-50/50"
                          : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          role.color === "teal"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <role.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{role.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {role.description}
                        </p>
                      </div>
                      <ArrowRight
                        size={18}
                        className="mt-1 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-700"
                      />
                    </button>
                  ))}
                </div>

                <p className="mt-7 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-teal-700 hover:text-teal-600"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={direction}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-8 sm:p-10"
              >
                <button
                  type="button"
                  onClick={goBack}
                  className="mb-5 flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-800"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                  {selectedRole === "talent" ? (
                    <GraduationCap size={13} />
                  ) : (
                    <Building2 size={13} />
                  )}
                  {selectedRole === "talent" ? "Joining as talent" : "Joining as organization"}
                </div>

                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                  Create your account
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Fill in your details to get started.
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      {selectedRole === "organization" ? "Organization name" : "Full name"}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder={
                        selectedRole === "organization"
                          ? "Your organization's name"
                          : "Your full name"
                      }
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-email"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-500">
                  By creating an account you agree to our terms of service.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
