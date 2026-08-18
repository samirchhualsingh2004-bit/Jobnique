import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../assets/logo.png"; // Import your custom logo
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp,
  BrainCircuit,
  Building2,
  Zap,
  MapPin,
  DollarSign,
  ArrowUpRight,
  Menu,
  X,
  ChevronRight,
  Calculator,
  LayoutDashboard,
  Sun,
  Moon,
  Globe
} from "lucide-react";

const POPULAR_TAGS = [
  "Frontend", "Backend", "AI / Machine Learning", "DevOps", "Product Design", "Data Science"
];

const FEATURED_JOBS_PREVIEW = [
  {
    id: 1,
    title: "Senior AI Systems Engineer",
    company: "NeuralTech Labs",
    location: "San Francisco, CA (Hybrid)",
    salary: "$160k - $210k",
    type: "Full-time",
    tags: ["Python", "PyTorch", "Kubernetes"],
    match: "98% Match"
  },
  {
    id: 2,
    title: "Lead Frontend Architect",
    company: "Vanguard Cloud",
    location: "Remote",
    salary: "$140k - $180k",
    type: "Full-time",
    tags: ["React", "TypeScript", "Tailwind"],
    match: "95% Match"
  },
  {
    id: 3,
    title: "Principal Product Designer",
    company: "Aetheria Studios",
    location: "New York, NY (Onsite)",
    salary: "$150k - $190k",
    type: "Full-time",
    tags: ["Figma", "Design Systems", "UI/UX"],
    match: "92% Match"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Dynamic Dashboard route based on user role
  const dashboardPath = user?.role === "Employer" ? "/employer/dashboard" : "/jobseeker/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/jobs");
    }
  };

  // Helper handler for protected links in footer
  const handleProtectedLink = (e, targetPath) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: targetPath } });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F17] text-[#111827] dark:text-[#F3F4F6] selection:bg-[#56CCF2]/30 selection:text-[#111827] dark:selection:text-[#F3F4F6] overflow-x-hidden font-sans transition-colors duration-300 flex flex-col justify-between">
      
      <div>
        {/* NAVBAR */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1F2937] shadow-sm h-[80px]"
              : "bg-transparent h-[80px]"
          } flex items-center`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
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
            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
              <Link to="/jobs" className="hover:text-[#2F80ED] dark:hover:text-[#56CCF2] transition-colors">
                Find Jobs
              </Link>
              <Link to="/salary" className="hover:text-[#2F80ED] dark:hover:text-[#56CCF2] transition-colors flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-[#9CA3AF]" />
                <span>Salary Calculator</span>
              </Link>
            </nav>

            {/* Right Actions & Theme Toggle */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#2F80ED] dark:hover:text-[#56CCF2] transition-all"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] shadow-sm">
                    <span className="text-[15px] font-semibold text-[#111827] dark:text-white">
                      Hi, {user?.name}
                    </span>
                    {user?.role && (
                      <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-[10px] bg-[#EDF5FF] dark:bg-[#2F80ED]/20 text-[#2F80ED] dark:text-[#56CCF2] border border-[#2F80ED]/20">
                        {user.role}
                      </span>
                    )}
                  </div>

                  <Link
                    to={dashboardPath}
                    className="px-6 py-2.5 text-[15px] font-semibold text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] rounded-full shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-[15px] font-medium text-[#111827] dark:text-white bg-white dark:bg-[#1F2937] hover:bg-[#EDF5FF] dark:hover:bg-[#374151] border border-[#E5E7EB] dark:border-[#374151] rounded-full transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 text-[15px] font-semibold text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] rounded-full shadow-[0_4px_14px_0_rgba(47,128,237,0.39)] hover:shadow-[0_6px_20px_rgba(47,128,237,0.23)] hover:-translate-y-0.5 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu & Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF]"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-[14px] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#EDF5FF] dark:hover:bg-[#1F2937] transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-[#111827] border-b border-[#E5E7EB] dark:border-[#1F2937] px-6 pt-6 pb-8 space-y-4 absolute top-[80px] left-0 right-0 shadow-lg">
              <nav className="flex flex-col space-y-2 text-[15px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                <Link
                  to="/jobs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#EDF5FF] dark:hover:bg-[#1F2937] hover:text-[#2F80ED]"
                >
                  <span>Find Jobs</span>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </Link>
                <Link
                  to="/salary"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-[12px] hover:bg-[#EDF5FF] dark:hover:bg-[#1F2937] hover:text-[#2F80ED]"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#9CA3AF]" />
                    <span>Salary Calculator</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                </Link>
              </nav>

              <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2937] flex flex-col gap-3">
                {isAuthenticated ? (
                  <Link
                    to={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-[15px] font-semibold text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] rounded-full flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center text-[15px] font-medium text-[#111827] dark:text-white bg-[#F7FAFC] dark:bg-[#1F2937] rounded-full border border-[#E5E7EB] dark:border-[#374151]"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center text-[15px] font-semibold text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] rounded-full"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </header>

        {/* HERO SECTION */}
        <section className="relative z-10 pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-[44px] sm:text-[60px] lg:text-[70px] font-extrabold tracking-tight text-[#111827] dark:text-white leading-[1.1] mb-6">
            Find your next career breakthrough with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F80ED] to-[#56CCF2]">
              Jobnique
            </span>
          </h1>

          <p className="max-w-2xl text-[16px] sm:text-[18px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed mb-10">
            Eliminate noise and endless application queues. Jobnique leverages intelligent semantic parsing to connect top talent with verified global teams instantly.
          </p>

          <div className="w-full max-w-3xl mb-8">
            <form 
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-full shadow-lg transition-all"
            >
              <div className="flex items-center flex-1 w-full px-6 py-2 sm:py-0">
                <Search className="w-5 h-5 text-[#9CA3AF] mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Job title, keywords, or technology stack..."
                  className="w-full bg-transparent text-[#111827] dark:text-white placeholder-[#9CA3AF] outline-none text-[16px] h-12"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-4 rounded-full font-semibold text-[16px] text-white bg-gradient-to-r from-[#2F80ED] to-[#2563EB] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Search Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 text-[14px]">
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium mr-1">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                  className="px-4 py-2 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#2F80ED] dark:hover:text-[#56CCF2] rounded-full transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-[15px] text-[#6B7280] dark:text-[#9CA3AF] font-medium pt-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              <span>Automated Resume Scoring</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2F80ED]" />
              <span>Verified Tech Employers</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#56CCF2]" />
              <span>Real-time Market Salaries</span>
            </div>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] dark:divide-[#1F2937]">
            <div className="p-8 text-center">
              <p className="text-[36px] sm:text-[42px] font-bold text-[#111827] dark:text-white tracking-tight">12k+</p>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Active Positions</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-[36px] sm:text-[42px] font-bold text-[#111827] dark:text-white tracking-tight">3.2x</p>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Interview Rate</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-[36px] sm:text-[42px] font-bold text-[#111827] dark:text-white tracking-tight">1.8k+</p>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Global Companies</p>
            </div>
            <div className="p-8 text-center">
              <p className="text-[36px] sm:text-[42px] font-bold text-[#111827] dark:text-white tracking-tight">&lt;48h</p>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">Avg. Response Time</p>
            </div>
          </div>
        </section>

        {/* FEATURED JOBS SECTION */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#2F80ED] dark:text-[#56CCF2] mb-2">Curated Opportunities</h2>
              <p className="text-[32px] sm:text-[36px] font-bold text-[#111827] dark:text-white tracking-tight">Featured High-Match Positions</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-[16px] font-medium text-[#2F80ED] dark:text-[#56CCF2] hover:underline transition-colors group"
            >
              <span>Explore all listings</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_JOBS_PREVIEW.map((job) => (
              <div
                key={job.id}
                className="p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm hover:border-[#2F80ED]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded-full text-[13px] font-semibold">
                      {job.match}
                    </span>
                    <span className="text-[14px] font-medium text-[#6B7280] dark:text-[#9CA3AF]">{job.type}</span>
                  </div>
                  <h3 className="text-[20px] font-bold text-[#111827] dark:text-white group-hover:text-[#2F80ED] dark:group-hover:text-[#56CCF2] transition-colors mb-1 tracking-tight">
                    {job.title}
                  </h3>
                  <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] mb-6">{job.company}</p>

                  <div className="space-y-3 mb-6 text-[15px] text-[#6B7280] dark:text-[#9CA3AF]">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-[#9CA3AF]" />
                      <span>{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mb-8">
                    {job.tags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-[#F7FAFC] dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] text-[#6B7280] dark:text-[#9CA3AF] text-[13px] font-medium rounded-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/jobs"
                  className="w-full py-3.5 bg-[#EDF5FF] dark:bg-[#1F2937] hover:bg-[#2F80ED] text-[#2F80ED] dark:text-[#56CCF2] hover:text-white dark:hover:text-white rounded-[16px] text-[15px] font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>View Listing</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* WORKFLOW CARDS SECTION */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-t border-[#E5E7EB] dark:border-[#1F2937]">
          <div className="text-center mb-16">
            <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#2F80ED] dark:text-[#56CCF2] mb-2">The Jobnique Advantage</h2>
            <p className="text-[32px] sm:text-[36px] font-bold text-[#111827] dark:text-white tracking-tight">Engineered for modern candidates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm flex flex-col items-center text-center group hover:border-[#2F80ED]/30 transition-all">
              <div className="w-16 h-16 bg-[#EDF5FF] dark:bg-[#1F2937] rounded-[20px] flex items-center justify-center text-[#2F80ED] dark:text-[#56CCF2] mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] font-bold text-[#111827] dark:text-white mb-3 tracking-tight">Smart Semantic Matching</h3>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Our neural models parse experience vectors rather than exact keyword matches, revealing opportunities that align with true capabilities.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm flex flex-col items-center text-center group hover:border-[#2F80ED]/30 transition-all">
              <div className="w-16 h-16 bg-[#EDF5FF] dark:bg-[#1F2937] rounded-[20px] flex items-center justify-center text-[#2F80ED] dark:text-[#56CCF2] mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] font-bold text-[#111827] dark:text-white mb-3 tracking-tight">Automated Cover Notes</h3>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Generate job-tailored summary points with one click, highlighting exact skill overlaps that catch hiring managers' attention.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[24px] shadow-sm flex flex-col items-center text-center group hover:border-[#2F80ED]/30 transition-all">
              <div className="w-16 h-16 bg-[#EDF5FF] dark:bg-[#1F2937] rounded-[20px] flex items-center justify-center text-[#2F80ED] dark:text-[#56CCF2] mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-[20px] font-bold text-[#111827] dark:text-white mb-3 tracking-tight">Verified Compensation</h3>
              <p className="text-[15px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                No guesswork. View transparent salary bands, equity packages, and workplace configurations prior to submitting your profile.
              </p>
            </div>
          </div>
        </section>

        {/* CTA BANNER SECTION */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="relative overflow-hidden p-10 sm:p-14 bg-white dark:bg-[#111827] border border-[#E5E7EB] dark:border-[#1F2937] rounded-[32px] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2]" />
            
            <div className="max-w-xl text-center md:text-left relative z-10">
              <h3 className="text-[28px] sm:text-[34px] font-bold text-[#111827] dark:text-white mb-3 tracking-tight">
                Ready to upgrade your recruitment experience?
              </h3>
              <p className="text-[16px] text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
                Create an account in less than two minutes to unlock tailored recommendations, instant application tracking, and direct employer updates.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto shrink-0 relative z-10">
              <Link
                to={isAuthenticated ? dashboardPath : "/register"}
                className="px-8 py-4 bg-gradient-to-r from-[#2F80ED] to-[#2563EB] hover:opacity-95 text-white rounded-full text-[16px] font-semibold transition-all text-center shadow-md"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              </Link>
              <Link
                to="/jobs"
                className="px-8 py-4 bg-[#F7FAFC] dark:bg-[#1F2937] hover:bg-[#EDF5FF] dark:hover:bg-[#374151] text-[#111827] dark:text-white hover:text-[#2F80ED] dark:hover:text-[#56CCF2] rounded-full text-[16px] font-semibold transition-all text-center border border-[#E5E7EB] dark:border-[#374151]"
              >
                Browse Jobs First
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12 transition-colors relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2.5">
                <img 
                  src={logo} 
                  alt="Jobnique Logo" 
                  className="w-9 h-9 object-contain rounded-[12px]" 
                />
                <span className="text-xl font-bold text-white tracking-tight">
                  Jobnique<span className="text-indigo-500">.</span>
                </span>
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Connecting talented candidates with industry-leading companies globally. Your next career milestone starts here.
              </p>
            </div>

            {/* For JobSeeker */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-100 tracking-wide">For JobSeeker</h4>
              <ul className={`space-y-2.5 text-xs ${isAuthenticated ? "opacity-50 pointer-events-none" : ""}`}>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Browse Jobs</span>
                  ) : (
                    <Link to="/jobs" className="hover:text-indigo-400 transition-colors">
                      Browse Jobs
                    </Link>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Browse Categories</span>
                  ) : (
                    <a
                      href="/categories"
                      onClick={(e) => handleProtectedLink(e, "/categories")}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Browse Categories
                    </a>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Candidate Dashboard</span>
                  ) : (
                    <a
                      href="/jobseeker/dashboard"
                      onClick={(e) => handleProtectedLink(e, "/jobseeker/dashboard")}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Candidate Dashboard
                    </a>
                  )}
                </li>
              </ul>
            </div>

            {/* For Employers */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-100 tracking-wide">For Employers</h4>
              <ul className={`space-y-2.5 text-xs ${isAuthenticated ? "opacity-50 pointer-events-none" : ""}`}>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Post a Job</span>
                  ) : (
                    <a
                      href="/post-job"
                      onClick={(e) => handleProtectedLink(e, "/post-job")}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Post a Job
                    </a>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Pricing Plans</span>
                  ) : (
                    <a
                      href="/pricing"
                      onClick={(e) => handleProtectedLink(e, "/pricing")}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Pricing Plans
                    </a>
                  )}
                </li>
                <li>
                  {isAuthenticated ? (
                    <span className="cursor-not-allowed">Employer Resources</span>
                  ) : (
                    <a
                      href="/employer-resources"
                      onClick={(e) => handleProtectedLink(e, "/employer-resources")}
                      className="hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Employer Resources
                    </a>
                  )}
                </li>
              </ul>
            </div>

            {/* Support & Company - Always public */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-100 tracking-wide">Support & Company</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <Link to="/about" className="hover:text-indigo-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} Jobnique Inc. All rights reserved.</p>
            <div className="flex items-center gap-1.5 hover:text-slate-300 transition-colors cursor-pointer">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;