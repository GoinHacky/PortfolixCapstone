import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import PortfolioLogo from "../../assets/images/Portfolio.svg";
import {
  Activity,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle,
  Grid3x3,
  Layers,
  Menu,
  Moon,
  Play,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

const STYLE_ID = "landing-page-ai-style";

const FEATURES = [
  {
    title: "AI Narrative Engine",
    description:
      "Transform achievements into compelling stories tuned for recruiters, admissions panels, and internship programs.",
    accent: "from-[#7f1d1d] via-[#a11c2f] to-[#ffc857]",
    icon: Brain
  },
  {
    title: "Signal-Driven Skill Map",
    description:
      "See faculty endorsements and project depth mapped in real time through gorgeous, interactive visualizations.",
    accent: "from-[#ffc857] via-[#d4af37] to-[#7f1d1d]",
    icon: Grid3x3
  },
  {
    title: "Presentation Automation",
    description:
      "Generate microsites, recruiter decks, and printable resumes—perfectly branded—on demand.",
    accent: "from-[#4c1d95] via-[#7f1d1d] to-[#d4af37]",
    icon: Layers
  }
];

const STATS = [
  { label: "Students", value: "10K+", icon: Users },
  { label: "Portfolios Published", value: "52K", icon: Briefcase },
  { label: "Recruiter Approval", value: "96%", icon: Shield },
  { label: "Interview Boost", value: "3.4x", icon: TrendingUp }
];

const WORKFLOW = [
  {
    step: "01",
    title: "Import Everything",
    description:
      "Sync transcripts, Git commits, certificates, hackathon wins, and research artifacts in seconds.",
    icon: Zap
  },
  {
    step: "02",
    title: "Validate & Elevate",
    description:
      "Request faculty endorsements, attach evidence, and let AI highlight the narrative arc automatically.",
    icon: Shield
  },
  {
    step: "03",
    title: "Launch Anywhere",
    description:
      "Deploy a cinematic portfolio, export recruiter decks, or share a private review link—instantly updateable.",
    icon: Activity
  }
];

const TESTIMONIALS = [
  {
    initials: "SR",
    name: "Sofia Reyes",
    role: "Top 1% Data Scholar",
    quote:
      "PortfolioX feels like a creative director and career strategist combined. My AI-polished case studies landed three interviews in a week."
  },
  {
    initials: "ML",
    name: "Marco Li",
    role: "Engineering Fellow",
    quote:
      "Faculty validations became my credibility passport. Recruiters understood the rigor behind every project immediately."
  },
  {
    initials: "AR",
    name: "Aisha Raman",
    role: "Creative Technologist",
    quote:
      "The live analytics, glowing visuals, and one-click storytelling made my portfolio stand out from a sea of noise."
  }
];

const injectStyles = () => {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes gradientFlow {
      0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
      50% { background-position: 100% 50%; filter: hue-rotate(10deg); }
      100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
    }

    @keyframes floatSlow {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(14px, -18px, 0); }
    }

    @keyframes floatReverse {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(-16px, 18px, 0); }
    }

    @keyframes pulseRing {
      0%, 100% { transform: scale(0.95); opacity: 0.5; }
      50% { transform: scale(1.05); opacity: 0.85; }
    }

    @keyframes shimmer {
      from { transform: translateX(-100%); }
      to { transform: translateX(100%); }
    }

    .ai-surface {
      background:
        radial-gradient(circle at 15% 25%, rgba(128, 0, 0, 0.45), transparent 55%),
        radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.35), transparent 60%),
        radial-gradient(circle at 50% 80%, rgba(128, 0, 0, 0.28), transparent 65%),
        linear-gradient(140deg, #faf6f2 0%, #fffaf0 35%, #f8f3ff 70%, #fff6ee 100%);
      background-size: 220% 220%;
      animation: gradientFlow 18s ease infinite;
      position: relative;
      overflow: hidden;
    }

    .dark .ai-surface {
      background:
        radial-gradient(circle at 10% 40%, rgba(212, 175, 55, 0.28), transparent 55%),
        radial-gradient(circle at 70% 30%, rgba(128, 0, 0, 0.45), transparent 60%),
        linear-gradient(145deg, #080812 0%, #120f21 45%, #180f27 100%);
      background-size: 240% 240%;
    }

    .ai-grid {
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
      background-size: 70px 70px;
      position: absolute;
      inset: -40%;
      mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 35%, transparent 70%);
      pointer-events: none;
    }

    .dark .ai-grid {
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    }

    .glass-card {
      background: linear-gradient(150deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.25));
      border: 1px solid rgba(212, 175, 55, 0.24);
      backdrop-filter: blur(22px);
      box-shadow: 0 35px 70px rgba(128, 0, 0, 0.08);
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease;
      position: relative;
    }

    .dark .glass-card {
      background: linear-gradient(150deg, rgba(14, 14, 28, 0.9), rgba(32, 18, 42, 0.68));
      border-color: rgba(212, 175, 55, 0.22);
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.55);
    }

    .glass-card::after {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      border: 1px solid rgba(255, 255, 255, 0.25);
      mask-image: linear-gradient(#fff 0%, rgba(255, 255, 255, 0) 70%);
      pointer-events: none;
    }

    .glass-card:hover {
      transform: translateY(-10px) scale(1.01);
      box-shadow: 0 45px 90px rgba(128, 0, 0, 0.14);
    }

    .dark .glass-card:hover {
      box-shadow: 0 45px 90px rgba(0, 0, 0, 0.65);
    }

    .pill-button {
      position: relative;
      overflow: hidden;
    }

    .pill-button::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }

    .pill-button:hover::after { transform: translateX(100%); }

    .pill-button:hover { transform: translateY(-2px) scale(1.015); }

    .shimmer-bar {
      position: relative;
      overflow: hidden;
    }

    .shimmer-bar::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 45%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
      animation: shimmer 2.6s ease infinite;
    }
  `;

  document.head.appendChild(style);
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(injectStyles, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const stats = useMemo(() => STATS, []);
  const features = useMemo(() => FEATURES, []);
  const workflow = useMemo(() => WORKFLOW, []);
  const testimonials = useMemo(() => TESTIMONIALS, []);

  const handleSignIn = () => navigate("/auth/login");
  const handleStartFree = () => navigate("/auth/signup");
  const handleWatchDemo = () => window.open("https://portfoliox.ai/demo", "_blank", "noopener");

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "dark" : ""}`}>
      <div className="ai-surface min-h-screen text-[#1f0f0f] dark:text-gray-50">
        <div className="ai-grid" />

        <nav className="relative z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-[#d4af37]/25 dark:bg-black/20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                <img src={PortfolioLogo} alt="PortfolioX logo" className="h-9 w-9" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight text-[#7f1d1d] dark:text-[#d4af37]">PortfolioX</p>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-gray-500 dark:text-gray-300">
                  AI Powered Academic Portfolios
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-6 md:flex">
              <button
                onClick={handleSignIn}
                className="text-sm font-semibold text-gray-700 transition hover:text-[#7f1d1d] dark:text-gray-200 dark:hover:text-[#d4af37]"
              >
                Sign In
              </button>
              <button
                onClick={handleStartFree}
                className="pill-button rounded-full bg-gradient-to-r from-[#7f1d1d] via-[#9f1f1f] to-[#d4af37] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#7f1d1d]/25"
              >
                Start Free
              </button>
              <button
                onClick={toggleDarkMode}
                className="rounded-full border border-gray-300 bg-white/70 p-2 text-gray-600 transition hover:border-[#7f1d1d] hover:text-[#7f1d1d] dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:hover:text-[#d4af37]"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={toggleDarkMode}
                className="rounded-full border border-gray-200 bg-white/70 p-2 text-gray-600 transition hover:border-[#7f1d1d] hover:text-[#7f1d1d] dark:border-white/20 dark:bg-white/10 dark:text-gray-100 dark:hover:text-[#d4af37]"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-full border border-transparent p-2 text-gray-700 transition hover:border-[#7f1d1d] hover:text-[#7f1d1d] dark:text-white"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-white/40 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-[#d4af37]/25 dark:bg-black/40 md:hidden">
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSignIn}
                  className="rounded-full border border-white/70 bg-white px-5 py-2 text-sm font-semibold text-[#7f1d1d] shadow-sm dark:border-white/20 dark:bg-white/10 dark:text-[#d4af37]"
                >
                  Sign In
                </button>
                <button
                  onClick={handleStartFree}
                  className="rounded-full bg-gradient-to-r from-[#7f1d1d] via-[#9f1f1f] to-[#d4af37] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#7f1d1d]/25"
                >
                  Start Free
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="rounded-full border border-white/50 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#7f1d1d] hover:text-[#7f1d1d] dark:border-white/30 dark:text-gray-100"
                >
                  Watch Demo
                </button>
              </div>
            </div>
          )}
        </nav>

        <main className="relative z-20">
          <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-12 px-4 py-16 lg:flex-row lg:items-center lg:gap-16">
            <div className="flex-1">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#7f1d1d] shadow-sm backdrop-blur dark:border-[#d4af37]/25 dark:bg-white/10 dark:text-[#d4af37]">
                <Sparkles className="h-4 w-4" />
                AI-Narrated Academic Stories
              </div>
              <h1 className="text-4xl font-black leading-tight text-[#2b0d0d] drop-shadow-sm dark:text-white sm:text-5xl lg:text-[56px]">
                Build an experience recruiters remember.
                <span className="block bg-gradient-to-r from-[#7f1d1d] via-[#bf2c2c] to-[#d4af37] bg-clip-text text-transparent">
                  Faculty-verified. AI-orchestrated. Yours.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                PortfolioX helps you convert credentials into cinematic narratives. Blend neural writing, verified milestones, and real-time analytics into a portfolio that feels alive.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleStartFree}
                  className="pill-button flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7f1d1d] via-[#9f1f1f] to-[#d4af37] px-8 py-3 text-base font-semibold text-white shadow-xl shadow-[#7f1d1d]/25"
                >
                  Launch Your Portfolio
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#7f1d1d]/35 px-8 py-3 text-base font-semibold text-[#7f1d1d] transition hover:border-[#7f1d1d] hover:bg-[#7f1d1d]/10 dark:border-[#d4af37]/40 dark:text-[#d4af37] dark:hover:bg-[#d4af37]/10"
                >
                  <Play className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-10 grid gap-6 rounded-2xl border border-white/40 bg-white/70 p-6 backdrop-blur-xl dark:border-white/15 dark:bg-white/5 sm:grid-cols-2">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7f1d1d]/10 text-[#7f1d1d] dark:bg-[#d4af37]/15 dark:text-[#d4af37]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xl font-bold text-[#7f1d1d] dark:text-[#d4af37]">{value}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center">
              <div className="glass-card w-full max-w-md rounded-[32px] p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7f1d1d] dark:text-[#d4af37]">Live Recruiter Feed</p>
                  <span className="rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs font-semibold text-[#7f1d1d] dark:border-[#d4af37]/30 dark:text-[#d4af37]">
                    Updated 2m ago
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-[#240a0a] dark:text-white">
                  Engagement Intelligence
                </h3>

                <div className="mt-6 rounded-2xl bg-white/75 p-4 shadow-inner dark:bg-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Interaction Score</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-4xl font-black text-[#7f1d1d] dark:text-[#d4af37]">94</span>
                    <span className="progress-ring flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d4af37]/25 bg-[#7f1d1d]/10 text-[#7f1d1d] dark:border-[#d4af37]/35 dark:bg-[#d4af37]/10 dark:text-[#d4af37]">
                      <TrendingUp className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="shimmer-bar mt-4 h-2 rounded-full bg-[#7f1d1d]/15 dark:bg-[#d4af37]/20">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#d4af37]" />
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2 dark:border-white/20 dark:bg-white/5">
                    <span className="font-semibold">Story Resonance</span>
                    <span className="text-[#7f1d1d] dark:text-[#d4af37]">A+</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2 dark:border-white/20 dark:bg-white/5">
                    <span className="font-semibold">Faculty Credibility</span>
                    <span className="text-[#7f1d1d] dark:text-[#d4af37]">Verified</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 px-3 py-2 dark:border-white/20 dark:bg-white/5">
                    <span className="font-semibold">Project Depth</span>
                    <span className="text-[#7f1d1d] dark:text-[#d4af37]">Expert</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-[#7f1d1d]/25 bg-white/60 p-4 text-xs font-semibold text-[#7f1d1d] shadow-inner dark:border-[#d4af37]/30 dark:bg-white/10 dark:text-[#d4af37]">
                  “Portfolios enhanced through PortfolioX AI achieved a 3.4x lift in recruiter callbacks across global internship programs.”
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7f1d1d]/30 bg-white/70 px-4 py-1 text-xs font-semibold text-[#7f1d1d] shadow-sm dark:border-[#d4af37]/30 dark:bg-white/10 dark:text-[#d4af37]">
                <Sparkles className="h-4 w-4" />
                Designed for momentum
              </span>
              <h2 className="mt-3 text-3xl font-black text-[#2e0f0f] dark:text-white sm:text-4xl">
                Intelligence that makes every achievement unforgettable
              </h2>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                PortfolioX fuses human authenticity with neural precision. Create immersive narratives, prove credibility, and measure engagement without breaking flow.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, accent, icon: Icon }) => (
                <div key={title} className="feature-card glass-card flex h-full flex-col rounded-[28px] p-8">
                  <span
                    className={`feature-icon mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg shadow-[#7f1d1d]/20`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-xl font-bold text-[#2e0f0f] dark:text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#7f1d1d]/80 dark:text-[#d4af37]/80">
                    Learn More
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/75 py-16 dark:bg-[#0b0b16]/70">
            <div className="relative mx-auto max-w-6xl px-4">
              <div className="pointer-events-none absolute inset-x-0 -top-32 flex justify-center opacity-60">
                <div className="h-64 w-64 rounded-full bg-gradient-to-br from-[#7f1d1d] to-[#d4af37] blur-3xl" />
              </div>

              <div className="relative grid gap-6 lg:grid-cols-3">
                {workflow.map(({ step, title, description, icon: Icon }) => (
                  <div key={title} className="glass-card h-full rounded-[26px] p-8">
                    <span className="rounded-full border border-[#7f1d1d]/30 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#7f1d1d] dark:border-[#d4af37]/25 dark:bg-white/10 dark:text-[#d4af37]">
                      {step}
                    </span>
                    <div className="mt-5 flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d] dark:bg-[#d4af37]/12 dark:text-[#d4af37]">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-xl font-bold text-[#2e0f0f] dark:text-white">{title}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#7f1d1d]/30 bg-white/80 px-4 py-1 text-xs font-semibold text-[#7f1d1d] shadow-sm dark:border-[#d4af37]/30 dark:bg-white/10 dark:text-[#d4af37]">
                <CheckCircle className="h-4 w-4" />
                Trusted by bold scholars
              </span>
              <h2 className="mt-3 text-3xl font-black text-[#2e0f0f] dark:text-white sm:text-4xl">
                Stories crafted on PortfolioX get noticed globally
              </h2>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
                Students worldwide rely on PortfolioX to turn proof of effort into magnetic narratives. Here’s how alumni describe the momentum.
              </p>
            </div>

            <div className="relative mt-12">
              <div className="overflow-hidden rounded-[32px] border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-white/8">
                {testimonials.map(({ initials, name, role, quote }, index) => (
                  <div
                    key={name}
                    className={`transition duration-700 ${
                      index === activeTestimonial
                        ? "opacity-100"
                        : "pointer-events-none absolute inset-0 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7f1d1d] to-[#d4af37] text-2xl font-bold text-white shadow-lg">
                        {initials}
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-[#7f1d1d] dark:text-[#d4af37]">{name}</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{role}</p>
                      </div>
                    </div>
                    <p className="mt-6 text-xl leading-relaxed text-[#2e0f0f] dark:text-gray-100">“{quote}”</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeTestimonial === index
                        ? "w-10 bg-[#7f1d1d] dark:bg-[#d4af37]"
                        : "w-4 bg-gray-400/50 hover:bg-[#7f1d1d]/60 dark:bg-white/20 dark:hover:bg-[#d4af37]/70"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-gradient-to-br from-[#7f1d1d] via-[#4a0d0d] to-[#120607] py-20 text-white">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute left-1/4 top-[-120px] h-72 w-72 rounded-full bg-[#d4af37] blur-3xl" />
              <div className="absolute bottom-[-140px] right-16 h-80 w-80 rounded-full bg-[#d4af37] blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 text-center">
              <h2 className="text-3xl font-black sm:text-4xl">
                Ready to launch an unforgettable academic presence?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
                Pair your ambition with an AI co-pilot that turns progress into opportunity. PortfolioX translates your journey into an experience recruiters can feel.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <button
                  onClick={handleStartFree}
                  className="pill-button flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-base font-semibold text-[#7f1d1d] shadow-2xl shadow-[#120607]/40"
                >
                  Create My Portfolio
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignIn}
                  className="rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  I Already Have an Account
                </button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                <span>Faculty Verified</span>
                <span>Recruiter Approved</span>
                <span>Privacy First</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
