import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/axios";
import { logoutUser } from "../store/slices/authSlice";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.png"; // Import your new logo
import {
  Briefcase,
  PlusCircle,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Calculator,
  Layers,
  Sun,
  Moon
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme() || {};

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [postedJobsCount, setPostedJobsCount] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isEmployer = user?.role?.toLowerCase() === "employer";

  const dashboardPath = isEmployer ? "/employer/dashboard" : "/jobseeker/dashboard";
  const profilePath = isEmployer ? "/employer/profile" : "/jobseeker/profile";

  useEffect(() => {
    if (isAuthenticated && isEmployer && location.pathname !== "/") {
      const fetchJobsCount = async () => {
        try {
          const res = await api.get("/jobs/employer/my-jobs");
          const jobs = res.data?.jobs || res.data || [];
          setPostedJobsCount(jobs.length);
        } catch (err) {
          console.error("Failed to fetch employer jobs count for navbar:", err);
        }
      };

      fetchJobsCount();
    }
  }, [isAuthenticated, isEmployer, location.pathname]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  if (location.pathname === "/") {
    return null;
  }

  const desktopLinkClass = "px-4 py-2 rounded-full text-[15px] font-medium text-[#6B7280] dark:text-slate-300 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-all flex items-center gap-2";

  const isMyJobsActive = location.pathname === "/employer/my-jobs";

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-[80px] flex items-center transition-colors font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">

          {/* Brand Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 group"
          >
            <img 
              src={logo} 
              alt="Jobnique Logo" 
              className="w-10 h-10 object-contain rounded-[14px] group-hover:scale-105 transition-transform" 
            />
            <span className="text-[20px] font-bold tracking-tight text-[#111827] dark:text-white">
              Jobnique<span className="text-[#2F80ED]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {!isEmployer && (
              <>
                <Link to="/jobs" className={desktopLinkClass}>
                  <Briefcase className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Jobs</span>
                </Link>

                <Link to="/salary" className={desktopLinkClass}>
                  <Calculator className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Salary Calculator</span>
                </Link>
              </>
            )}

            {isAuthenticated && isEmployer && (
              <div className="flex items-center gap-1.5 lg:gap-2">
                <Link to="/post-job" className={desktopLinkClass}>
                  <PlusCircle className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Post Job</span>
                </Link>

                <Link
                  to="/employer/my-jobs"
                  className={
                    isMyJobsActive
                      ? "px-4 py-2 rounded-full text-[15px] font-medium bg-[#EDF5FF] dark:bg-slate-800 text-[#2F80ED] dark:text-blue-400 transition-all flex items-center gap-2"
                      : desktopLinkClass
                  }
                  title="View all posted jobs"
                >
                  <Layers className={`w-4 h-4 ${isMyJobsActive ? "text-[#2F80ED] dark:text-blue-400" : "text-[#9CA3AF] dark:text-slate-400"}`} />
                  <span> JobPosted</span>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <>
                <Link to={dashboardPath} className={desktopLinkClass}>
                  <LayoutDashboard className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Dashboard</span>
                </Link>

                <Link to={profilePath} className={desktopLinkClass}>
                  <User className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Profile</span>
                </Link>
              </>
            )}
          </nav>

          {/* Desktop User / Auth Actions */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-all shadow-sm"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 lg:gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#F7FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700">
                  <span className="text-[15px] font-semibold text-[#111827] dark:text-slate-100">
                    Hi, {user?.name}
                  </span>
                  {user?.role && (
                    <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-[10px] bg-[#EDF5FF] dark:bg-slate-700 text-[#2F80ED] dark:text-blue-400 border border-[#2F80ED]/20">
                      {user.role}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full text-[#9CA3AF] dark:text-slate-400 hover:text-[#EF4444] dark:hover:text-red-400 hover:bg-[#EF4444]/10 transition-all focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full text-[15px] font-medium text-[#111827] dark:text-slate-200 bg-[#F7FAFC] dark:bg-slate-800 hover:bg-[#EDF5FF] dark:hover:bg-slate-700 hover:text-[#2F80ED] dark:hover:text-blue-400 border border-[#E5E7EB] dark:border-slate-700 transition-all"
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="px-6 py-2.5 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] active:scale-[0.98] transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-[14px] text-[#6B7280] dark:text-slate-300 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_20px_40px_rgb(0,0,0,0.1)] absolute top-[80px] w-full animate-fadeIn">
          <div className="px-6 pt-6 pb-8 space-y-3">
            {isAuthenticated && (
              <div className="p-4 mb-4 rounded-[18px] bg-[#F7FAFC] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-[#6B7280] dark:text-slate-400 mb-0.5">Logged in as</p>
                  <p className="text-[16px] font-bold text-[#111827] dark:text-white tracking-tight">{user?.name}</p>
                </div>
                {user?.role && (
                  <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-[12px] bg-[#EDF5FF] dark:bg-slate-700 text-[#2F80ED] dark:text-blue-400 border border-[#2F80ED]/20">
                    {user.role}
                  </span>
                )}
              </div>
            )}

            {!isEmployer && (
              <>
                <Link
                  to="/jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <Briefcase className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Browse Jobs</span>
                </Link>

                <Link
                  to="/salary"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <Calculator className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Salary Calculator</span>
                </Link>
              </>
            )}

            {isAuthenticated && isEmployer && (
              <div className="flex flex-col gap-2">
                <Link
                  to="/post-job"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <PlusCircle className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Post a Job</span>
                </Link>

                <Link
                  to="/employer/my-jobs"
                  onClick={closeMenu}
                  className="flex items-center justify-between px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                    <span>My Posted Jobs</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDF5FF] dark:bg-slate-800 text-[#2F80ED] dark:text-blue-400 text-[12px] font-bold">
                    {postedJobsCount}
                  </span>
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to={profilePath}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-[14px] text-[15px] font-medium text-[#111827] dark:text-slate-200 hover:bg-[#EDF5FF] dark:hover:bg-slate-800 hover:text-[#2F80ED] dark:hover:text-blue-400 transition-colors"
                >
                  <User className="w-5 h-5 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Profile</span>
                </Link>

                <div className="pt-4 mt-3 border-t border-[#E5E7EB] dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-semibold text-[#EF4444] bg-[#EF4444]/10 hover:bg-[#EF4444]/20 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-semibold text-[#111827] dark:text-slate-200 bg-[#F7FAFC] dark:bg-slate-800 hover:bg-[#EDF5FF] dark:hover:bg-slate-700 border border-[#E5E7EB] dark:border-slate-700 transition-all"
                >
                  <LogIn className="w-4 h-4 text-[#9CA3AF] dark:text-slate-400" />
                  <span>Log In</span>
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-[15px] font-semibold text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;