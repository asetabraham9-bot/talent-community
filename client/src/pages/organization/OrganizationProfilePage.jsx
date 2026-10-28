import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Save,
  Shield,
} from "lucide-react";
import { apiRequest } from "../../services/api";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay } },
});

// ─── Options ─────────────────────────────────────────────────
const ORG_TYPES = [
  { value: "business",       label: "Business" },
  { value: "institution",    label: "Educational Institution" },
  { value: "nonprofit",      label: "Non-Profit" },
  { value: "community_group",label: "Community Group" },
  { value: "other",          label: "Other" },
];

const VERIFICATION_STYLES = {
  pending:  { bg: "bg-amber-50",  text: "text-amber-700", icon: Clock3,       label: "Pending verification" },
  verified: { bg: "bg-green-50",  text: "text-green-700", icon: CheckCircle2, label: "Verified organization" },
  rejected: { bg: "bg-red-50",    text: "text-red-700",   icon: AlertCircle,  label: "Verification rejected" },
};

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        {Icon && <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Icon size={18} /></div>}
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      {...props}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function OrganizationProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNew, setIsNew] = useState(false);

  const [form, setForm] = useState({
    organizationName: "",
    organizationType: "business",
    description: "",
    website: "",
    contactEmail: "",
    location: { country: "Ethiopia", region: "", city: "" },
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiRequest("/organization/profile");
        const p = res?.data?.profile;
        if (p) {
          setProfile(p);
          setForm({
            organizationName: p.organizationName ?? "",
            organizationType: p.organizationType ?? "business",
            description: p.description ?? "",
            website: p.website ?? "",
            contactEmail: p.contactEmail ?? "",
            location: p.location ?? { country: "Ethiopia", region: "", city: "" },
          });
        } else {
          setIsNew(true);
        }
      } catch {
        setIsNew(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    setError("");
    setSuccess("");
  }

  function setLocation(key, value) {
    setForm(prev => ({ ...prev, location: { ...prev.location, [key]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const method = isNew ? "POST" : "PATCH";
      const res = await apiRequest("/organization/profile", {
        method,
        body: JSON.stringify(form),
      });
      const p = res?.data?.profile;
      if (p) {
        setProfile(p);
        setIsNew(false);
      }
      setSuccess(isNew ? "Profile created! Awaiting admin verification." : "Profile updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin text-teal-600" />
      </div>
    );
  }

  const verStyle = VERIFICATION_STYLES[profile?.verificationStatus] ?? VERIFICATION_STYLES.pending;
  const VerIcon = verStyle.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Organization Workspace</p>
        <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Organization Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isNew ? "Create your organization profile to start publishing challenges." : "Keep your profile up to date for better visibility."}
        </p>
      </motion.div>

      {/* Verification status */}
      {profile && (
        <motion.div variants={fadeUp(0.04)} initial="hidden" animate="visible"
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${verStyle.bg} ${verStyle.text}`}>
          <VerIcon size={17} className="shrink-0" />
          <div>
            <p className="font-semibold">{verStyle.label}</p>
            {profile.verificationStatus === "pending" && (
              <p className="mt-0.5 text-xs">An admin will review your profile. This may take 1–2 business days.</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Alerts */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Identity */}
        <motion.div variants={fadeUp(0.06)} initial="hidden" animate="visible">
          <SectionCard title="Organization Identity" icon={Building2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Organization name *">
                <Input
                  required
                  placeholder="e.g. Addis Innovation Hub"
                  value={form.organizationName}
                  onChange={e => setField("organizationName", e.target.value)}
                  maxLength={150}
                />
              </Field>
              <Field label="Organization type *">
                <select
                  required
                  value={form.organizationType}
                  onChange={e => setField("organizationType", e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {ORG_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description *">
                <textarea
                  required
                  rows={5}
                  className="block w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Describe your organization, its mission, and the kind of challenges you typically publish…"
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  minLength={20}
                  maxLength={3000}
                />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Contact */}
        <motion.div variants={fadeUp(0.08)} initial="hidden" animate="visible">
          <SectionCard title="Contact & Web Presence" icon={Globe2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Website">
                <Input
                  type="url"
                  placeholder="https://yourorg.et"
                  value={form.website}
                  onChange={e => setField("website", e.target.value)}
                  maxLength={500}
                />
              </Field>
              <Field label="Contact email">
                <Input
                  type="email"
                  placeholder="contact@yourorg.et"
                  value={form.contactEmail}
                  onChange={e => setField("contactEmail", e.target.value)}
                  maxLength={254}
                />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Location */}
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible">
          <SectionCard title="Location" icon={MapPin}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Country">
                <Input value={form.location.country} onChange={e => setLocation("country", e.target.value)} placeholder="Ethiopia" />
              </Field>
              <Field label="Region">
                <Input value={form.location.region} onChange={e => setLocation("region", e.target.value)} placeholder="e.g. Addis Ababa" />
              </Field>
              <Field label="City">
                <Input value={form.location.city} onChange={e => setLocation("city", e.target.value)} placeholder="e.g. Addis Ababa" />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Save */}
        <motion.div variants={fadeUp(0.12)} initial="hidden" animate="visible">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? "Saving…" : isNew ? "Create Profile" : "Save Changes"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
