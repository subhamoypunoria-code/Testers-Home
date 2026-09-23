import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Bug,
  BarChart3,
  Users,
  Zap,
  Globe,
  ArrowRight,
  Menu,
  X,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

import Reveal from '../../components/animation/Reveal.jsx';
import AnimatedBackground from '../../components/animation/AnimatedBackground.jsx';
import { heroHeadline, MotionRouterLink } from '../../components/animation/motion.js';

const navLinks = ['Features', 'How It Works', 'About', 'Pricing', 'Blogs'];
const partnerBrands = ['Spotify', 'Coinbase', 'Slack', 'Dropbox', 'Webflow'];

const heroStats = [
  { value: '14+', label: 'Defect Statuses' },
  { value: '98%', label: 'Team Satisfaction' },
];

const impactCards = [
  {
    icon: <BarChart3 size={24} className="text-[#ffb59e]" />,
    title: 'Data Driven',
    desc: 'Every defect decision backed by severity trends, developer performance, and SLA dashboards.',
  },
  {
    icon: <Zap size={24} className="text-[#ffb59e]" />,
    title: 'Real-Time Speed',
    desc: 'Live updates via WebSockets — every status change reflected instantly across your entire team.',
  },
  {
    icon: <Shield size={24} className="text-[#ffb59e]" />,
    title: 'Enterprise Craft',
    desc: 'Meticulous RBAC, audit trails, and fine-grained permissions — built for teams that demand security.',
  },
];

const footerProduct = ['Defect Tracking', 'Analytics', 'Integrations', 'API Access'];
const footerCompany = ['About', 'Pricing', 'Blog', 'Contact'];
const footerLegal = ['Privacy Policy', 'Terms of Service'];

const AvatarGroup = ({ items, size = 'w-12 h-12', showCount }) => (
  <div className="flex items-center">
    {items.map((item, i) => (
      <div
        key={i}
        className={`${size} rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-bold ${
          i !== 0 ? '-ml-3' : ''
        }`}
        style={{
          background: `linear-gradient(135deg, ${item.from} 0%, ${item.to} 100%)`,
          color: '#000',
        }}
      >
        {item.label}
      </div>
    ))}
    {showCount && (
      <div
        className={`${size} rounded-full -ml-3 bg-[#1f1f1f] flex items-center justify-center text-[10px] font-bold text-white/70 border-2 border-[#0a0a0a]`}
      >
        +{showCount}
      </div>
    )}
  </div>
);

