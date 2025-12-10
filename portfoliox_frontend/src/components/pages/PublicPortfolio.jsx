import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  PenSquare,
  Sparkles,
  Link2,
  Award,
  FolderGit2,
  FileText,
  CalendarDays,
  ShieldCheck,
  Share2,
  BadgeCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { getApiBaseUrl } from '../../api/apiConfig';

export default function PublicPortfolio() {
  const { token } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/portfolios/public/${token}`);
        if (!res.ok) throw new Error('Portfolio not found');
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f0ec] via-white to-[#ffe6d6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="rounded-3xl border border-[#800000]/10 bg-white/90 px-10 py-12 text-center shadow-2xl backdrop-blur dark:border-[#D4AF37]/10 dark:bg-slate-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#800000]/10 text-[#800000] dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
            <Share2 className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-[#800000] dark:text-[#D4AF37]">Preparing Your Shared Portfolio</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">Loading highlighted achievements and showcase details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f0ec] via-white to-[#ffe6d6] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="rounded-3xl border border-red-200/60 bg-white/90 px-10 py-12 text-center shadow-2xl backdrop-blur dark:border-red-500/30 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300">Portfolio Unavailable</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const descriptionLines = portfolio.portfolioDescription
    ? portfolio.portfolioDescription
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const skillNames = Array.isArray(portfolio.skills)
    ? portfolio.skills
        .map((skill) => (typeof skill === 'string' ? skill : skill?.skillName))
        .filter(Boolean)
    : [];

  const certificationNames = Array.isArray(portfolio.certifications)
    ? portfolio.certifications
        .map((cert) => (typeof cert === 'string' ? cert : cert?.certTitle))
        .filter(Boolean)
    : [];

  const projectNames = Array.isArray(portfolio.projects)
    ? portfolio.projects
        .map((proj) => (typeof proj === 'string' ? proj : proj?.projectName))
        .filter(Boolean)
    : [];

  const summaryBlurb = descriptionLines[0]
    ? descriptionLines[0].length > 180
      ? `${descriptionLines[0].slice(0, 177)}…`
      : descriptionLines[0]
    : 'A curated view highlighting the skills, outputs, and recognitions that define this portfolio.';

  const parsedIssueDate = portfolio.issueDate ? new Date(portfolio.issueDate) : null;
  const formattedIssueDate = parsedIssueDate && !isNaN(parsedIssueDate.valueOf())
    ? parsedIssueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : portfolio.issueDate || null;

  const hasCertificateImage = Boolean(
    portfolio.certFile && /\.(jpg|jpeg|png)$/i.test(portfolio.certFile)
  );

  const certificateUrl = hasCertificateImage
    ? `${getApiBaseUrl()}/${portfolio.certFile.replace(/^uploads[\\\/]/, 'uploads/')}`
    : null;

  const quickFacts = [
    {
      label: 'Category',
      value: portfolio.category || 'Not provided',
      icon: PenSquare,
    },
    {
      label: 'Issued On',
      value: formattedIssueDate || 'Not provided',
      icon: CalendarDays,
      hidden: !formattedIssueDate,
    },
    {
      label: 'Public Token',
      value: portfolio.publicToken || '—',
      icon: ShieldCheck,
      isCode: true,
    },
  ].filter(({ hidden }) => !hidden);

  if (portfolio.githubLink) {
    quickFacts.push({
      label: 'GitHub Repository',
      value: 'Visit project',
      icon: Link2,
      href: portfolio.githubLink,
    });
  }

  const statHighlights = [
    {
      label: 'Skills Highlighted',
      value: skillNames.length,
      icon: Sparkles,
      hidden: skillNames.length === 0,
    },
    {
      label: 'Linked Projects',
      value: projectNames.length,
      icon: FolderGit2,
      hidden: projectNames.length === 0,
    },
    {
      label: 'Certifications',
      value: certificationNames.length,
      icon: Award,
      hidden: certificationNames.length === 0,
    },
  ].filter(({ hidden }) => !hidden);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f0ec] via-white to-[#ffe6d6] py-16 px-4 font-sans text-gray-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-[#800000]/40 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#800000] shadow-sm backdrop-blur dark:border-[#D4AF37]/30 dark:bg-slate-900/70 dark:text-[#D4AF37]">
            <Share2 className="h-4 w-4" /> Shared Portfolio
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#800000]/15 bg-white/90 shadow-2xl backdrop-blur dark:border-[#D4AF37]/15 dark:bg-slate-900/80">
          <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[#800000]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-[#D4AF37]/20 blur-3xl" />

          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800000] via-[#991010] to-[#5a0000] px-8 py-12 text-white sm:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
                  <PenSquare className="h-4 w-4" /> Portfolio Spotlight
                </div>
                <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {portfolio.portfolioTitle}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/85">
                  {summaryBlurb}
                </p>
              </div>
              {statHighlights.length > 0 && (
                <div className="grid w-full max-w-sm gap-3 sm:grid-cols-2">
                  {statHighlights.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 shadow-inner backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-white/70">
                            {label}
                          </div>
                          <div className="text-2xl font-bold leading-snug">{value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          <main className="relative z-10 grid gap-12 px-8 py-12 sm:px-12 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <section className="space-y-10">
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="flex items-center gap-3 text-[#800000] dark:text-[#D4AF37]">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-lg font-semibold tracking-tight">Narrative Overview</h2>
                </div>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {descriptionLines.length > 0 ? (
                    <ul className="space-y-3">
                      {descriptionLines.map((line, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-[#D4AF37]" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      This shared view will feature a descriptive narrative once the student adds more details to their portfolio entry.
                    </p>
                  )}
                </div>
              </div>

              {skillNames.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                  <div className="flex items-center gap-3 text-[#800000] dark:text-[#D4AF37]">
                    <Sparkles className="h-5 w-5" />
                    <h2 className="text-lg font-semibold tracking-tight">Core Skills & Tools</h2>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {skillNames.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-gradient-to-r from-[#fff6da] via-[#f8df9b] to-[#f2c465] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#800000] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#D4AF37]/30 dark:from-[#5c3d03] dark:via-[#8d5f0f] dark:to-[#c0891c] dark:text-[#FCE7BA]"
                      >
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(projectNames.length > 0 || certificationNames.length > 0) && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {projectNames.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="flex items-center gap-3 text-[#800000] dark:text-[#D4AF37]">
                        <FolderGit2 className="h-5 w-5" />
                        <h2 className="text-lg font-semibold tracking-tight">Supporting Projects</h2>
                      </div>
                      <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                        {projectNames.map((name, idx) => (
                          <li key={`${name}-${idx}`} className="flex gap-3 rounded-2xl border border-transparent bg-[#800000]/5 px-4 py-3 transition hover:border-[#800000]/30 hover:bg-[#800000]/8 dark:bg-[#D4AF37]/10 dark:hover:border-[#D4AF37]/40">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#800000] shadow-inner dark:bg-slate-900 dark:text-[#D4AF37]">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {certificationNames.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="flex items-center gap-3 text-[#800000] dark:text-[#D4AF37]">
                        <Award className="h-5 w-5" />
                        <h2 className="text-lg font-semibold tracking-tight">Certifications</h2>
                      </div>
                      <ul className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                        {certificationNames.map((name, idx) => (
                          <li key={`${name}-${idx}`} className="flex gap-3 rounded-2xl border border-transparent bg-[#800000]/5 px-4 py-3 transition hover:border-[#800000]/30 hover:bg-[#800000]/8 dark:bg-[#D4AF37]/10 dark:hover:border-[#D4AF37]/40">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#800000] shadow-inner dark:bg-slate-900 dark:text-[#D4AF37]">
                              <Award className="h-4 w-4" />
                            </span>
                            <span className="leading-relaxed">{name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>

            <aside className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  <CalendarDays className="h-4 w-4" /> Quick Facts
                </h2>
                <div className="mt-6 space-y-4">
                  {quickFacts.map(({ label, value, icon: Icon, href, isCode }) => (
                    <div key={label} className="flex items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition hover:border-[#800000]/20 hover:bg-[#800000]/4 dark:hover:border-[#D4AF37]/25 dark:hover:bg-[#D4AF37]/10">
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#800000]/10 text-[#800000] shadow-sm dark:bg-[#D4AF37]/10 dark:text-[#D4AF37]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                          {label}
                        </div>
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[#800000] underline decoration-[#D4AF37]/60 underline-offset-4 transition hover:text-[#5a0000] dark:text-[#D4AF37]"
                          >
                            <Link2 className="h-4 w-4" />
                            {value}
                          </a>
                        ) : (
                          <div
                            className={`mt-1 text-sm font-medium ${
                              isCode
                                ? 'font-mono text-[#800000] dark:text-[#FCE7BA]'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(portfolio.certTitle || formattedIssueDate || hasCertificateImage) && (
                <div className="space-y-5 rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70">
                  <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                    <ImageIcon className="h-4 w-4" /> Evidence & Attachments
                  </h2>

                  {hasCertificateImage ? (
                    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                      <img
                        src={certificateUrl}
                        alt="Certificate"
                        className="h-48 w-full object-cover"
                      />
                      <figcaption className="flex items-center justify-between px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                        <span>Official certificate preview</span>
                        <a
                          href={certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[#800000] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow transition hover:bg-[#5a0000] dark:bg-[#D4AF37] dark:text-slate-900 dark:hover:bg-[#f7d36a]"
                        >
                          View Full
                        </a>
                      </figcaption>
                    </figure>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                      No certificate image uploaded yet.
                    </div>
                  )}

                  {portfolio.certTitle && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        Certificate Title
                      </div>
                      <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                        {portfolio.certTitle}
                      </div>
                    </div>
                  )}

                  {formattedIssueDate && (
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-800">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                        Issued On
                      </div>
                      <div className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                        {formattedIssueDate}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-3xl border border-emerald-200/60 bg-emerald-50/70 px-6 py-7 text-sm text-emerald-900 shadow-xl shadow-emerald-900/10 dark:border-emerald-700/40 dark:bg-emerald-900/40 dark:text-emerald-100">
                <h2 className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" /> Trust Indicator
                </h2>
                <p className="mt-3 leading-relaxed">
                  This shared portfolio token is generated directly by PortfolioX, ensuring authenticity of the showcased achievements. Share this view with mentors, recruiters, or peers to highlight verified milestones.
                </p>
              </div>
            </aside>
          </main>

          <footer className="border-t border-[#800000]/10 bg-[#800000]/5 px-8 py-6 text-sm text-[#800000] dark:border-[#D4AF37]/10 dark:bg-[#D4AF37]/10 dark:text-[#FCE7BA] sm:px-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-semibold uppercase tracking-[0.28em] text-[#800000]/80 dark:text-[#FCE7BA]/80">
                  PortfolioX Showcase
                </span>
                <p className="mt-1 text-xs text-[#5a0000] dark:text-[#FCE7BA]/60">
                  Tailored portfolio snapshot crafted for external sharing.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold">Token</span>
                <code className="rounded-full bg-white px-4 py-1 font-mono text-[#800000] shadow-inner dark:bg-slate-900 dark:text-[#FCE7BA]">
                  {portfolio.publicToken || '—'}
                </code>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}