import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Asset Import (Imports logo1.png directly from src/assets)
import logoImage from "./assets/logo1.png";

// Navigation & Widgets
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AIChatWidget from "./components/AIChatWidget";
import WelcomeIntro from "./components/WelcomeIntro";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobDetails from "./pages/JobDetails";
import SalaryCalculator from "./pages/SalaryCalculator";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword"; // 👈 ADDED IMPORT
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Employer Pages
import PostJob from "./pages/Employer/PostJob";
import EditJob from "./pages/Employer/EditJob";
import EmployerDashboard from "./pages/Employer/Dashboard";
import EmployerProfile from "./pages/Employer/Profile";
import MyPostedJobs from "./pages/Employer/MyPostedJobs";

// Job Seeker Pages
import JobSeekerDashboard from "./pages/JobSeeker/Dashboard";
import JobSeekerProfile from "./pages/JobSeeker/Profile";
import Jobs from "./pages/JobSeeker/Jobs";

// Redux & Icons
import { fetchCurrentUser } from "./store/slices/authSlice";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";


// =============================================================================
// HELPER ROUTE COMPONENTS
// =============================================================================
const DashboardRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "Employer") {
    return <Navigate to="/employer/dashboard" replace />;
  }
  return <Navigate to="/jobseeker/dashboard" replace />;
};

const ProfileRedirect = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "Employer") {
    return <EmployerProfile />;
  }
  return <JobSeekerProfile />;
};

const JobSeekerOnlyRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === "Employer") {
    return <Navigate to="/employer/dashboard" replace />;
  }
  return children;
};

// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isInitializing } = useSelector((state) => state.auth);

  const [showVideo, setShowVideo] = useState(() => {
    return localStorage.getItem("jobnique_has_seen_intro") !== "true";
  });

  // Inject logo1.png asset URL into the browser tab icon
  useEffect(() => {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = logoImage;
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const handleVideoFinish = () => {
    localStorage.setItem("jobnique_has_seen_intro", "true");
    setShowVideo(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
        <div className="p-4 rounded-2xl bg-[#EDF5FF] dark:bg-[#1F2937] text-[#2F80ED] dark:text-[#56CCF2] mb-3">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
          Restoring your session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F3F4F6] selection:bg-[#56CCF2]/30 selection:text-[#111827] dark:selection:text-[#F3F4F6] flex flex-col relative overflow-x-hidden font-sans transition-colors duration-300">

      {showVideo && (
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <WelcomeIntro onFinish={handleVideoFinish} />
        </div>
      )}

      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* 👈 ADDED ROUTE */}

          {/* Company & Support Pages */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route
            path="/jobs"
            element={
              <JobSeekerOnlyRoute>
                <Jobs />
              </JobSeekerOnlyRoute>
            }
          />
          <Route path="/jobs/:id" element={<JobDetails />} />

          <Route
            path="/salary"
            element={
              <JobSeekerOnlyRoute>
                <SalaryCalculator />
              </JobSeekerOnlyRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* EMPLOYER ROUTES */}
          <Route
            path="/post-job"
            element={
              <ProtectedRoute role="Employer">
                <PostJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              <ProtectedRoute role="Employer">
                <EditJob />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute role="Employer">
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute role="Employer">
                <EmployerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/my-jobs"
            element={
              <ProtectedRoute role="Employer">
                <MyPostedJobs />
              </ProtectedRoute>
            }
          />

          {/* JOB SEEKER ROUTES */}
          <Route
            path="/jobseeker/dashboard"
            element={
              <ProtectedRoute role="Job Seeker">
                <JobSeekerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobseeker/profile"
            element={
              <ProtectedRoute role="Job Seeker">
                <JobSeekerProfile />
              </ProtectedRoute>
            }
          />

          {/* GENERIC PROFILE ROUTE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileRedirect />
              </ProtectedRoute>
            }
          />

          {/* 404 FALLBACK */}
          <Route
            path="*"
            element={
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
                <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] p-10 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex flex-col items-center transition-colors duration-300">
                  <div className="w-16 h-16 rounded-[16px] bg-[#EDF5FF] dark:bg-[#1F2937] text-[#2F80ED] dark:text-[#56CCF2] flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8" strokeWidth={2} />
                  </div>
                  <h1 className="text-[24px] font-bold text-[#111827] dark:text-white tracking-tight mb-3">
                    404 - Page Not Found
                  </h1>
                  <p className="text-[16px] text-[#6B7280] dark:text-[#9CA3AF] mb-8 leading-relaxed">
                    The requested route does not exist or has been moved within the Jobnique platform.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-[16px] text-white bg-[#2F80ED] hover:bg-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <AIChatWidget />
    </div>
  );
}