const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white/90 overflow-x-hidden">
      {/* ── TOP NAV ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff5c1a] flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-sora text-xl font-bold text-white">Testers Home</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Log in
            </Link>
            <MotionRouterLink
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff5c1a] px-5 py-2 text-sm font-bold text-[#521300] glow-orange-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started
            </MotionRouterLink>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="lg:hidden p-2 text-white/80 hover:text-white"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 glass-card border-t border-white/10 p-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-base font-medium text-white/70 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <hr className="border-white/10" />
            <Link
              to="/login"
              className="text-base font-medium text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <MotionRouterLink
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5c1a] px-5 py-3 text-sm font-bold text-[#521300] glow-orange-btn"
              whileTap={{ scale: 0.98 }}
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </MotionRouterLink>
          </div>
        )}
      </nav>

      <main className="relative">
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center overflow-hidden pt-24 pb-20">
          <AnimatedBackground variant="aurora" className="z-0" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left copy */}
              <div className="lg:col-span-7 flex flex-col gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-flex items-center gap-2 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
                >
                  <Globe size={14} className="text-[#ffb59e]" />
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60">
                    Enterprise QA Platform
                  </span>
                </motion.div>

                <motion.h1
                  variants={heroHeadline}
                  initial="hidden"
                  animate="visible"
                  className="font-sora text-4xl sm:text-5xl lg:text-[clamp(48px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight"
                >
                  QA That Grows With
                  <br />
                  <span className="gradient-text">Your Team</span>, Not Against It
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="text-lg leading-relaxed text-white/70 max-w-xl"
                >
                  Centralize defect tracking, team collaboration, and release quality in one modern
                  platform. Eliminate Excel sheets and WhatsApp groups — forever.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-6"
                >
                  <MotionRouterLink
                    to="/register"
                    className="inline-flex items-center gap-3 rounded-full bg-[#ff5c1a] px-8 py-4 text-base font-bold text-[#521300] glow-orange-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started Free
                    <ArrowRight size={20} />
                  </MotionRouterLink>

                  <div className="flex items-center gap-4">
                    <AvatarGroup
                      items={[
                        { label: 'JD', from: '#ffb59e', to: '#ff5c1a' },
                        { label: 'SK', from: '#ff8a4c', to: '#ff5c1a' },
                        { label: 'MR', from: '#ffd1b3', to: '#ff7a45' },
                      ]}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">500+ Happy Users</div>
                      <div className="text-xs font-semibold tracking-wide text-white/50">
                        Across QA teams worldwide
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-2 gap-4 max-w-sm pt-4"
                >
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="glass-card rounded-2xl p-5">
                      <div className="font-sora text-3xl lg:text-4xl font-bold text-[#ffb59e] leading-none">
                        {stat.value}
                      </div>
                      <div className="mt-2 text-xs font-semibold tracking-wider uppercase text-white/60">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right visual — CSS/mock UI */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 relative"
              >
                <div className="relative aspect-[4/5] w-full rounded-[32px] glass-card p-5 overflow-hidden glow-orange">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        'radial-gradient(circle at 80% 20%, rgba(255,92,26,0.35) 0%, transparent 45%), radial-gradient(circle at 20% 90%, rgba(255,181,158,0.2) 0%, transparent 40%)',
                    }}
                  />

                  <div className="relative z-10 flex flex-col h-full gap-5">
                    {/* Mock window header */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-white/20" />
                        <span className="w-3 h-3 rounded-full bg-white/20" />
                        <span className="w-3 h-3 rounded-full bg-white/20" />
                      </div>
                      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Defect Pipeline
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="glass-card rounded-2xl p-4 flex-1 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white/80">Weekly trend</span>
                        <TrendingUp size={16} className="text-[#ff5c1a]" />
                      </div>
                      <div className="flex-1 flex items-end gap-2">
                        {[40, 70, 55, 85, 60, 90, 75].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-[#ff5c1a] to-[#ffb59e] opacity-90"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-white/40 font-medium uppercase tracking-wider">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                      </div>
                    </div>

                    {/* Metric row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Open', value: '24' },
                        { label: 'Closed', value: '186' },
                        { label: 'SLA', value: '98%' },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl bg-white/5 border border-white/10 p-3 text-center"
                        >
                          <div className="font-sora text-lg font-bold text-white">{m.value}</div>
                          <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status list */}
                    <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
                      {[
                        { label: 'Critical bug in checkout', status: 'In Progress' },
                        { label: 'Auth flow regression', status: 'Resolved' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-white/70">{row.label}</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                              row.status === 'Resolved'
                                ? 'bg-[#ff5c1a]/20 text-[#ffb59e]'
                                : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 glass-card rounded-2xl px-4 py-3 border border-[#ff5c1a]/30 hidden sm:flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#ff5c1a]/20 flex items-center justify-center">
                    <Zap size={14} className="text-[#ff5c1a]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Real-time sync</div>
                    <div className="text-[10px] text-white/50">Live updates enabled</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 hidden sm:flex items-center gap-3"
                >
                  <AvatarGroup
                    items={[
                      { label: 'AL', from: '#ffb59e', to: '#ff5c1a' },
                      { label: 'RJ', from: '#ff8a4c', to: '#ff5c1a' },
                    ]}
                    size="w-8 h-8"
                    showCount={5}
                  />
                  <div>
                    <div className="text-xs font-bold text-white">12 active now</div>
                    <div className="text-[10px] text-white/50">On this project</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Partner logos strip */}
          <div className="absolute bottom-0 w-full py-8 bg-gradient-to-t from-black to-transparent">
            <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {partnerBrands.map((brand) => (
                <span
                  key={brand}
                  className="font-sora text-xl sm:text-2xl font-semibold tracking-tight text-white/80"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="relative py-24 bg-[#0a0a0a] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal variant="up">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-[#ffb59e]" />
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#ffb59e]">
                      Why choose us
                    </span>
                  </div>
                  <h2 className="font-sora text-3xl lg:text-[clamp(32px,3.5vw,40px)] font-bold leading-tight">
                    Meet The Platform
                    <br />
                    <span className="text-white/40">Built for Testers</span>
                  </h2>
                </div>
                <div className="flex gap-3">
                  {['X', '🌐', 'in'].map((icon) => (
                    <div
                      key={icon}
                      className="glass-card w-10 h-10 rounded-full flex items-center justify-center cursor-pointer text-sm font-bold glass-card-hover"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left visual replaces image */}
              <Reveal variant="left" className="lg:col-span-5">
                <div className="relative aspect-[4/5] rounded-[28px] glass-card p-6 overflow-hidden flex flex-col justify-between">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 30%, rgba(255,92,26,0.35), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,181,158,0.25), transparent 45%)',
                    }}
                  />
                  <div className="relative z-10 flex flex-col gap-5 h-full">
                    <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5c1a]/20 flex items-center justify-center shrink-0">
                        <Bug size={20} className="text-[#ff5c1a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Defect logged</div>
                        <div className="text-xs text-white/50">Status updated automatically</div>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5c1a]/20 flex items-center justify-center shrink-0">
                        <Users size={20} className="text-[#ff5c1a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Assigned to squad</div>
                        <div className="text-xs text-white/50">6 role-based access levels</div>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 flex items-start gap-4 mt-auto">
                      <div className="w-10 h-10 rounded-xl bg-[#ff5c1a]/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="text-[#ff5c1a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">Release approved</div>
                        <div className="text-xs text-white/50">Quality gate passed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Right content */}
              <div className="lg:col-span-7 flex flex-col gap-10 lg:pl-12">
                <Reveal variant="right" delay={0.1}>
                  <p className="font-sora text-xl lg:text-[clamp(22px,2.5vw,30px)] font-semibold leading-snug text-white/90">
                    At Testers Home, we bring together QA engineers, managers, and developers to
                    craft bold, efficient bug-tracking experiences made with care and precision.
                  </p>
                </Reveal>

                <Reveal variant="up" delay={0.2}>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff5c1a]/20 flex items-center justify-center">
                        <Bug size={24} className="text-[#ffb59e]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">14 Defect Statuses</h4>
                        <p className="text-sm text-white/50">Full lifecycle from New to Closed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <AvatarGroup
                        items={[
                          { label: 'QA', from: '#ffb59e', to: '#ff5c1a' },
                          { label: 'DEV', from: '#ff8a4c', to: '#ff5c1a' },
                        ]}
                        size="w-10 h-10"
                        showCount={5}
                      />
                      <p className="text-sm text-white/50">6 Role-Based Access Levels</p>
                    </div>
                  </div>
                </Reveal>

                <Reveal variant="up" delay={0.3}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                    <div className="glass-card rounded-[28px] p-7 flex flex-col gap-4 glass-card-hover">
                      <span className="font-sora text-4xl font-bold text-white">500+</span>
                      <p className="text-xs font-semibold tracking-wider uppercase text-white/50">
                        Active QA Teams
                      </p>
                      <div className="flex gap-3 pt-2 text-white/20">
                        <BarChart3 size={20} />
                        <Zap size={20} />
                        <Users size={20} />
                      </div>
                      <MotionRouterLink
                        to="/register"
                        className="mt-2 w-full text-center rounded-xl bg-[#ff5c1a] px-5 py-3 text-sm font-bold text-[#521300] glow-orange-btn"
                        whileTap={{ scale: 0.98 }}
                      >
                        Book a demo
                      </MotionRouterLink>
                    </div>

                    <div className="relative rounded-[28px] bg-[#ff5c1a] p-7 overflow-hidden flex flex-col justify-between">
                      <div className="relative z-10 flex flex-col h-full justify-between text-[#521300]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider">TH® Fact</span>
                          <span className="text-xs opacity-60">01/04</span>
                        </div>
                        <div className="mt-8">
                          <span className="font-sora text-4xl font-extrabold">40%</span>
                          <p className="font-bold leading-snug mt-2">
                            Faster release cycles with real-time defect tracking.
                          </p>
                        </div>
                      </div>
                      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-black/10" />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── IMPACT / CTA ── */}
        <section className="relative py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Reveal variant="blur">
              <h2 className="font-sora text-4xl lg:text-[clamp(36px,5vw,72px)] font-bold leading-none tracking-tight mb-6">
                Track With Purpose.
                <br />
                <span className="gradient-text">Ship With Confidence.</span>
              </h2>
            </Reveal>
            <Reveal variant="up" delay={0.1}>
              <p className="text-lg leading-relaxed text-white/60 max-w-2xl mx-auto mb-16">
                We help QA teams capture every bug, assign every fix, and close every release with
                clarity and speed — powered by real-time engineering.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {impactCards.map((card, idx) => (
                <Reveal key={card.title} variant="up" delay={0.15 + idx * 0.1}>
                  <div className="glass-card rounded-3xl p-8 h-full glass-card-hover">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                      {card.icon}
                    </div>
                    <h3 className="font-sora text-2xl font-semibold tracking-tight mb-3">
                      {card.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed">{card.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full py-20 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#ff5c1a] flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="font-sora text-2xl font-bold text-[#ffb59e]">Testers Home</span>
            </Link>
            <p className="text-sm text-white/50 max-w-xs leading-relaxed">
              Shaping the future of QA workflows through human-centered defect management.
            </p>
            <div className="flex gap-5 mt-8">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-sm text-[#ffb59e]/80 hover:text-[#ffb59e] transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-white">Product</h4>
            {footerProduct.map((l) => (
              <a key={l} href="#" className="text-sm text-white/50 hover:text-[#ffb59e] transition-colors">
                {l}
              </a>
            ))}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <h4 className="font-bold text-white">Company</h4>
            {footerCompany.map((l) => (
              <a key={l} href="#" className="text-sm text-white/50 hover:text-[#ffb59e] transition-colors">
                {l}
              </a>
            ))}
          </div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            <h4 className="font-bold text-white">Subscribe</h4>
            <p className="text-xs text-white/50">Get the latest QA insights.</p>
            <div className="flex mt-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 bg-[#1f1f1f] border-none rounded-l-lg px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
              <button
                type="button"
                className="bg-[#ff5c1a] px-4 rounded-r-lg flex items-center justify-center glow-orange-btn"
              >
                <ArrowRight size={18} className="text-[#521300]" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-xs text-white/50">© 2024 Testers Home. All rights reserved.</span>
          <div className="flex gap-8">
            {footerLegal.map((l) => (
              <a key={l} href="#" className="text-xs text-white/50 hover:text-[#ffb59e] transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
