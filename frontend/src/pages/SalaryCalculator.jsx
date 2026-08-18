import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  IndianRupee,
  Calculator,
  TrendingUp,
  MapPin,
  Briefcase,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Bot
} from "lucide-react";

const ROLES_DATA = [
  { title: "Frontend Engineer", baseMin: 600000, baseMax: 1800000 },
  { title: "Backend Engineer", baseMin: 700000, baseMax: 2000000 },
  { title: "Full Stack Engineer", baseMin: 800000, baseMax: 2200000 },
  { title: "AI / Machine Learning", baseMin: 1000000, baseMax: 2800000 },
  { title: "DevOps", baseMin: 850000, baseMax: 2100000 },
  { title: "Product Design", baseMin: 550000, baseMax: 1600000 },
  { title: "Data Science", baseMin: 900000, baseMax: 2400000 },
  { title: "Cybersecurity", baseMin: 800000, baseMax: 2200000 },
  { title: "Product Management", baseMin: 1100000, baseMax: 3000000 },
];

const LOCATIONS = [
  { name: "Bengaluru", multiplier: 1.2 },
  { name: "Mumbai", multiplier: 1.15 },
  { name: "Delhi NCR", multiplier: 1.1 },
  { name: "Hyderabad", multiplier: 1.1 },
  { name: "Pune", multiplier: 1.05 },
  { name: "Remote", multiplier: 1.0 },
];

