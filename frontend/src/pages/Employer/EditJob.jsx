import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  ChevronLeft, 
  Loader2, 
  AlertCircle,
  Save,
  CheckCircle2
} from "lucide-react";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        const job = res.data.job;
        setForm({
          title: job.title || "",
          description: job.description || "",
          category: job.category || "",
          country: job.country || "",
          city: job.city || "",
          location: job.location || "",
          salaryType: job.fixedSalary ? "fixed" : "range",
          fixedSalary: job.fixedSalary || "",
          salaryFrom: job.salaryFrom || "",
          salaryTo: job.salaryTo || "",
        });
     } catch (err) {
  setError(err.response?.data?.message || "Failed to load job");
} finally {
  setFetching(false);
}
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      country: form.country,
      city: form.city,
      location: form.location,
      ...(form.salaryType === "fixed"
        ? { fixedSalary: form.fixedSalary, salaryFrom: null, salaryTo: null }
        : { salaryFrom: form.salaryFrom, salaryTo: form.salaryTo, fixedSalary: null }),
    };

    try {
      // Updated to match backend PUT /jobs/update/:id or /jobs/:id
      await api.put(`/jobs/update/${id}`, payload);
      
      // Stay on page and show success banner
      setSuccess("Job posting updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update job");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400";
  const labelClass = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300";

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading job details...</p>
      </div>
    );
  }

  if (!form && error) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Failed to load</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-3 group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Edit Job Posting
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the details and requirements for this position.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0F1115] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Success Banner */}
        {success && (
          <div className="mx-8 mt-8 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{success}</p>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mx-8 mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Section 1: Job Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Details</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Job Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Engineering, Marketing"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the responsibilities, requirements, and benefits..."
                rows={5}
                className={`${inputClass} resize-y min-h-[120px]`}
                required
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-white/5" />

        {/* Section 2: Location */}
        <div className="p-6 sm:p-8 space-y-6 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Country</label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="e.g. United States"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. San Francisco"
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Detailed Location <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. 123 Tech Boulevard, Suite 400 or 'Remote'"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <hr className="border-gray-100 dark:border-white/5" />

        {/* Section 3: Compensation */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
            <DollarSign className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Compensation</h2>
          </div>

          <div className="space-y-5">
            <div className="max-w-sm">
              <label className={labelClass}>Salary Type</label>
              <select
                name="salaryType"
                value={form.salaryType}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value="fixed">Fixed Salary</option>
                <option value="range">Salary Range</option>
              </select>
            </div>

            {form.salaryType === "fixed" ? (
              <div className="max-w-sm">
                <label className={labelClass}>Fixed Salary</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="fixedSalary"
                    value={form.fixedSalary}
                    onChange={handleChange}
                    placeholder="e.g. 120000"
                    className={`${inputClass} pl-9`}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                <div>
                  <label className={labelClass}>Salary From</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="salaryFrom"
                      value={form.salaryFrom}
                      onChange={handleChange}
                      placeholder="e.g. 80000"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Salary To</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="salaryTo"
                      value={form.salaryTo}
                      onChange={handleChange}
                      placeholder="e.g. 130000"
                      className={`${inputClass} pl-9`}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 sm:p-8 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0F1115] disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditJob;