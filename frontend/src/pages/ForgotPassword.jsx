import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  Sparkles,
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound
} from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/forgot-password", { email });

      setSuccessMessage(
        res.data?.message || "Password reset link has been sent to your email address."
      );
      setEmail("");
    } catch (err) {
      console.error("Forgot Password Error:", err);
      
      // 👇 Fixed this block so it shows the backend's "User Not Found" message!
      setError(
        err.response?.data?.message ||
        "Failed to send reset email. Please check your email address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F9FAFB] flex flex-col justify-center py-16 sm:px-6 lg:px-8 font-sans animate-fadeIn transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-[16px] bg-[#2F80ED] flex items-center justify-center shadow-[0_4px_14px_rgba(47,128,237,0.3)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-[24px] font-bold tracking-tight text-[#111827] dark:text-white">
            Jobnique<span className="text-[#2F80ED]">.</span>
          </span>
        </Link>
        <h1 className="text-[32px] font-bold tracking-tight text-[#111827] dark:text-white mb-2">
          Forgot Password?
        </h1>
        <p className="text-[16px] text-[#6B7280] dark:text-[#9CA3AF]">
          Enter your email and we'll send you a link to reset your password
        </p>
      </div>

      {/* Main Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[460px]">
        <div className="bg-white dark:bg-[#111827] py-10 px-6 sm:px-10 border border-[#E5E7EB] dark:border-[#1F2937] rounded-[28px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-colors duration-200">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[16px] flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[14px] text-[#EF4444] font-medium leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-[16px] flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
              <p className="text-[14px] text-[#22C55E] font-medium leading-relaxed">
                {successMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[14px] font-semibold text-[#111827] dark:text-[#F3F4F6] mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 text-[#9CA3AF] dark:text-[#6B7280] absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] text-[#111827] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#6B7280] text-[16px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 rounded-full font-semibold text-[16px] text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:ring-offset-2 dark:focus:ring-offset-[#111827] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <KeyRound className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB] dark:border-[#1F2937]" />
            </div>
            <div className="relative flex justify-center text-[14px]">
              <span className="px-4 bg-white dark:bg-[#111827] text-[#6B7280] dark:text-[#9CA3AF] transition-colors duration-200">
                Remember your password?
              </span>
            </div>
          </div>

          {/* Back to Login Link */}
          <Link
            to="/login"
            className="w-full py-3.5 px-6 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] hover:bg-[#EDF5FF] dark:hover:bg-[#2563EB]/10 hover:border-[#2F80ED]/30 text-[#111827] dark:text-white hover:text-[#2F80ED] dark:hover:text-[#2F80ED] rounded-full text-[15px] font-semibold transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#2F80ED] group-hover:-translate-x-1 transition-all" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 mt-8 text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Encrypted 256-bit secure reset protocol</span>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;