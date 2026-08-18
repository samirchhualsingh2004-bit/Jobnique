import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Briefcase, Building2, MapPin, Calendar, PlusCircle, Loader2 } from "lucide-react";

const MyPostedJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs/employer/my-jobs");
        
        // Extract array safely across different backend response formats
        const jobsArray = 
          res.data?.jobs || 
          res.data?.data || 
          (Array.isArray(res.data) ? res.data : []);

        setMyJobs(jobsArray);
      } catch (err) {
        console.error("Failed to fetch employer jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] dark:bg-slate-950 text-[#111827] dark:text-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F80ED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-slate-950 text-[#111827] dark:text-slate-100 pt-12 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white">
              My Posted Jobs
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-slate-400 mt-1">
              Currently displaying all {myJobs.length} job listings posted by your organization.
            </p>
          </div>
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#2F80ED] to-[#2563EB] text-white font-semibold text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Jobs List */}
        {myJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 rounded-3xl">
            <Briefcase className="w-12 h-12 mx-auto text-[#9CA3AF] dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-bold text-[#111827] dark:text-slate-200">No jobs posted yet</h3>
            <p className="text-sm text-[#6B7280] dark:text-slate-400 mt-1">
              Click the "Post New Job" button above to publish your first listing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myJobs.map((job) => (
              <div
                key={job.id || job._id}
                className="bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:border-[#2F80ED]/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EDF5FF] dark:bg-slate-800 text-[#2F80ED] dark:text-blue-400 border border-[#2F80ED]/20">
                      {job.jobType || "Full-Time"}
                    </span>
                    <span className="text-xs text-[#6B7280] dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111827] dark:text-white line-clamp-1">{job.title}</h3>
                  
                  <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-1.5 mt-2">
                    <Building2 className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{job.companyName || "Your Company"}</span>
                  </p>

                  <p className="text-xs text-[#6B7280] dark:text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{job.location || "Remote"}</span>
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111827] dark:text-slate-300">
                    {job.salary ? `$${job.salary}` : "Salary Unspecified"}
                  </span>
                  <Link
                    to={`/jobs/${job.id || job._id}`}
                    className="text-[#2F80ED] dark:text-blue-400 font-bold hover:underline"
                  >
                    View Listing →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPostedJobs;