import React from "react";
import { ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pt-28 pb-16 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Last updated: August 2026</p>
        </div>

        {/* Content Section */}
        <div className="space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Information We Collect</h2>
            <p>
              At Jobnique, we collect essential account details such as your name, email address, resume attachments, and professional history when you register as a JobSeeker or Employer.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. How We Use Your Data</h2>
            <p>
              Your information is utilized solely to facilitate job applications, provide AI-powered role recommendations, and enable direct communication between recruiters and candidates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">3. Data Sharing & Security</h2>
            <p>
              We do not sell user data to third-party advertisers. JobSeeker profile data is shared only with employers when an application is explicitly submitted.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">4. Your Rights</h2>
            <p>
              You reserve full control over your personal information and may request data deletion or update your profile visibility settings directly within your Jobnique account dashboard.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;