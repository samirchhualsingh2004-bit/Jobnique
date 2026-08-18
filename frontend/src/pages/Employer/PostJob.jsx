import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Briefcase,
  FileText,
  Tag,
  Globe,
  Building2,
  MapPin,
  IndianRupee,
  PlusCircle,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  Clock3,
  Code2,
  Users,
} from "lucide-react";

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "AI / Machine Learning",
  "DevOps",
  "Product Design",
  "Data Science",
  "Cybersecurity",
  "Product Management",
  "Other",
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
const WORK_MODES = ["On-site", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS = ["Fresher", "Entry Level", "Mid Level", "Senior Level", "Lead / Manager"];
const SALARY_PERIODS = ["Per Year", "Per Month", "Per Hour"];
const EDUCATION_OPTIONS = [
  "Any Degree",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "MCA",
  "B.Tech / B.E.",
  "MBA",
  "PhD",
  "Other",
];

const INITIAL_FORM = {
  title: "",
  jobSummary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  preferredQualifications: "",
  skills: "",
  category: "Full Stack",

  employmentType: "Full-time",
  workMode: "On-site",

  country: "India",
  city: "Bengaluru",
  location: "",

  salaryType: "fixed",
  salaryCurrency: "INR",
  salaryPeriod: "Per Year",
  fixedSalary: "",
  salaryFrom: "",
  salaryTo: "",

  experienceLevel: "Entry Level",
  minExperience: "0",
  maxExperience: "2",
  education: "Bachelor's Degree",

  numberOfOpenings: "1",
  applicationDeadline: "",
  expectedStartDate: "",
  applicationInstructions: "",
};

const inputClass =
  "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/10 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition-all text-sm";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2";

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2F80ED] flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      )}
    </div>
  </div>
);

