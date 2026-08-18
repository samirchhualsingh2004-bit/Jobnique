import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { fetchCurrentUser, toggleSaveJob } from "../../store/slices/authSlice";
import {
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BadgeCheck,
  Save,
  X,
  Edit,
  Bookmark,
  Building2,
  Briefcase,
  MapPin,
  ArrowUpRight
} from "lucide-react";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isEmployer = user?.role === "Employer";

  // Safely parse savedJobs whether it is an Array or JSON String
  const getParsedSavedJobs = () => {
    if (!user?.savedJobs) return [];
    if (Array.isArray(user.savedJobs)) return user.savedJobs;
    if (typeof user.savedJobs === "string") {
      try {
        const parsed = JSON.parse(user.savedJobs);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const savedJobsList = getParsedSavedJobs();

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Unsave Debounce State
  const [unsavingId, setUnsavingId] = useState(null);

  // Form States
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
    designation: user?.designation || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
        designation: user.designation || "",
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileErr("");
    try {
      await api.put("/auth/profile", form);
      await dispatch(fetchCurrentUser());
      setProfileMsg("Profile details updated successfully");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg("");
      }, 1200);
    } catch (err) {
      setProfileErr(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Safely handles unsaving to prevent double-firing requests
  const handleUnsaveJob = async (e, jobId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (unsavingId === jobId) return;

    setUnsavingId(jobId);
    try {
      await dispatch(toggleSaveJob(jobId)).unwrap();
    } catch (err) {
      console.error("Failed to remove saved job:", err);
    } finally {
      setUnsavingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F3F4F6] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        
        {/* Profile Banner */}
        <div className="p-6 sm:p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-3xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden transition-colors duration-300">
          <div className="w-20 h-20 rounded-2xl bg-[#2F80ED] text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-[#2F80ED]/20 shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF5FF] dark:bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED] dark:text-[#56CCF2] text-xs font-semibold mb-2">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>{user?.role || "Verified Account"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
              {user?.name || "Account Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>{user?.email}</span>
            </p>
          </div>

          {!isEmployer && (
            <div className="flex items-center gap-3">
              <div className="px-5 py-3 bg-[#EDF5FF] dark:bg-[#1F2937] border border-[#2F80ED]/20 dark:border-[#374151] rounded-2xl text-center">
                <span className="block text-[11px] font-semibold text-[#2F80ED] dark:text-[#56CCF2] uppercase tracking-wider">Bookmarked</span>
                <span className="text-lg font-bold text-[#111827] dark:text-white">{savedJobsList.length} Jobs</span>
              </div>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 gap-8">
          <div className="p-6 sm:p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-3xl shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#EDF5FF] dark:bg-[#1F2937] text-[#2F80ED] dark:text-[#56CCF2]">
                    {isEmployer ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <h2 className="text-lg font-bold text-[#111827] dark:text-white">
                    {isEmployer ? "Employer & Company Details" : "Personal Details"}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#F7FAFC] dark:bg-[#1F2937] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#374151]">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">Full Name</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white">
                    <User className="w-4 h-4 text-[#9CA3AF]" />
                    {user?.name || "Not provided"}
                  </div>
                </div>

                <div className="bg-[#F7FAFC] dark:bg-[#1F2937] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#374151]">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">Phone Number</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    {user?.phone || "Not provided"}
                  </div>
                </div>

                <div className="bg-[#F7FAFC] dark:bg-[#1F2937] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#374151]">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">Email Address</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white truncate">
                    <Mail className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>

                {/* Employer Specific Display Fields */}
                {isEmployer && (
                  <>
                    <div className="bg-[#F7FAFC] dark:bg-[#1F2937] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#374151]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">Company Name</span>
                      <div className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white">
                        <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                        {user?.companyName || "Not provided"}
                      </div>
                    </div>

                    <div className="bg-[#F7FAFC] dark:bg-[#1F2937] p-4 rounded-2xl border border-[#E5E7EB] dark:border-[#374151]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1">Designation</span>
                      <div className="flex items-center gap-2 text-sm font-medium text-[#111827] dark:text-white">
                        <Briefcase className="w-4 h-4 text-[#9CA3AF]" />
                        {user?.designation || "Not provided"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full mt-6 py-3 px-5 rounded-2xl font-semibold text-xs text-[#2F80ED] dark:text-[#56CCF2] bg-[#EDF5FF] dark:bg-[#1F2937] hover:bg-[#2F80ED]/10 dark:hover:bg-[#374151] border border-[#2F80ED]/20 dark:border-[#374151] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* SAVED JOBS SECTION (Job Seekers Only) */}
        {!isEmployer && (
          <div className="p-6 sm:p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-3xl shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-[#EDF5FF] dark:bg-[#1F2937] text-[#2F80ED] dark:text-[#56CCF2]">
                <Bookmark className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827] dark:text-white">Saved Job Openings</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Quickly access positions you bookmarked to complete applications later
                </p>
              </div>
            </div>

            {savedJobsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobsList.map((job) => {
                  if (!job) return null;
                  const jobId = typeof job === "object" ? (job.id || job._id) : job;

                  return (
                    <div
                      key={jobId}
                      className="p-5 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-2xl flex flex-col justify-between hover:border-[#2F80ED]/50 transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#2F80ED] dark:text-[#56CCF2] tracking-wider">
                                {job.category || "General"}
                              </span>
                              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                                {job.employer?.name || "Verified Employer"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleUnsaveJob(e, jobId)}
                            disabled={unsavingId === jobId}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-900/80 transition-all disabled:opacity-50"
                            title="Remove from Saved"
                          >
                            {unsavingId === jobId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        </div>

                        <h3 className="text-sm font-bold text-[#111827] dark:text-white mb-1 group-hover:text-[#2F80ED] dark:group-hover:text-[#56CCF2] transition-colors">
                          {job.title || "Saved Job Position"}
                        </h3>

                        <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            {job.city && job.country ? `${job.city}, ${job.country}` : "Remote"}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/jobs/${jobId}`}
                        className="w-full py-2 bg-white dark:bg-[#111827] hover:bg-[#2F80ED] dark:hover:bg-[#2F80ED] border border-[#E5E7EB] dark:border-[#374151] hover:border-[#2F80ED] text-[#111827] dark:text-white hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>View & Apply</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[#E5E7EB] dark:border-[#374151] rounded-2xl bg-[#F7FAFC] dark:bg-[#1F2937] text-center">
                <Bookmark className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#111827] dark:text-white">No saved positions yet</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-sm mx-auto">
                  Click the bookmark icon on any position in the open listings tab to save it here for later evaluation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-3xl shadow-xl overflow-hidden relative transition-colors duration-300">
            <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#1F2937] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#2F80ED] dark:text-[#56CCF2]" />
                Edit Profile
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F7FAFC] dark:hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {profileMsg && (
                <div className="p-3.5 mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">{profileMsg}</p>
                </div>
              )}

              {profileErr && (
                <div className="p-3.5 mb-5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">{profileErr}</p>
                </div>
              )}

              <form id="profile-form" onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] rounded-2xl outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-11 pr-4 py-3 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] rounded-2xl outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Employer Specific Form Inputs */}
                {isEmployer && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                        Company Name
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                        <input
                          type="text"
                          value={form.companyName}
                          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                          placeholder="Acme Corp"
                          className="w-full pl-11 pr-4 py-3 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                        Designation
                      </label>
                      <div className="relative flex items-center">
                        <Briefcase className="w-4 h-4 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                        <input
                          type="text"
                          value={form.designation}
                          onChange={(e) => setForm({ ...form, designation: e.target.value })}
                          placeholder="Hiring Manager / HR"
                          className="w-full pl-11 pr-4 py-3 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
                    Email Address <span className="text-[#9CA3AF]">(Read Only)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-[#E5E7EB] dark:bg-[#374151]/50 border border-[#E5E7EB] dark:border-[#374151] text-[#9CA3AF] rounded-2xl outline-none text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-[#F7FAFC] dark:bg-[#1F2937] border-t border-[#E5E7EB] dark:border-[#374151] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#374151] hover:bg-[#F7FAFC] dark:hover:bg-[#1F2937] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={savingProfile}
                className="py-2.5 px-6 rounded-xl font-semibold text-xs text-white bg-[#2F80ED] hover:bg-[#2563EB] shadow-md shadow-[#2F80ED]/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;