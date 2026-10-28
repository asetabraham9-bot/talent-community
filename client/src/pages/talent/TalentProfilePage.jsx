import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Globe2,
  GraduationCap,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { apiRequest } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ─── Motion ──────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay } },
});

// ─── Helpers ─────────────────────────────────────────────────
const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "expert"];
const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available", color: "text-green-700 bg-green-50" },
  { value: "open_to_opportunities", label: "Open to opportunities", color: "text-amber-700 bg-amber-50" },
  { value: "unavailable", label: "Not available", color: "text-red-700 bg-red-50" },
];
const LEVEL_COLORS = {
  beginner:     "bg-slate-100 text-slate-600",
  intermediate: "bg-blue-50 text-blue-700",
  advanced:     "bg-teal-50 text-teal-700",
  expert:       "bg-violet-50 text-violet-700",
};

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
        {action}
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

function Textarea({ ...props }) {
  return (
    <textarea
      className="block w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      rows={4}
      {...props}
    />
  );
}

// ─── Page ────────────────────────────────────────────────────
export default function TalentProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    education: "",
    portfolioUrl: "",
    availability: "open_to_opportunities",
    location: { country: "Ethiopia", region: "", city: "" },
    skills: [],
    interests: [],
    socialLinks: [],
  });

  // Skill draft
  const [newSkill, setNewSkill] = useState({ name: "", level: "beginner" });
  const [newInterest, setNewInterest] = useState("");
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiRequest("/talent/profile");
        const p = res?.data?.profile;
        if (p) {
          setProfile(p);
          setForm({
            headline: p.headline ?? "",
            bio: p.bio ?? "",
            education: p.education ?? "",
            portfolioUrl: p.portfolioUrl ?? "",
            availability: p.availability ?? "open_to_opportunities",
            location: p.location ?? { country: "Ethiopia", region: "", city: "" },
            skills: Array.isArray(p.skills) ? p.skills : [],
            interests: Array.isArray(p.interests) ? p.interests : [],
            socialLinks: Array.isArray(p.socialLinks) ? p.socialLinks : [],
          });
        } else {
          setIsNew(true);
        }
      } catch (err) {
        // Profile not found — show create form
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

  function addSkill() {
    if (!newSkill.name.trim()) return;
    setForm(prev => ({ ...prev, skills: [...prev.skills, { name: newSkill.name.trim(), level: newSkill.level }] }));
    setNewSkill({ name: "", level: "beginner" });
  }

  function removeSkill(idx) {
    setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  }

  function addInterest() {
    if (!newInterest.trim()) return;
    setForm(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
    setNewInterest("");
  }

  function removeInterest(idx) {
    setForm(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== idx) }));
  }

  function addSocialLink() {
    if (!newSocialLink.platform.trim() || !newSocialLink.url.trim()) return;
    setForm(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { ...newSocialLink }] }));
    setNewSocialLink({ platform: "", url: "" });
  }

  function removeSocialLink(idx) {
    setForm(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const method = isNew ? "POST" : "PATCH";
      const res = await apiRequest("/talent/profile", {
        method,
        body: JSON.stringify(form),
      });
      const p = res?.data?.profile;
      if (p) {
        setProfile(p);
        setIsNew(false);
      }
      setSuccess(isNew ? "Profile created successfully!" : "Profile updated successfully!");
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

  const availability = AVAILABILITY_OPTIONS.find(a => a.value === form.availability);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp(0)} initial="hidden" animate="visible">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Talent Workspace</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">My Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isNew ? "Create your profile to become visible to organizations." : "Keep your profile up to date to attract more opportunities."}
            </p>
          </div>
          {!isNew && (
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${availability?.color ?? ""}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {availability?.label}
            </div>
          )}
        </div>
      </motion.div>

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
        {/* Basic info */}
        <motion.div variants={fadeUp(0.05)} initial="hidden" animate="visible">
          <SectionCard title="Basic Information" action={<User size={18} className="text-teal-700" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Professional headline">
                <Input
                  placeholder="e.g. Full Stack Developer · Open to collaboration"
                  value={form.headline}
                  onChange={e => setField("headline", e.target.value)}
                  maxLength={120}
                />
              </Field>
              <Field label="Availability">
                <select
                  value={form.availability}
                  onChange={e => setField("availability", e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {AVAILABILITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Bio">
                <Textarea
                  placeholder="Tell organizations about yourself, your background, and what you're passionate about…"
                  value={form.bio}
                  onChange={e => setField("bio", e.target.value)}
                  maxLength={2000}
                  rows={5}
                />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Location & Education */}
        <motion.div variants={fadeUp(0.08)} initial="hidden" animate="visible">
          <SectionCard title="Location & Education" action={<MapPin size={18} className="text-teal-700" />}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Country">
                <Input value={form.location.country} onChange={e => setLocation("country", e.target.value)} placeholder="Ethiopia" />
              </Field>
              <Field label="Region">
                <Input value={form.location.region} onChange={e => setLocation("region", e.target.value)} placeholder="e.g. Oromia" />
              </Field>
              <Field label="City">
                <Input value={form.location.city} onChange={e => setLocation("city", e.target.value)} placeholder="e.g. Addis Ababa" />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Education">
                <Input
                  value={form.education}
                  onChange={e => setField("education", e.target.value)}
                  placeholder="e.g. BSc Computer Science, Addis Ababa University"
                  maxLength={200}
                />
              </Field>
            </div>
          </SectionCard>
        </motion.div>

        {/* Skills */}
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible">
          <SectionCard title="Skills" action={<Sparkles size={18} className="text-teal-700" />}>
            {form.skills.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {form.skills.map((skill, idx) => (
                  <span key={idx} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[skill.level] ?? LEVEL_COLORS.beginner}`}>
                    {skill.name}
                    <span className="opacity-60">· {skill.level}</span>
                    <button type="button" onClick={() => removeSkill(idx)} className="ml-1 rounded-full hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Skill name"
                value={newSkill.name}
                onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="min-w-[160px] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={60}
              />
              <select
                value={newSkill.level}
                onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {SKILL_LEVELS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </SectionCard>
        </motion.div>

        {/* Interests */}
        <motion.div variants={fadeUp(0.12)} initial="hidden" animate="visible">
          <SectionCard title="Interests" action={<Edit3 size={18} className="text-teal-700" />}>
            {form.interests.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {form.interests.map((interest, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                    {interest}
                    <button type="button" onClick={() => removeInterest(idx)} className="ml-1 rounded-full hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add an interest (e.g. Machine Learning)"
                value={newInterest}
                onChange={e => setNewInterest(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addInterest())}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={80}
              />
              <button
                type="button"
                onClick={addInterest}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </SectionCard>
        </motion.div>

        {/* Portfolio & Links */}
        <motion.div variants={fadeUp(0.14)} initial="hidden" animate="visible">
          <SectionCard title="Portfolio & Social Links" action={<Globe2 size={18} className="text-teal-700" />}>
            <div className="mb-4">
              <Field label="Portfolio URL">
                <Input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={form.portfolioUrl}
                  onChange={e => setField("portfolioUrl", e.target.value)}
                  maxLength={500}
                />
              </Field>
            </div>

            {form.socialLinks.length > 0 && (
              <div className="mb-4 space-y-2">
                {form.socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                    <Link2 size={15} className="shrink-0 text-slate-400" />
                    <span className="font-medium text-slate-700">{link.platform}</span>
                    <span className="flex-1 truncate text-slate-500">{link.url}</span>
                    <button type="button" onClick={() => removeSocialLink(idx)} className="text-slate-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Platform (e.g. GitHub)"
                value={newSocialLink.platform}
                onChange={e => setNewSocialLink(p => ({ ...p, platform: e.target.value }))}
                className="min-w-[130px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={50}
              />
              <input
                type="url"
                placeholder="https://..."
                value={newSocialLink.url}
                onChange={e => setNewSocialLink(p => ({ ...p, url: e.target.value }))}
                className="flex-1 min-w-[200px] rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                maxLength={500}
              />
              <button
                type="button"
                onClick={addSocialLink}
                className="flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <Plus size={15} />
                Add
              </button>
            </div>
          </SectionCard>
        </motion.div>

        {/* Save button */}
        <motion.div variants={fadeUp(0.16)} initial="hidden" animate="visible">
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
