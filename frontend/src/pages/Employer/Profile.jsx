import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import { fetchCurrentUser } from "../../store/slices/authSlice";
import {
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  BadgeCheck,
  X,
  Edit
} from "lucide-react";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Local state to guarantee immediate UI updates
  const [localUser, setLocalUser] = useState(user);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    phone: "",
    companyName: "",
    designation: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Sync Redux user state into local display state and form state
  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        companyName: user.companyName || user.company || "",
        designation: user.designation || user.roleTitle || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileErr("");

    const payload = {
      name: form.name,
      phone: form.phone,
      companyName: form.companyName,
      designation: form.designation,
    };

    try {
      // 1. Send update request to backend
      const res = await api.put("/auth/profile", payload);

      // 2. Immediately update local display state with submitted values or backend response
      const updatedData = res.data?.user || res.data?.data || { ...localUser, ...payload };
      setLocalUser(updatedData);

      // 3. Re-fetch Redux current user state
      try {
        await dispatch(fetchCurrentUser()).unwrap();
      } catch (reduxErr) {
        console.warn("Redux sync fallback executed:", reduxErr);
      }

      setProfileMsg(res.data?.message || "Profile details updated successfully");

      // 4. Close modal
      setTimeout(() => {
        setIsEditModalOpen(false);
        setProfileMsg("");
      }, 1000);
    } catch (err) {
      setProfileErr(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const activeUser = localUser || user;
  const isEmployer = activeUser?.role === "Employer";

  return (
    <div className="relative min-h-screen bg-[#F4F7FB] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        {/* Profile Banner */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden transition-colors">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-blue-500/20 shrink-0">
            {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-2">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{activeUser?.role || "Verified Account"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeUser?.name || "Account Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{activeUser?.email}</span>
            </p>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  {isEmployer ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEmployer ? "Employer & Company Details" : "Personal Details"}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Full Name
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {activeUser?.name || "Not provided"}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Phone Number
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                  <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  {activeUser?.phone || "Not provided"}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{activeUser?.email}</span>
                </div>
              </div>

              {/* Employer Specific Fields */}
              {isEmployer && (
                <>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      Company Name
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {activeUser?.companyName || activeUser?.company || "Not provided"}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      Designation
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      {activeUser?.designation || activeUser?.roleTitle || "Not provided"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full mt-6 py-3 px-5 rounded-2xl font-semibold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-100 dark:border-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden relative transition-colors">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Edit Details
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
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
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Employer Specific Form Inputs */}
                {isEmployer && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Company Name
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
                        <input
                          type="text"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          placeholder="Acme Corp"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Designation
                      </label>
                      <div className="relative flex items-center">
                        <Briefcase className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
                        <input
                          type="text"
                          name="designation"
                          value={form.designation}
                          onChange={handleChange}
                          placeholder="Hiring Manager / HR"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-2xl outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Email Address <span className="text-slate-400 dark:text-slate-500">(Read Only)</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      value={activeUser?.email || ""}
                      readOnly
                      disabled
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl outline-none text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={savingProfile}
                className="py-2.5 px-6 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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