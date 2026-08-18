import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleLogin } from "../store/slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Briefcase, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  LogIn as LogInIcon,
  ShieldCheck
} from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "Job Seeker" });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await dispatch(googleLogin({ 
      token: credentialResponse.credential, 
      role: form.role 
    }));

    if (googleLogin.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In Failed");
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F3F4F6] flex flex-col justify-center py-6 sm:px-6 lg:px-8 font-sans animate-fadeIn transition-colors duration-300">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-4">
        
        <h1 className="text-[26px] font-bold tracking-tight text-[#111827] dark:text-white mb-1">
          Welcome back
        </h1>
        <p className="text-[14px] text-[#6B7280] dark:text-[#9CA3AF]">
          Sign in to access your dashboard and applications
        </p>
      </div>

      {/* Main Card Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-white dark:bg-[#111827] py-6 px-6 sm:px-8 border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-none transition-colors duration-300">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[14px] flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#EF4444] font-medium leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Interactive Segmented Role Toggle */}
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-1.5">
              I am logging in as
            </label>
            <div className="flex p-1 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[16px]">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "Job Seeker" })}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 rounded-[12px] text-[14px] font-medium transition-all ${
                  form.role === "Job Seeker"
                    ? "bg-white dark:bg-[#111827] text-[#2F80ED] dark:text-[#56CCF2] shadow-[0_2px_10px_rgb(0,0,0,0.04)] font-semibold border border-[#E5E7EB] dark:border-[#374151]"
                    : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Job Seeker</span>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: "Employer" })}
                className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 rounded-[12px] text-[14px] font-medium transition-all ${
                  form.role === "Employer"
                    ? "bg-white dark:bg-[#111827] text-[#2F80ED] dark:text-[#56CCF2] shadow-[0_2px_10px_rgb(0,0,0,0.04)] font-semibold border border-[#E5E7EB] dark:border-[#374151]"
                    : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Employer</span>
              </button>
            </div>
          </div>

          {/* Email / Password Form First */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-[13px] font-semibold text-[#111827] dark:text-white mb-1.5">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-3.5 py-3 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-[15px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-[#111827] dark:text-white">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[13px] font-semibold text-[#2F80ED] dark:text-[#56CCF2] hover:text-[#2563EB] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[14px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] text-[15px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 rounded-md text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F7FAFC] dark:hover:bg-[#374151] transition-all focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-3.5 px-6 rounded-full font-semibold text-[15px] text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:ring-offset-2 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogInIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#1F2937]" />
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="px-3 bg-white dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In Button Second */}
          <div className="flex justify-center mb-4 [&>div]:w-full [&>div>iframe]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="pill"
              width="100%"
            />
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#1F2937]" />
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="px-3 bg-white dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF]">
                New to Jobnique?
              </span>
            </div>
          </div>

          {/* Register Callout */}
          <Link
            to="/register"
            className="w-full py-3 px-6 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:bg-[#EDF5FF] dark:hover:bg-[#374151] hover:border-[#2F80ED]/30 text-[#111827] dark:text-white hover:text-[#2F80ED] dark:hover:text-[#56CCF2] rounded-full text-[14px] font-semibold transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <span>Create a new account</span>
            <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[13px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Encrypted 256-bit secure authentication</span>
        </div>

      </div>
    </div>
  );
};

export default Login;