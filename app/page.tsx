"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CanvasRevealEffect, MiniNavbar } from "@/components/ui/sign-in-flow-1";
import { SpringDotsCanvas } from "@/components/ui/SpringDotsCanvas";

export default function HomePage() {
  return (
    <div className="flex w-[100%] flex-col min-h-screen bg-black dark:bg-black light:bg-white relative selection:bg-white/20 selection:text-white transition-colors duration-300">
      {/* Spring dots physics canvas background */}
      <SpringDotsCanvas />

      {/* Canvas reveal background matching login page */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-transparent"
            colors={[
              [255, 255, 255],
              [255, 255, 255],
            ]}
            dotSize={6}
            reverse={false}
          />
        </div>
      </div>


      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top Navbar matching login page */}
        <MiniNavbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

/* ──────────────────────── Hero Section ──────────────────────── */
function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer hover:bg-white hover:text-black hover:border-white transition-all shadow-sm hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] group"
        >
          <span className="w-2 h-2 rounded-full bg-white group-hover:bg-black animate-pulse" />
          <span className="text-xs text-white/70 group-hover:text-black font-medium tracking-wide transition-colors">AI-Powered Architecture Analysis</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
        >
          Welcome to <br />
          <span className="text-white">TeamMerge Pro</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed"
        >
          Upload your project, let AI analyze every file, dependency, and connection. 
          Visualize, edit, and regenerate — all from an interactive flow graph.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-full bg-white text-black font-semibold py-3.5 px-8 hover:bg-white/90 hover:scale-105 transition-all text-sm shadow-lg shadow-white/20 hover:shadow-[0_10px_35px_rgba(255,255,255,0.4)]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-full border border-white/10 bg-transparent text-white font-medium py-3.5 px-8 hover:bg-white hover:text-black hover:border-white hover:scale-105 transition-all text-sm hover:shadow-[0_10px_35px_rgba(255,255,255,0.3)]"
          >
            Sign In to Workspace
          </Link>
        </motion.div>

        {/* Mockup Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03, y: -6 }}
          transition={{ duration: 0.4 }}
          className="mt-16 relative w-full max-w-3xl mx-auto cursor-pointer group"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-2xl group-hover:border-white group-hover:bg-white/[0.08] group-hover:shadow-[0_25px_60px_rgba(255,255,255,0.2)] transition-all duration-400">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 flex-1 h-5 rounded-full bg-white/5 max-w-xs" />
            </div>
            
            {/* Architectural diagram mockup */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-6 flex items-center justify-center group-hover:border-white/30 transition-colors">
              <svg viewBox="0 0 400 180" className="w-full h-auto max-h-[220px]">
                <defs>
                  <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <rect x="20" y="70" width="80" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x="60" y="94" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="500">App.tsx</text>

                <rect x="150" y="25" width="80" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x="190" y="49" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="500">Header</text>

                <rect x="150" y="70" width="80" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x="190" y="94" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="500">Router</text>

                <rect x="150" y="115" width="80" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <text x="190" y="139" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="500">Footer</text>

                <rect x="280" y="70" width="80" height="40" rx="20" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
                <text x="320" y="94" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="600">Dashboard</text>

                <line x1="100" y1="90" x2="150" y2="45" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
                <line x1="100" y1="90" x2="150" y2="90" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
                <line x1="100" y1="90" x2="150" y2="135" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
                <line x1="230" y1="90" x2="280" y2="90" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────────────────── Features Section ──────────────────────── */
const features = [
  {
    title: "Complete Project Ingestion",
    description: "Upload your entire codebase — any framework or language. Automatic file indexing and dependency resolution.",
  },
  {
    title: "AI Structure Blueprinting",
    description: "Generates intuitive node graphs mapping imports, APIs, data pipelines, and architectural boundaries.",
  },
  {
    title: "Interactive Flow Graph",
    description: "Zoomable, drag-and-drop node graph allows you to restructure modules and test code paths visually.",
  },
  {
    title: "Real-time Live Preview",
    description: "Preview how architectural changes impact compilation, performance, and cross-module dependencies.",
  },
  {
    title: "Smart Code Restructuring",
    description: "Re-organize directories or refactor legacy code blocks with AI-guided automated code transformations.",
  },
  {
    title: "One-Click Export",
    description: "Generate a clean, production-ready codebase complete with config files and build scripts.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Built for Modern Engineering
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto font-light">
            Everything you need to analyze, refactor, and master project architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center group cursor-pointer transition-colors duration-300 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)]"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-4 text-white text-sm font-mono group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                0{i + 1}
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-black transition-colors mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-white/50 group-hover:text-black/70 transition-colors leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── How It Works Section ──────────────────────── */
const steps = [
  { step: "01", title: "Upload Codebase", desc: "Drop your project folder or connect a repository." },
  { step: "02", title: "AI Analysis", desc: "AI maps all dependencies, files, and module relationships." },
  { step: "03", title: "Visual Edit", desc: "Drag, connect, and restructure your project flow graph." },
  { step: "04", title: "Generate Project", desc: "Export a clean, production-ready code output instantly." },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            How TeamMerge Pro Works
          </h2>
          <p className="text-sm sm:text-base text-white/50 max-w-xl mx-auto font-light">
            4 simple steps from raw code upload to optimized architectural output.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.06, y: -8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 text-center space-y-3 group cursor-pointer transition-colors duration-300 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_20px_60px_rgba(255,255,255,0.25)]"
            >
              <span className="text-xs font-mono text-white/40 group-hover:text-black/60 tracking-wider uppercase block transition-colors">{s.step}</span>
              <h3 className="text-base font-semibold text-white group-hover:text-black transition-colors">{s.title}</h3>
              <p className="text-xs text-white/50 group-hover:text-black/70 transition-colors font-light leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Stats Section ──────────────────────── */
function StatsSection() {
  return (
    <section className="relative py-20 px-6 border-y border-white/10 bg-black/40">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { stat: "100%", label: "Automated Analysis" },
          { stat: "10x", label: "Faster Refactoring" },
          { stat: "50+", label: "Languages Supported" },
          { stat: "0", label: "Manual Configs" },
        ].map((st, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.08, y: -4 }}
            className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white hover:text-black hover:border-white hover:shadow-[0_20px_50px_rgba(255,255,255,0.25)] transition-all duration-300 cursor-pointer group"
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-black transition-colors">{st.stat}</div>
            <div className="text-xs text-white/40 group-hover:text-black/70 transition-colors mt-1 uppercase tracking-wider font-mono">{st.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────── Footer ──────────────────────── */
function Footer() {
  return (
    <footer className="relative py-12 px-6 border-t border-white/10 text-center space-y-4">
      <div className="text-sm font-semibold text-white/90">TeamMerge Pro</div>
      <p className="text-xs text-white/30">
        © 2026 TeamMerge Pro. All rights reserved.
      </p>
    </footer>
  );
}