const PostJob = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.salaryType === "fixed" && Number(form.fixedSalary) <= 0) {
      setError("Please enter a valid fixed salary.");
      return;
    }

    if (
      form.salaryType === "range" &&
      (Number(form.salaryFrom) <= 0 ||
        Number(form.salaryTo) <= 0 ||
        Number(form.salaryFrom) > Number(form.salaryTo))
    ) {
      setError("Please enter a valid salary range. Minimum must not exceed maximum.");
      return;
    }

    if (Number(form.numberOfOpenings) < 1) {
      setError("Number of openings must be at least 1.");
      return;
    }

    if (Number(form.minExperience) < 0 || Number(form.maxExperience) < Number(form.minExperience)) {
      setError("Please enter a valid experience range.");
      return;
    }

    if (form.applicationDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(`${form.applicationDeadline}T00:00:00`);
      if (deadline < today) {
        setError("Application deadline cannot be in the past.");
        return;
      }
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      jobSummary: form.jobSummary.trim(),
      description: form.description.trim(),
      responsibilities: form.responsibilities.trim(),
      requirements: form.requirements.trim(),
      preferredQualifications: form.preferredQualifications.trim(),
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      category: form.category,
      employmentType: form.employmentType,
      workMode: form.workMode,
      country: form.country.trim(),
      city: form.city.trim(),
      location: form.location.trim(),
      salaryCurrency: form.salaryCurrency,
      salaryPeriod: form.salaryPeriod,
      experienceLevel: form.experienceLevel,
      minExperience: Number(form.minExperience),
      maxExperience: Number(form.maxExperience),
      education: form.education,
      numberOfOpenings: Number(form.numberOfOpenings),
      applicationDeadline: form.applicationDeadline || null,
      expectedStartDate: form.expectedStartDate || null,
      applicationInstructions: form.applicationInstructions.trim(),
      ...(form.salaryType === "fixed"
        ? { fixedSalary: Number(form.fixedSalary), salaryFrom: null, salaryTo: null }
        : {
            fixedSalary: null,
            salaryFrom: Number(form.salaryFrom),
            salaryTo: Number(form.salaryTo),
          }),
    };

    try {
      await api.post("/jobs", payload);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to publish job posting. Please check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-7">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2F80ED] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/50 text-[#2F80ED] text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Employer Hiring Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Publish a New Role
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm sm:text-right">
              Provide complete, accurate information so candidates can understand the role before applying.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-800/60 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Information */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader
              icon={Briefcase}
              title="Job Information"
              description="The core information candidates will see first."
            />

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClass}>Job Title *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Job Summary *</label>
                <textarea
                  name="jobSummary"
                  value={form.jobSummary}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Write a short 1–3 sentence summary of the role."
                  className={`${inputClass} resize-y`}
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">{form.jobSummary.length}/500</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 z-10" />
                    <select name="category" value={form.category} onChange={handleChange} className={`${inputClass} pl-11`}>
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Employment Type *</label>
                  <select name="employmentType" value={form.employmentType} onChange={handleChange} className={inputClass}>
                    {EMPLOYMENT_TYPES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Work Mode *</label>
                  <select name="workMode" value={form.workMode} onChange={handleChange} className={inputClass}>
                    {WORK_MODES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader icon={MapPin} title="Location" description="Tell candidates where and how they will work." />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Country *</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input name="country" value={form.country} onChange={handleChange} className={`${inputClass} pl-11`} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>City *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Bengaluru" className={`${inputClass} pl-11`} required />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Office / Workplace Address</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Manyata Tech Park, Nagavara, Bengaluru"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader icon={IndianRupee} title="Compensation" description="Be transparent about the offered compensation." />

            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Currency *</label>
                  <select name="salaryCurrency" value={form.salaryCurrency} onChange={handleChange} className={inputClass}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Salary Period *</label>
                  <select name="salaryPeriod" value={form.salaryPeriod} onChange={handleChange} className={inputClass}>
                    {SALARY_PERIODS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Salary Structure *</label>
                  <select name="salaryType" value={form.salaryType} onChange={handleChange} className={inputClass}>
                    <option value="fixed">Fixed Salary</option>
                    <option value="range">Salary Range</option>
                  </select>
                </div>
              </div>

              {form.salaryType === "fixed" ? (
                <div>
                  <label className={labelClass}>Salary *</label>
                  <input type="number" min="0" name="fixedSalary" value={form.fixedSalary} onChange={handleChange} placeholder="e.g. 1200000" className={inputClass} required />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Minimum Salary *</label>
                    <input type="number" min="0" name="salaryFrom" value={form.salaryFrom} onChange={handleChange} placeholder="e.g. 800000" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Maximum Salary *</label>
                    <input type="number" min="0" name="salaryTo" value={form.salaryTo} onChange={handleChange} placeholder="e.g. 1600000" className={inputClass} required />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader icon={FileText} title="Role Description" description="Give candidates enough detail to understand the work." />

            <div className="mt-6 space-y-5">
              {[
                ["description", "Detailed Job Description *", "Describe the role, team, product, technology, and what the successful candidate will do.", true],
                ["responsibilities", "Key Responsibilities *", "List the main responsibilities. Use one responsibility per line.", true],
                ["requirements", "Required Qualifications *", "Mention essential technical skills, knowledge, and qualifications.", true],
                ["preferredQualifications", "Preferred Qualifications", "Optional skills or experience that would be an advantage.", false],
              ].map(([name, label, placeholder, required]) => (
                <div key={name}>
                  <label className={labelClass}>{label}</label>
                  <textarea
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    rows={name === "description" ? 6 : 5}
                    placeholder={placeholder}
                    className={`${inputClass} resize-y leading-relaxed`}
                    required={required}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Skills & Experience */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader icon={Code2} title="Skills, Experience & Education" description="Help candidates quickly determine whether they are a match." />

            <div className="mt-6 space-y-5">
              <div>
                <label className={labelClass}>Required Skills *</label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Java, Spring Boot, MySQL, REST API, Git"
                    className={`${inputClass} pl-11`}
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Separate skills with commas.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Experience Level *</label>
                  <select name="experienceLevel" value={form.experienceLevel} onChange={handleChange} className={inputClass}>
                    {EXPERIENCE_LEVELS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Education *</label>
                  <select name="education" value={form.education} onChange={handleChange} className={inputClass}>
                    {EDUCATION_OPTIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Minimum Experience (years) *</label>
                  <input type="number" min="0" name="minExperience" value={form.minExperience} onChange={handleChange} className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Maximum Experience (years) *</label>
                  <input type="number" min="0" name="maxExperience" value={form.maxExperience} onChange={handleChange} className={inputClass} required />
                </div>
              </div>
            </div>
          </section>

          {/* Hiring */}
          <section className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
            <SectionHeader icon={CalendarDays} title="Hiring Information" description="Set expectations for the application process." />

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Number of Openings *</label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input type="number" min="1" name="numberOfOpenings" value={form.numberOfOpenings} onChange={handleChange} className={`${inputClass} pl-11`} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Application Deadline *</label>
                <div className="relative">
                  <CalendarDays className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} className={`${inputClass} pl-11`} required />
                </div>
              </div>

              <div>
                <label className={labelClass}>Expected Start Date</label>
                <div className="relative">
                  <Clock3 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input type="date" name="expectedStartDate" value={form.expectedStartDate} onChange={handleChange} className={`${inputClass} pl-11`} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Application Instructions</label>
                <textarea
                  name="applicationInstructions"
                  value={form.applicationInstructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional instructions for candidates, e.g. portfolio links, assessment details, or interview process."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </section>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Review the information carefully. These details will be shown to job seekers and included in the job listing.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing Job Listing...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Publish Job Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;