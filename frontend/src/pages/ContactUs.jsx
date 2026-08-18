import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pt-28 pb-16 transition-colors flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-10 flex flex-col items-center text-center">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-tight">Contact Jobnique Support Team</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Have questions or need assistance? Our support team is here to help you.
          </p>
        </div>

        {/* Contact Cards Container */}
        <div className="w-full max-w-md mx-auto space-y-4 flex flex-col items-center">
          
          {/* Email Card */}
          <div className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Email Us</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                supportjobnique@gmail.com
              </p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Phone</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                +91 6372316511
              </p>
            </div>
          </div>

          {/* Location Card */}
          <div className="w-full p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Location</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                Bhubaneswar, India
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;