const SalaryCalculator = () => {
  const navigate = useNavigate();

  // Form State
  const [selectedRole, setSelectedRole] = useState(ROLES_DATA[2].title); // Full Stack default
  const [yearsExperience, setYearsExperience] = useState(3);
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[5].name);
  const [equityValuation, setEquityValuation] = useState("Medium");

  // Calculated State
  const [salaryData, setSalaryData] = useState({
    min: 0,
    max: 0,
    median: 0,
    insights: [
      "Remote offers generally align with Tier-1 city market medians.",
      "Specialized AI/ML expertise offers a ~18% compensation premium."
    ],
    isAiGenerated: false
  });
  const [aiLoading, setAiLoading] = useState(false);

  // Calculate local baseline estimate
  const calculateLocalSalary = () => {
    const roleObj = ROLES_DATA.find((r) => r.title === selectedRole) || ROLES_DATA[0];
    const locationObj = LOCATIONS.find((l) => l.name === selectedLocation) || LOCATIONS[5];
    const expMultiplier = 1 + yearsExperience * 0.08;

    const min = Math.round(roleObj.baseMin * expMultiplier * locationObj.multiplier);
    const max = Math.round(roleObj.baseMax * expMultiplier * locationObj.multiplier);
    const median = Math.round((min + max) / 2);

    return { min, max, median };
  };

  // Fetch real-time AI estimations via Groq API
  const fetchAiSalaryInsights = async () => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    // Fallback to offline calculation if API key is not configured
    if (!apiKey) {
      const local = calculateLocalSalary();
      setSalaryData({
        ...local,
        insights: [
          "Live AI rate unavailable. Showing estimated benchmark data.",
          "Equity bonuses add an additional 5-15% variable pay annually."
        ],
        isAiGenerated: false
      });
      return;
    }

    setAiLoading(true);

    try {
      const prompt = `Act as an expert Indian tech compensation analyst. Estimate the realistic annual CTC range (in INR) for a ${selectedRole} with ${yearsExperience} years of experience working ${selectedLocation} with ${equityValuation} equity expectation.
Return strictly a valid JSON object matching this exact format without any markdown or conversational prose:
{
  "minSalary": number,
  "maxSalary": number,
  "medianSalary": number,
  "insight1": "short bullet point insight",
  "insight2": "short bullet point insight"
}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      setSalaryData({
        min: result.minSalary || 0,
        max: result.maxSalary || 0,
        median: result.medianSalary || Math.round((result.minSalary + result.maxSalary) / 2),
        insights: [result.insight1, result.insight2].filter(Boolean),
        isAiGenerated: true
      });
    } catch (err) {
      console.error("Groq API error:", err);
      const local = calculateLocalSalary();
      setSalaryData({
        ...local,
        insights: [
          "Market demand remains strong for verified technical skill sets.",
          "Compensations in tier-1 hubs reflect competitive local market rates."
        ],
        isAiGenerated: false
      });
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAiSalaryInsights();
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedRole, yearsExperience, selectedLocation, equityValuation]);

  const estimatedMonthlyGross = Math.round((salaryData.median || 0) / 12);
  const estimatedNetMonthly = Math.round(estimatedMonthlyGross * 0.80); // ~20% estimated deductions

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F3F4F6] pt-28 pb-24 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[15px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#2F80ED] dark:hover:text-[#56CCF2] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home Page</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF5FF] dark:bg-[#2F80ED]/10 border border-[#2F80ED]/20 text-[#2F80ED] dark:text-[#56CCF2] text-[13px] font-semibold uppercase tracking-wider mb-3">
                <Calculator className="w-4 h-4" />
                <span>Compensation Intelligence</span>
              </div>
              <h1 className="text-[36px] sm:text-[44px] font-bold tracking-tight text-[#111827] dark:text-white">
                Tech Salary Calculator
              </h1>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm p-8 sm:p-10 space-y-8">
            
            <div className="pb-4 border-b border-[#E5E7EB] dark:border-[#1F2937]">
              <h2 className="text-[20px] font-bold text-[#111827] dark:text-white flex items-center gap-2.5">
                <Briefcase className="w-5 h-5 text-[#2F80ED] dark:text-[#56CCF2]" />
                Select Your Criteria
              </h2>
            </div>

            {/* 1. Job Category Selector */}
            <div className="space-y-3">
              <label className="block text-[14px] font-semibold text-[#111827] dark:text-white">
                Engineering Category
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-5 py-3.5 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px] text-[#111827] dark:text-white text-[16px] outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] transition-all cursor-pointer"
              >
                {ROLES_DATA.map((role) => (
                  <option key={role.title} value={role.title}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Experience Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[14px] font-semibold text-[#111827] dark:text-white">
                  Years of Relevant Experience
                </label>
                <span className="text-[15px] font-bold text-[#2F80ED] dark:text-[#56CCF2] bg-[#EDF5FF] dark:bg-[#2F80ED]/20 px-3 py-1 rounded-full border border-[#2F80ED]/20">
                  {yearsExperience} {yearsExperience === 1 ? "Year" : "Years"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full h-2 bg-[#E5E7EB] dark:bg-[#374151] rounded-lg appearance-none cursor-pointer accent-[#2F80ED]"
              />
              <div className="flex justify-between text-[12px] font-semibold text-[#9CA3AF] dark:text-[#6B7280]">
                <span>Fresher (0 yrs)</span>
                <span>Mid-Level (5 yrs)</span>
                <span>Senior (10+ yrs)</span>
              </div>
            </div>

            {/* 3. Location Selector */}
            <div className="space-y-3">
              <label className="block text-[14px] font-semibold text-[#111827] dark:text-white">
                Work Location / Worksite
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-5 h-5 text-[#9CA3AF] absolute left-4 pointer-events-none" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px] text-[#111827] dark:text-white text-[16px] outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED] transition-all cursor-pointer"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Equity Band Toggle */}
            <div className="space-y-3">
              <label className="block text-[14px] font-semibold text-[#111827] dark:text-white">
                Equity / Bonus Expectation
              </label>
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px]">
                {["Low", "Medium", "High"].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setEquityValuation(tier)}
                    className={`py-2.5 rounded-[14px] text-[14px] font-semibold transition-all ${
                      equityValuation === tier
                        ? "bg-white dark:bg-[#111827] text-[#2F80ED] dark:text-[#56CCF2] shadow-sm border border-[#E5E7EB] dark:border-[#374151]"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white"
                    }`}
                  >
                    {tier} Tier
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Output Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2]" />

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E7EB] dark:border-[#1F2937]">
                <span className="text-[14px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2F80ED] dark:text-[#56CCF2]" />
                  Estimated Annual Base
                </span>
                {salaryData.isAiGenerated ? (
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[12px] font-bold rounded-full flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> Groq AI Model
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] text-[12px] font-bold rounded-full">
                    Benchmark Data
                  </span>
                )}
              </div>

              {/* Big Salary Numbers */}
              <div className="mb-6 min-h-[85px] flex flex-col justify-center">
                {aiLoading ? (
                  <div className="flex items-center gap-3 text-[#2F80ED] py-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm font-semibold">Calculating live AI estimations...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] dark:text-white tracking-tight leading-none flex items-center">
                      ₹{salaryData.median.toLocaleString("en-IN")}
                      <span className="text-[16px] font-medium text-[#6B7280] dark:text-[#9CA3AF] ml-1">/ year</span>
                    </div>
                    <p className="text-[14px] text-[#6B7280] dark:text-[#9CA3AF] mt-2 font-medium">
                      Expected Range: <span className="font-semibold text-[#111827] dark:text-white">₹{salaryData.min.toLocaleString("en-IN")}</span> – <span className="font-semibold text-[#111827] dark:text-white">₹{salaryData.max.toLocaleString("en-IN")}</span>
                    </p>
                  </>
                )}
              </div>

              {/* Monthly Breakdown Boxes */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-[18px] mb-6">
                <div>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF] font-semibold uppercase">Gross Monthly</p>
                  <p className="text-[17px] font-bold text-[#111827] dark:text-white mt-0.5">₹{estimatedMonthlyGross.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[12px] text-[#22C55E] font-semibold uppercase">Est. Take-Home</p>
                  <p className="text-[17px] font-bold text-[#22C55E] mt-0.5">₹{estimatedNetMonthly.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Find Jobs Button */}
              <Link
                to={`/jobs?search=${encodeURIComponent(selectedRole)}&minSalary=${salaryData.min}&maxSalary=${salaryData.max}&category=${encodeURIComponent(selectedRole)}&city=${encodeURIComponent(selectedLocation)}`}
                className="w-full py-3.5 bg-gradient-to-r from-[#2F80ED] to-[#2563EB] text-white hover:opacity-95 rounded-full text-[15px] font-semibold transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
              >
                <span>Find {selectedRole} Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Compensation Insights Card */}
            <div className="bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm p-6 space-y-4">
              <h3 className="text-[16px] font-bold text-[#111827] dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#2F80ED] dark:text-[#56CCF2]" />
                Market Insights
              </h3>
              
              <ul className="space-y-3 text-[14px] text-[#6B7280] dark:text-[#9CA3AF]">
                {salaryData.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SalaryCalculator;