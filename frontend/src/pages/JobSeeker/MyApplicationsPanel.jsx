import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  FileText,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status) {
    case "Accepted":
      return {
        style:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
        icon: (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        ),
      };
    case "Rejected":
      return {
        style:
          "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
        icon: (
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
        ),
      };
    case "Reviewed":
      return {
        style:
          "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
        icon: (
          <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
        ),
      };
    default:
      return {
        style:
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
        icon: (
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        ),
      };
  }
};

const MyApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/applications/my-applications");
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors duration-200">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading your applications...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-2xl transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Job Seeker Dashboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Your Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and manage the progress of all your submitted job applications
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-95 transition-all shrink-0 shadow-sm"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse More Jobs</span>
        </Link>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl transition-colors duration-200">
          <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            No applications submitted yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
            You haven't applied to any job postings yet. Explore open roles and land your next opportunity!
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group transition-all"
          >
            <span>Explore Open Roles</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        /* Applications List */
        <div className="space-y-3">
          {applications.map((app) => {
            const appId = app.id || app._id;
            const jobId = app.job?.id || app.job?._id;
            const statusInfo = getStatusBadge(app.status);

            return (
              <div
                key={appId}
                className="p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/60 hover:bg-slate-100/80 dark:hover:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <Link
                    to={jobId ? `/jobs/${jobId}` : "#"}
                    className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-2 group/title"
                  >
                    <span>{app.job?.title || "Untitled Position"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/title:opacity-100 transition-opacity text-slate-400 dark:text-slate-500" />
                  </Link>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {(app.job?.city || app.job?.country) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        {[app.job?.city, app.job?.country].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {app.job?.category && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        {app.job.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusInfo.style}`}
                  >
                    {statusInfo.icon}
                    <span>{app.status || "Pending"}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPanel;