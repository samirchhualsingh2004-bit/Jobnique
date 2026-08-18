import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Sparkles,
  PlusCircle,
  Search,
  Briefcase,
  Clock,
  CheckCircle2,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Edit,
  Check,
  X,
  UserCheck,
  Mail,
  MapPin,
  Building2,
  ToggleLeft,
  ToggleRight,
  Phone,
  FileText,
  ExternalLink,
  Kanban,
  Calendar,
  Video,
  Filter,
  User,
  ChevronRight,
  GripVertical,
  XCircle
} from "lucide-react";
import MyApplicationsPanel from "../JobSeeker/MyApplicationsPanel";
import AIRecommendationsPanel from "../JobSeeker/AIRecommendationsPanel";
import NotificationDropdown from "../../components/NotificationDropdown";

// Helper to point relative file paths to Express port 4000 for PDF viewing
const formatResumeUrl = (url) => {
  if (!url) return "#";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const backendBase = "http://localhost:4000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

// --- SUB-WINDOW 1: Interactive Hiring Pipeline (Kanban View) ---
const HiringPipelinePanel = ({ jobsData, onStatusChange, onScheduleInterview }) => {
  const [selectedJobId, setSelectedJobId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedCandidateId, setDraggedCandidateId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeCandidateModal, setActiveCandidateModal] = useState(null);
  const [schedulingCandidate, setSchedulingCandidate] = useState(null);

  // Form State for Interview Scheduling
  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    type: "Technical Round",
    meetLink: ""
  });

  const pipelines = [
    { id: "Applied", title: "Applied", color: "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20" },
    { id: "Interviewing", title: "Interviewing", color: "border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20" },
    { id: "Hired", title: "Hired", color: "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20" },
    { id: "Rejected", title: "Rejected", color: "border-rose-500/50 bg-rose-50/30 dark:bg-rose-950/20" }
  ];

  // Extract candidate cards dynamically across jobs
  const candidates = [];
  jobsData.forEach((job) => {
    const jobId = job.id || job._id;
    if (selectedJobId !== "all" && selectedJobId !== jobId) return;

    if (Array.isArray(job.applications)) {
      job.applications.forEach((app) => {
        let currentStage = "Applied";
        const st = app.status?.toLowerCase();
        if (st === "interviewing" || st === "interview invited" || st === "scheduled") currentStage = "Interviewing";
        else if (st === "accepted" || st === "hired") currentStage = "Hired";
        else if (st === "rejected" || st === "declined") currentStage = "Rejected";

        const name = app.applicantName || app.applicant?.name || app.name || "Candidate";
        const email = app.applicantEmail || app.applicant?.email || app.email || "No email";
        const phone = app.applicantPhone || app.applicant?.phone || app.phone || "Not provided";

        // Search Filter Logic
        if (
          searchQuery.trim() !== "" &&
          !name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !job.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return;
        }

        candidates.push({
          id: String(app.id || app._id),
          name,
          email,
          phone,
          role: job.title,
          jobId: jobId,
          stage: currentStage,
          resumeUrl: app.resumeUrl || app.applicant?.resumeUrl || app.resume,
          coverLetter: app.coverLetter || app.letter,
          interviewScheduled: app.interviewScheduled || st === "interviewing" || st === "scheduled"
        });
      });
    }
  });

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e, candId) => {
    e.dataTransfer.setData("text/plain", candId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedCandidateId(candId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    e.preventDefault();
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const candId = e.dataTransfer.getData("text/plain") || draggedCandidateId;
    setDragOverColumn(null);
    setDraggedCandidateId(null);

    if (!candId) return;

    let statusPayload = targetStage;
    if (targetStage === "Hired") statusPayload = "Accepted";

    onStatusChange(candId, statusPayload);
  };

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    if (!schedulingCandidate) return;

    const formattedTime = interviewForm.time ? interviewForm.time : "TBD";
    const newInterview = {
      id: Date.now(),
      candidate: schedulingCandidate.name,
      role: schedulingCandidate.role,
      date: interviewForm.date || "Upcoming",
      time: formattedTime,
      type: interviewForm.type,
      meetLink: interviewForm.meetLink || "https://meet.google.com/new",
      status: "Scheduled"
    };

    onScheduleInterview(schedulingCandidate.id, newInterview);
    setSchedulingCandidate(null);
    setInterviewForm({ date: "", time: "", type: "Technical Round", meetLink: "" });
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          {/* Job Filter Dropdown */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Position:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Posted Positions ({jobsData.length})</option>
              {jobsData.map((j) => (
                <option key={j.id || j._id} value={j.id || j._id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Inline Candidate Search */}
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Drag cards across columns or use actions to schedule interviews
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {pipelines.map((col) => {
          const colCandidates = candidates.filter((c) => c.stage === col.id);
          const isTargetColumn = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`p-4 rounded-3xl border ${col.color} min-h-[480px] flex flex-col justify-between space-y-4 transition-all duration-200 ${
                isTargetColumn ? "ring-2 ring-blue-500 bg-blue-500/10 scale-[1.01]" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-3">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {col.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    {colCandidates.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[380px]">
                  {colCandidates.map((cand) => {
                    const isBeingDragged = draggedCandidateId === cand.id;

                    return (
                      <div
                        key={cand.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cand.id)}
                        onClick={() => setActiveCandidateModal(cand)}
                        className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3 cursor-grab active:cursor-grabbing hover:border-blue-500/60 hover:shadow-md transition-all group ${
                          isBeingDragged ? "opacity-40 scale-95 border-dashed border-blue-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[130px]">
                            {cand.role}
                          </span>
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>

                        <div>
                          <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {cand.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{cand.email}</p>
                        </div>

                        {cand.stage === "Applied" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSchedulingCandidate(cand);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-indigo-200/50"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Schedule Interview</span>
                          </button>
                        )}

                        <div
                          className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Move Stage:</span>
                          <select
                            value={cand.stage === "Hired" ? "Accepted" : cand.stage}
                            onChange={(e) => onStatusChange(cand.id, e.target.value)}
                            className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Accepted">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  {colCandidates.length === 0 && (
                    <div className="py-12 text-center border border-dashed border-slate-300/60 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1">
                      <User className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-1" />
                      <p className="text-[11px] font-semibold text-slate-400">No Candidates</p>
                      <p className="text-[9px] text-slate-400">Drop cards here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Interview Modal */}
      {schedulingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSchedulingCandidate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Interview</h3>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Candidate: {schedulingCandidate.name} ({schedulingCandidate.role})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  required
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Time
                </label>
                <input
                  type="time"
                  required
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Round / Type
                </label>
                <select
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Technical Round">Technical Round</option>
                  <option value="System Design">System Design</option>
                  <option value="HR & Culture Fit">HR & Culture Fit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={interviewForm.meetLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetLink: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSchedulingCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
                >
                  Confirm & Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Quick-View Modal */}
      {activeCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setActiveCandidateModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeCandidateModal.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Applied for {activeCandidateModal.role}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <a href={`mailto:${activeCandidateModal.email}`} className="text-xs text-slate-700 dark:text-slate-300 font-medium hover:underline">
                  {activeCandidateModal.email}
                </a>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {activeCandidateModal.phone}
                </span>
              </div>

              {activeCandidateModal.coverLetter && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cover Letter:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeCandidateModal.coverLetter}
                  </p>
                </div>
              )}

              {activeCandidateModal.resumeUrl ? (
                <a
                  href={formatResumeUrl(activeCandidateModal.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-blue-200/50"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Full Resume (PDF)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic text-center">No Resume Attached</p>
              )}
            </div>

            <button
              onClick={() => setActiveCandidateModal(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-WINDOW 2: Upcoming Interviews & Calendar Widget ---
const InterviewsCalendarPanel = ({ interviewsList }) => {
  const [filterDate, setFilterDate] = useState("");

  const filteredInterviews = interviewsList.filter((item) => {
    if (!filterDate) return true;
    return item.date === filterDate;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Scheduled Interviews Calendar</h3>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Calendar Filter:</span>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400">
                {filterDate ? `No interviews scheduled for ${filterDate}.` : "No interviews scheduled yet."}
              </p>
            </div>
          ) : (
            filteredInterviews.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                      {item.type}
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Date: {item.date || "Upcoming"}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Time: {item.time || "TBD"}</span>
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{item.candidate}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={item.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Meeting</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const isEmployer = user?.role === "Employer";

  const [activeWindow, setActiveWindow] = useState("main");
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [schedulingApplicant, setSchedulingApplicant] = useState(null);

  const [interviewsList, setInterviewsList] = useState([]);
  const [jobsData, setJobsData] = useState([]);
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingResponses: 0,
    activeJobs: 0,
    hiredCandidates: 0,
  });
  
  const [loading, setLoading] = useState(isEmployer);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingJobId, setTogglingJobId] = useState(null);

  const isJobActive = (job) => {
    if (job?.status) {
      return job.status.toLowerCase() === "active";
    }
    if (job?.expired !== undefined) {
      return !job.expired;
    }
    return job?.isOpen === true;
  };

  const fetchEmployerData = async () => {
    if (!isEmployer) return;
    try {
      setLoading(true);
      const res = await api.get("/jobs/employer/my-jobs");
      const jobs = res.data?.jobs || res.data || [];
      setJobsData(jobs);

      let totalCount = jobs.length;
      let activeCount = 0;
      let pendingCount = 0;
      let hiredCount = 0;
      const fetchedInterviews = [];

      jobs.forEach((job) => {
        if (isJobActive(job)) {
          activeCount += 1;
        }

        if (Array.isArray(job.applications)) {
          job.applications.forEach((app) => {
            const status = app.status?.toLowerCase();
            
            if (status === "pending" || status === "submitted" || status === "applied") {
              pendingCount += 1;
            } else if (status === "accepted" || status === "hired") {
              hiredCount += 1;
            }

            // Dynamically reconstruct interviews list from saved application records
            if (status === "interviewing" || status === "interview invited" || status === "scheduled" || app.interviewDetails) {
              const appDetails = app.interviewDetails || {};
              const rawDate = app.date || appDetails.date || app.interviewDate;
              const rawTime = app.time || appDetails.time || app.interviewTime;

              fetchedInterviews.push({
                id: app.id || app._id,
                candidate: app.applicantName || app.applicant?.name || app.name || appDetails.candidate || "Candidate",
                role: job.title,
                date: rawDate || "Upcoming",
                time: rawTime || "TBD",
                type: app.type || appDetails.type || "Technical Round",
                meetLink: app.meetLink || appDetails.meetLink || "https://meet.google.com/new",
                status: "Scheduled"
              });
            }
          });
        }
      });

      setInterviewsList(fetchedInterviews);
      setStats({
        totalJobs: totalCount,
        activeJobs: activeCount,
        pendingResponses: pendingCount,
        hiredCandidates: hiredCount,
      });
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load recruitment metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, [isEmployer]);

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      setActionLoading(true);

      let formattedStatus = status.toLowerCase();
      if (formattedStatus === "hired") formattedStatus = "accepted";

      await api.put(`/applications/status/${applicationId}`, { status: formattedStatus });
      await fetchEmployerData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update application status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async (applicationId, interviewDetails) => {
    try {
      setActionLoading(true);

      await api.put(`/applications/status/${applicationId}`, {
        status: "interviewing",
        date: interviewDetails.date,
        time: interviewDetails.time,
        type: interviewDetails.type,
        meetLink: interviewDetails.meetLink,
        interviewDetails,
      });

      await fetchEmployerData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to schedule interview");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleJobStatus = async (jobId, currentlyActive) => {
    try {
      setTogglingJobId(jobId);
      await api.put(`/jobs/status/${jobId}`, {
        status: !currentlyActive ? "Active" : "Inactive",
        isOpen: !currentlyActive,
        expired: currentlyActive,
      });
      await fetchEmployerData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update job status");
    } finally {
      setTogglingJobId(null);
    }
  };

  const openDeleteModal = (jobId) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setActionLoading(true);
      await api.delete(`/jobs/delete/${jobToDelete}`);
      await fetchEmployerData();
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete job");
    } finally {
      setActionLoading(false);
    }
  };

  const getAllApplications = () => {
    let list = [];
    jobsData.forEach((job) => {
      if (Array.isArray(job.applications)) {
        job.applications.forEach((app) => {
          list.push({ 
            ...app, 
            jobTitle: job.title, 
            jobId: job.id || job._id,
            applicantName: app.applicantName || app.applicant?.name || app.name || "Candidate",
            applicantEmail: app.applicantEmail || app.applicant?.email || app.email || "No email attached",
            applicantPhone: app.applicantPhone || app.applicant?.phone || app.phone || "Not provided",
            resumeUrl: app.resumeUrl || app.applicant?.resumeUrl || app.resume || app.applicant?.resume,
            coverLetter: app.coverLetter || app.letter
          });
        });
      }
    });
    return list;
  };

  const getPendingApplications = () => {
    const all = getAllApplications();
    return all.filter((app) => {
      const st = app.status?.toLowerCase();
      return !st || st === "pending" || st === "submitted" || st === "applied";
    });
  };

  const renderSubWindow = () => {
    const allApplications = getAllApplications();
    const pendingApplications = getPendingApplications();

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveWindow("main")}
              className="p-2.5 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize">
                {activeWindow === "jobs" && "Posted Jobs Management"}
                {activeWindow === "pending" && "Pending Application Reviews"}
                {activeWindow === "active" && "Active Job Listings"}
                {activeWindow === "hired" && "Hired & Selected Candidates"}
                {activeWindow === "kanban" && "Interactive Hiring Pipeline"}
                {activeWindow === "interviews" && "Interview Schedules & Calendar"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage, review, and organize records dynamically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            {activeWindow === "jobs" && (
              <Link
                to="/post-job"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Job</span>
              </Link>
            )}
          </div>
        </div>

        {/* 1. POSTED JOBS SUB-WINDOW */}
        {activeWindow === "jobs" && (
          <div className="space-y-4">
            {jobsData.length === 0 ? (
              <div className="p-12 text-center bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-md">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Jobs Posted Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click above to post your first position.</p>
              </div>
            ) : (
              jobsData.map((job) => {
                const jobId = job.id || job._id;
                const activeStatus = isJobActive(job);
                const isToggling = togglingJobId === jobId;

                return (
                  <div
                    key={jobId}
                    className="p-6 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:border-blue-400/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            activeStatus
                              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {activeStatus ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || job.city || "Remote"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.category || "Engineering"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                          {job.applications?.length || 0} Applicants
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleJobStatus(jobId, activeStatus)}
                        disabled={isToggling}
                        title={activeStatus ? "Deactivate Job" : "Activate Job"}
                        className={`p-2.5 rounded-2xl transition-colors disabled:opacity-50 ${
                          activeStatus
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : activeStatus ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        to={`/edit-job/${jobId}`}
                        className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(jobId)}
                        disabled={actionLoading}
                        className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. PENDING APPLICATION REVIEWS SUB-WINDOW */}
        {activeWindow === "pending" && (
          <div className="space-y-4">
            {pendingApplications.length === 0 ? (
              <div className="p-12 text-center bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-md space-y-2">
                <Clock className="w-12 h-12 text-amber-500/60 mx-auto" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Pending Applications</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When job seekers apply to your posted positions, their live application details and resumes will appear here.
                </p>
              </div>
            ) : (
              pendingApplications.map((app) => {
                const appId = app.id || app._id;
                const statusLabel = app.status || "Pending Review";

                return (
                  <div
                    key={appId}
                    className="p-6 bg-white/80 dark:bg-slate-900/80 border border-amber-200/60 dark:border-amber-900/40 rounded-3xl shadow-sm flex flex-col gap-5 hover:border-amber-400/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 px-3 py-1 rounded-full border border-amber-200/50">
                            Applied Role: {app.jobTitle}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                            Status: {statusLabel}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                          {app.applicantName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {app.applicantEmail}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {app.applicantPhone}
                        </span>
                      </div>
                    </div>

                    {app.coverLetter && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cover Letter Summary:</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{app.coverLetter}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {app.resumeUrl ? (
                        <a
                          href={formatResumeUrl(app.resumeUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs transition-all flex items-center gap-2 border border-blue-200/50"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Full Resume (PDF)</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No CV attached</span>
                      )}

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setSchedulingApplicant(app)}
                          className="px-3.5 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200/50 flex items-center gap-1.5 transition-all"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Interview</span>
                        </button>

                        <button
                          onClick={() => handleApplicationStatus(appId, "Accepted")}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept Candidate</span>
                        </button>

                        <button
                          onClick={() => handleApplicationStatus(appId, "Rejected")}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. ACTIVE LISTINGS SUB-WINDOW */}
        {activeWindow === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobsData.filter((j) => isJobActive(j)).length === 0 ? (
              <div className="col-span-2 p-12 text-center bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-md">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Active Jobs</h3>
                <p className="text-xs text-slate-500 mt-1">Create or re-open listings to accept applications.</p>
              </div>
            ) : (
              jobsData
                .filter((j) => isJobActive(j))
                .map((job) => {
                  const jobId = job.id || job._id;
                  const isToggling = togglingJobId === jobId;

                  return (
                    <div
                      key={jobId}
                      className="p-6 bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-3">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Open & Receiving Resumes</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">
                          {job.applications?.length || 0} Total Applicants
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleJobStatus(jobId, true)}
                            disabled={isToggling}
                            className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ToggleRight className="w-3.5 h-3.5" />
                            )}
                            <span>Deactivate</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* 4. HIRED CANDIDATES SUB-WINDOW */}
        {activeWindow === "hired" && (
          <div className="space-y-4">
            {allApplications.filter((a) => ["accepted", "hired"].includes(a.status?.toLowerCase())).length === 0 ? (
              <div className="p-12 text-center bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl backdrop-blur-md">
                <Users className="w-12 h-12 text-sky-500/60 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Hired Candidates Yet</h3>
              </div>
            ) : (
              allApplications
                .filter((a) => ["accepted", "hired"].includes(a.status?.toLowerCase()))
                .map((app) => (
                  <div
                    key={app.id || app._id}
                    className="p-6 bg-white/80 dark:bg-slate-900/80 border border-sky-200/60 dark:border-sky-900/40 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 text-[11px] font-bold mb-2">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Hired for {app.jobTitle}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {app.applicantName}
                      </h3>
                    </div>

                    <button
                      onClick={() => setSelectedCandidate(app)}
                      className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-opacity flex items-center gap-2 shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Contact Candidate</span>
                    </button>
                  </div>
                ))
            )}
          </div>
        )}

        {/* 5. KANBAN PIPELINE SUB-WINDOW */}
        {activeWindow === "kanban" && (
          <HiringPipelinePanel
            jobsData={jobsData}
            onStatusChange={handleApplicationStatus}
            onScheduleInterview={handleScheduleInterview}
          />
        )}

        {/* 6. INTERVIEWS CALENDAR SUB-WINDOW */}
        {activeWindow === "interviews" && (
          <InterviewsCalendarPanel interviewsList={interviewsList} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        {activeWindow !== "main" && isEmployer ? (
          renderSubWindow()
        ) : (
          <>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-md backdrop-blur-xl transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-tight shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Jobnique Workspace</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-300 bg-clip-text text-transparent">
                      {user?.name || "User"}
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {isEmployer
                      ? "Control hiring pipelines, review candidate applications, and track active positions from your 3D interactive control panels."
                      : "Track active applications, discover AI-matched career opportunities, and manage your job search pipeline."}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <NotificationDropdown />
                  {isEmployer ? (
                    <Link
                      to="/post-job"
                      className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all duration-200"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Post New Position</span>
                    </Link>
                  ) : (
                    <Link
                      to="/jobs"
                      className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-95 transition-all duration-200"
                    >
                      <Search className="w-5 h-5" />
                      <span>Explore Open Roles</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Structured 3D Card Grid Section for Employers */}
            {isEmployer && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Recruitment Metrics & Interactive Control Panels</span>
                  </h2>
                </div>

                {loading ? (
                  <div className="p-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center gap-3 text-slate-400 text-xs backdrop-blur-md">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Syncing recruitment pipelines...</span>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{error}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [perspective:1000px]">
                    {/* Card 1: Jobs Posted */}
                    <div
                      onClick={() => setActiveWindow("jobs")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-blue-500/50 hover:-translate-y-2 hover:rotate-1 hover:skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                          Jobs Posted
                        </h3>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Briefcase className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{stats.totalJobs}</span>
                          <ChevronRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Total listings created • Click to manage & edit
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Pending Reviews */}
                    <div
                      onClick={() => setActiveWindow("pending")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-amber-500/50 hover:-translate-y-2 hover:-rotate-1 hover:-skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-600 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                          Pending Reviews
                        </h3>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Clock className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{stats.pendingResponses}</span>
                          <ChevronRight className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Applications awaiting review • Accept or decline
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Active Listings */}
                    <div
                      onClick={() => setActiveWindow("active")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-emerald-500/50 hover:-translate-y-2 hover:rotate-1 hover:skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                          Active Listings
                        </h3>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{stats.activeJobs}</span>
                          <ChevronRight className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Currently open roles • Click to review active positions
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Hired Candidates */}
                    <div
                      onClick={() => setActiveWindow("hired")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-sky-500/50 hover:-translate-y-2 hover:-rotate-1 hover:-skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                          Hired Candidates
                        </h3>
                        <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{stats.hiredCandidates}</span>
                          <ChevronRight className="w-5 h-5 text-sky-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Accepted applicants • Click to view candidate contact info
                        </p>
                      </div>
                    </div>

                    {/* Card 5: Interactive Hiring Pipeline (Kanban) */}
                    <div
                      onClick={() => setActiveWindow("kanban")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-purple-500/50 hover:-translate-y-2 hover:rotate-1 hover:skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                          Hiring Pipeline
                        </h3>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Kanban className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>Kanban View</span>
                          <ChevronRight className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Track candidates through Applied, Interviewing, Hired & Rejected stages
                        </p>
                      </div>
                    </div>

                    {/* Card 6: Upcoming Interviews & Calendar Widget */}
                    <div
                      onClick={() => setActiveWindow("interviews")}
                      className="group cursor-pointer p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-indigo-500/50 hover:-translate-y-2 hover:-rotate-1 hover:-skew-x-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[200px] transform-gpu"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                      <div className="flex items-center justify-between relative z-10" style={{ transform: 'translateZ(20px)' }}>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                          Interview Calendar
                        </h3>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="relative z-10 mt-4" style={{ transform: 'translateZ(30px)' }}>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>Schedule & Meetings</span>
                          <ChevronRight className="w-5 h-5 text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Organize candidate meetings with standard calendar and video links
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {!isEmployer && (
              <div className="grid gap-8 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2 space-y-6">
                  <MyApplicationsPanel />
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-6 shadow-sm backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        AI Job Recommendations
                      </h3>
                    </div>

                    <AIRecommendationsPanel />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal for Scheduling Interviews from Pending Reviews */}
        {schedulingApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setSchedulingApplicant(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Candidate Interview</h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Applicant: {schedulingApplicant.applicantName} ({schedulingApplicant.jobTitle})
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const date = form.date.value;
                  const time = form.time.value;
                  const type = form.type.value;
                  const meetLink = form.meetLink.value;

                  handleScheduleInterview(schedulingApplicant.id || schedulingApplicant._id, {
                    candidate: schedulingApplicant.applicantName,
                    role: schedulingApplicant.jobTitle,
                    date,
                    time,
                    type,
                    meetLink,
                  });
                  setSchedulingApplicant(null);
                }}
                className="space-y-4 pt-2"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Time</label>
                  <input
                    type="time"
                    name="time"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Type</label>
                  <select
                    name="type"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Technical Round">Technical Round</option>
                    <option value="System Design">System Design</option>
                    <option value="HR & Culture Fit">HR & Culture Fit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meeting Link</label>
                  <input
                    type="url"
                    name="meetLink"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSchedulingApplicant(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-2xl">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Candidate Info</h3>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    Hired for {selectedCandidate.jobTitle}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Full Name
                  </span>
                  <p className="text-slate-900 dark:text-white font-semibold text-sm">
                    {selectedCandidate.applicantName}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedCandidate.applicantEmail}`}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-medium text-sm flex items-center gap-1.5"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{selectedCandidate.applicantEmail}</span>
                  </a>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${selectedCandidate.applicantPhone}`}
                    className="text-slate-800 dark:text-slate-200 hover:text-sky-600 font-medium text-sm flex items-center gap-1.5"
                  >
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedCandidate.applicantPhone || "Not provided"}</span>
                  </a>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Resume Document
                  </span>
                  {selectedCandidate.resumeUrl ? (
                    <a
                      href={formatResumeUrl(selectedCandidate.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:underline font-semibold text-sm mt-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Resume (PDF)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 text-xs italic">No resume attached</span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Job Listing?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This action cannot be undone. All associated candidate records will be permanently removed.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setJobToDelete(null);
                  }}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteJob}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;