import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Users,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Mail,
  Loader2,
  Building2,
  FileText,
  ExternalLink,
} from "lucide-react";

const EmployerJobsPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicantsFor, setApplicantsFor] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/employer/my-jobs");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch employer jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => (j.id || j._id) !== jobId));
      if (applicantsFor === jobId) {
        setApplicantsFor(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete job");
    }
  };

  const toggleApplicants = async (jobId) => {
    if (applicantsFor === jobId) {
      setApplicantsFor(null);
      setApplicants([]);
      return;
    }

    setApplicantsFor(jobId);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplicants(res.data.applications || []);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => ((a.id || a._id) === applicationId ? { ...a, status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Rejected":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case "Reviewed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <p className="text-xs text-slate-400">Loading your job postings...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-xl shadow-2xl transition-all">
      
      {/* Ambient Glow */}
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Employer Dashboard</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Your Posted Jobs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage listings, track applicants, and review incoming candidate profiles
          </p>
        </div>

        <Link
          to="/post-job"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Job</span>
        </Link>
      </div>

      {/* Jobs Container */}
      {jobs.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-2xl">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            No active job postings
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            You haven't created any job listings yet.
          </p>
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 transition-all border border-slate-700"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create First Job</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobId = job.id || job._id;
            const isViewingApplicants = applicantsFor === jobId;

            return (
              <div
                key={jobId}
                className="p-5 bg-slate-950/70 border border-slate-800/90 rounded-2xl transition-all duration-200 hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-base">
                      {job.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1.5 text-xs text-slate-400">
                      {(job.city || job.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {[job.city, job.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {job.category && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                          {job.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleApplicants(jobId)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isViewingApplicants
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10"
                          : "bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Applicants</span>
                      {isViewingApplicants ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <Link
                      to={`/edit-job/${jobId}`}
                      className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-all"
                      title="Edit Job"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(jobId)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Applicants Drawer */}
                {isViewingApplicants && (
                  <div className="pt-4 mt-4 border-t border-slate-800/80 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        Candidate Applications ({applicants.length})
                      </span>
                      {loadingApplicants && (
                        <span className="text-xs text-indigo-400 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Fetching...
                        </span>
                      )}
                    </div>

                    {!loadingApplicants && applicants.length === 0 ? (
                      <div className="p-4 bg-slate-900/50 border border-slate-800/60 rounded-xl text-center">
                        <p className="text-xs text-slate-400">
                          No candidates have applied to this position yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {applicants.map((app) => {
                          const appId = app.id || app._id;
                          const resumeUrl = app.resume || app.applicant?.resume;

                          return (
                            <div
                              key={appId}
                              className="p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
                                  <span>{app.applicant?.name || "Anonymous Applicant"}</span>
                                  {resumeUrl && (
                                    <a
                                      href={resumeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                      title="View Resume / CV"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>Resume</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </p>
                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  {app.applicant?.email || "No email provided"}
                                </p>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span
                                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                                    app.status
                                  )}`}
                                >
                                  {app.status || "Pending"}
                                </span>

                                <select
                                  value={app.status || "Pending"}
                                  onChange={(e) => updateStatus(appId, e.target.value)}
                                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500/80 text-slate-200 rounded-xl outline-none cursor-pointer transition-all"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>

                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployerJobsPanel;