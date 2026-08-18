import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import logoImage from "../assets/logo1.png"; 
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Check, X } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Live validation checks
  const isLengthValid = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isLengthValid || !hasNumber) {
      return setError("Please meet all password requirement criteria.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });

      setSuccessMessage(res.data?.message || "Password has been reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans animate-fadeIn transition-colors duration-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3 mb-6 justify-center">
          <img 
            src={logoImage} 
            alt="Jobnique Logo" 
            className="w-12 h-12 object-contain rounded-[16px] shadow-[0_4px_14px_rgba(47,128,237,0.2)]" 
          />
          <span className="text-[26px] font-bold tracking-tight text-[#111827] dark:text-white">
            Jobnique<span className="text-[#2F80ED]">.</span>
          </span>
        </div>
        <h1 className="text-[32px] font-bold tracking-tight mb-2">Create New Password</h1>
        <p className="text-[16px] text-[#6B7280] dark:text-[#9CA3AF]">
          Enter your new credentials below to secure your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-[#111827] py-10 px-6 sm:px-10 border border-[#E5E7EB] dark:border-[#1F2937] rounded-[28px] shadow-[0_10px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] transition-colors duration-200">
          
          {error && (
            <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-[16px] flex items-start gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              <p className="text-[14px] text-[#EF4444] font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-[16px] flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="text-[14px] text-[#22C55E] font-medium">{successMessage}</p>
                <p className="text-[12px] text-[#22C55E] mt-1">Redirecting to sign in...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* New Password Field */}
            <div>
              <label className="block text-[14px] font-semibold mb-2 text-[#111827] dark:text-[#F3F4F6]">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] text-[#111827] dark:text-white text-[16px] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Real-time Password Strength Criteria List */}
            {password && (
              <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#1F2937]/50 rounded-[14px] border border-[#E2E8F0] dark:border-[#374151] space-y-2 text-[13px] animate-fadeIn">
                <p className="font-semibold text-[#475569] dark:text-[#9CA3AF]">Password Requirements:</p>
                <div className="grid grid-cols-1 gap-1.5">
                  <div className={`flex items-center gap-2 ${isLengthValid ? "text-[#22C55E]" : "text-[#9CA3AF]"}`}>
                    {isLengthValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>At least 6 characters long</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasNumber ? "text-[#22C55E]" : "text-[#9CA3AF]"}`}>
                    {hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>Contains at least one number</span>
                  </div>
                  <div className={`flex items-center gap-2 ${hasUpper ? "text-[#22C55E]" : "text-[#9CA3AF]"}`}>
                    {hasUpper ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    <span>Contains at least one uppercase letter</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label className="block text-[14px] font-semibold mb-2 text-[#111827] dark:text-[#F3F4F6]">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-[#1F2937] border rounded-[18px] focus:outline-none focus:ring-2 text-[#111827] dark:text-white text-[16px] transition-all ${
                    confirmPassword && !passwordsMatch 
                      ? "border-[#EF4444] focus:ring-[#EF4444]/40" 
                      : "border-[#E5E7EB] dark:border-[#374151] focus:ring-[#2F80ED]/40 focus:border-[#2F80ED]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`mt-1.5 text-[12px] font-medium ${passwordsMatch ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "✕ Passwords do not match"}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || successMessage}
              className="w-full mt-4 py-4 px-6 rounded-full font-semibold text-[16px] text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Updating Password...</>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 mt-6 text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Secured with token-based 256-bit encryption</span>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;