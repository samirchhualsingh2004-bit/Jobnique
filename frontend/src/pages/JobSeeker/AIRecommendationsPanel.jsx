  import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Sparkles,
  MapPin,
  Briefcase,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  Building2,
  TrendingUp,
  Search,
} from "lucide-react";

const AIRecommendationsPanel = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGetRecommendations = async () => {
    setLoading(true);
    setError("");
    setRecommendations(null);
    try {
      const res = await api.post("/ai/recommend-jobs", {});
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch job recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-2xl transition-colors duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Match Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            AI Job Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personalized job suggestions based on your resume and skill profile
          </p>
        </div>

        <button
          onClick={handleGetRecommendations}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{recommendations ? "Refresh Matches" : "Get Recommendations"}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{error}</p>
        </div>
      )}

      {/* Empty State: Call to Action */}
      {!recommendations && !loading && !error && (
        <div className="p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl transition-colors duration-200">
          <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Ready to find your best-fit roles?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            Ensure your resume is updated in your{" "}
            <Link
              to="/profile"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition-colors"
            >
              profile settings
            </Link>
            , then click the button above to run our AI matcher.
          </p>
        </div>
      )}

      {/* Empty State: No Matches Found */}
      {recommendations && recommendations.length === 0 && (
        <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl transition-colors duration-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            No strong matches found right now.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try updating your profile skills or checking back later as new positions open up.
          </p>
        </div>
      )}

      {/* Recommendation Results List */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
            <span>Showing top {recommendations.length} matched positions</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> High accuracy match
            </span>
          </div>

          <div className="grid gap-3.5">
            {recommendations.map((rec, index) => {
              const jobId = rec.job?.id || rec.job?._id;
              return (
                <Link
                  key={jobId ? `job-${jobId}-${index}` : `rec-${index}`}
                  to={`/jobs/${jobId}`}
                  className="group relative p-5 bg-slate-50/60 dark:bg-slate-950/60 hover:bg-slate-100/80 dark:hover:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                        <span>{rec.job?.title}</span>
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {(rec.job?.city || rec.job?.country) && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            {[rec.job.city, rec.job.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {rec.job?.category && (
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            {rec.job.category}
                          </span>
                        )}
                        {rec.job?.companyName && (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                            {rec.job.companyName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-all shrink-0">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {rec.reason && (
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-start gap-2.5">
                      <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-900 dark:text-indigo-300 font-semibold">
                          Why it matches:{" "}
                        </strong>
                        {rec.reason}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default AIRecommendationsPanel;