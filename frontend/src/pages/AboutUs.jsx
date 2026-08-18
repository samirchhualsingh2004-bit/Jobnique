import React from "react";
import { Sparkles, Users, Target, Award, ShieldCheck } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pt-28 pb-16 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Empowering Global Careers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About Jobnique
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Jobnique connects top-tier job seekers with innovative companies using modern, intelligent matching workflows.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Our Mission</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              To eliminate friction in modern hiring by surfacing verified roles matched precisely to candidate strengths.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Candidate Centric</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We empower JobSeekers with transparent salary benchmarks, instant feedback tools, and AI interview prep resources.
            </p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Verified Hiring</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every job posting on Jobnique undergoes verification to ensure genuine opportunities and safe recruiting.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutUs;