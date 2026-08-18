import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import {
  MapPin,
  IndianRupee,
  Building2,
  Send,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  UserCheck,
  FileText,
  Upload,
  FileCheck,
  Download,
  BriefcaseBusiness,
  CalendarDays,
  Hash,
} from "lucide-react";

const formatSalary = (job) => {
  if (job?.fixedSalary) {
    return `₹${Number(job.fixedSalary).toLocaleString("en-IN")}/yr`;
  }

  if (job?.salaryFrom && job?.salaryTo) {
    return `₹${Number(job.salaryFrom).toLocaleString("en-IN")} - ₹${Number(
      job.salaryTo
    ).toLocaleString("en-IN")}/yr`;
  }

  return "Competitive";
};

const formatPostedDate = (date) => {
  if (!date) return "Recently posted";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Recently posted";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getLocation = (job) => {
  if (job?.city && job?.country) return `${job.city}, ${job.country}`;
  if (job?.location) return job.location;
  return "Location not specified";
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeUrlFile] = useState(null);
  const [applyStatus, setApplyStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [downloadLoading, setDownloadLoading] = useState(false);

  const isEmployer = user?.role === "Employer";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/single/${id}`);
        setJob(res.data?.job || res.data);
      } catch (err) {
        console.error("API Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleDownloadJobPDF = async () => {
    if (!job?.id) return;

    setDownloadLoading(true);
    setApplyStatus({ loading: false, message: "", error: "" });

    try {
      const response = await api.get(`/jobs/${job.id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const contentDisposition = response.headers["content-disposition"];

      let filename = `${job.title || "Job"}_Jobnique.pdf`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/i);
        if (match?.[1]) filename = match[1];
      }

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Job PDF download error:", err);
      setApplyStatus({
        loading: false,
        message: "",
        error:
          err.response?.data?.message ||
          "Unable to download the job description PDF. Please try again.",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setApplyStatus({
        loading: false,
        message: "",
        error: "Please upload a valid PDF file (.pdf)",
      });
      setResumeUrlFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setApplyStatus({
        loading: false,
        message: "",
        error: "Resume must be 5MB or smaller.",
      });
      setResumeUrlFile(null);
      return;
    }

    setApplyStatus({ loading: false, message: "", error: "" });
    setResumeUrlFile(selectedFile);
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!resumeFile) {
      setApplyStatus({
        loading: false,
        message: "",
        error: "Please select a PDF resume file to upload.",
      });
      return;
    }

    setApplyStatus({ loading: true, message: "", error: "" });

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("coverLetter", coverLetter);

      await api.post(`/applications/${id}/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setApplyStatus({
        loading: false,
        message: "Application submitted successfully!",
        error: "",
      });
      setCoverLetter("");
      setResumeUrlFile(null);
    } catch (err) {
      setApplyStatus({
        loading: false,
        message: "",
        error:
          err.response?.data?.message ||
          "Failed to submit application. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] flex flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 rounded-full border-4 border-blue-100 dark:border-blue-950 border-t-[#2F80ED] animate-spin" />
          <Sparkles className="absolute h-5 w-5 text-[#2F80ED] animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading job details...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B0F17] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#111827]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Job Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This job may have been removed or is no longer available.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#2F80ED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const companyName =
    job.employer?.companyName || job.companyName || "Verified Employer";
  const employerName = job.employer?.name || "Employer";
  const employerDesignation = job.employer?.designation;
  const jobLocation = getLocation(job);
  const workMode = job.location || "Not specified";
  const postedDate = formatPostedDate(job.createdAt);
  const salary = formatSalary(job);

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-16 pt-24 font-sans text-slate-800 transition-colors dark:bg-[#0B0F17] dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <div className="mb-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F80ED] transition hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
        </div>

        {/* Main page grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-start">
          {/* Left content */}
          <main className="space-y-6 xl:col-span-9">
            {/* Job hero */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/30">
                    <Building2 className="h-8 w-8 text-[#2F80ED] dark:text-[#56CCF2]" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2F80ED] dark:bg-blue-950/30 dark:text-[#56CCF2]">
                        {job.category || "General"}
                      </span>
                      {workMode !== "Not specified" && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {workMode}
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                      {job.title}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-[#2F80ED] dark:text-[#56CCF2]">
                        {companyName}
                      </span>
                      <span>•</span>
                      <span>{employerName}</span>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        Verified Employer
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                  <button
                    type="button"
                    onClick={handleDownloadJobPDF}
                    disabled={downloadLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2F80ED] bg-white px-5 py-3 text-sm font-semibold text-[#2F80ED] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-transparent dark:hover:bg-blue-950/30"
                  >
                    {downloadLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {downloadLoading ? "Preparing..." : "Download PDF"}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{jobLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                  <span>{workMode}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <IndianRupee className="h-4 w-4" />
                  <span className="font-semibold">{salary}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4" />
                  <span>Posted {postedDate}</span>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827] sm:p-7">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                <FileText className="h-5 w-5 text-[#2F80ED] dark:text-[#56CCF2]" />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Job Description
                </h2>
              </div>

              <div className="whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {job.description}
              </div>
            </section>

            {/* Employer + overview */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">
                  About the Employer
                </h2>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Building2 className="h-6 w-6 text-[#2F80ED] dark:text-[#56CCF2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {companyName}
                      </h3>
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Posted by {employerName}
                      {employerDesignation ? ` • ${employerDesignation}` : ""}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">
                  Job Overview
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Job ID</span>
                    <span className="ml-auto font-medium text-slate-800 dark:text-slate-200">
                      JN-{job.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Posted</span>
                    <span className="ml-auto font-medium text-slate-800 dark:text-slate-200">
                      {postedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Location</span>
                    <span className="ml-auto max-w-[55%] text-right font-medium text-slate-800 dark:text-slate-200">
                      {jobLocation}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Work Mode</span>
                    <span className="ml-auto max-w-[55%] text-right font-medium text-slate-800 dark:text-slate-200">
                      {workMode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Salary</span>
                    <span className="ml-auto text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {salary}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Employer note */}
            <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2F80ED] dark:bg-blue-900/40 dark:text-[#56CCF2]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Direct Employer Response
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Applications submitted through Jobnique are sent directly to the employer for review.
                </p>
              </div>
            </div>
          </main>

          {/* Application sidebar */}
          {!isEmployer && (
            <aside className="xl:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#111827]">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Apply for this Job
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    Upload your resume and apply for this position.
                  </p>
                </div>

                {applyStatus.message && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {applyStatus.message}
                    </p>
                  </div>
                )}

                {applyStatus.error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      {applyStatus.error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleApply} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Upload Resume <span className="text-red-500">*</span>
                    </label>

                    <label className="flex min-h-[145px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center transition hover:border-[#2F80ED] hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-[#56CCF2]">
                      {resumeFile ? (
                        <div className="flex max-w-full items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <FileCheck className="h-5 w-5 shrink-0" />
                          <span className="truncate">{resumeFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mb-3 h-6 w-6 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            Click to upload or drag and drop
                          </span>
                          <span className="mt-1 text-xs text-slate-400">
                            PDF only • Maximum 5MB
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Message
                      </label>
                      <span className="text-[11px] text-slate-400">Optional</span>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Introduce yourself or highlight key experience..."
                      rows={5}
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2F80ED] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#56CCF2] dark:focus:ring-blue-950"
                    />
                    <div className="mt-1 text-right text-[11px] text-slate-400">
                      {coverLetter.length}/500
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={applyStatus.loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F80ED] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2563EB] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applyStatus.loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Your application will be sent to the employer for review.
                  </p>
                </form>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;