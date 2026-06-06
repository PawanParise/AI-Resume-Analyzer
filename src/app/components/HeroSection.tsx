import { Upload, Play, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onUploadClick: () => void;
  onDemoClick: () => void;
}

export function HeroSection({ onUploadClick, onDemoClick }: HeroSectionProps) {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-10"
          style={{ background: "radial-gradient(circle, #6c47ff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-10"
          style={{ background: "radial-gradient(circle, #06d6a0 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5 dark:opacity-5"
          style={{ background: "radial-gradient(circle, #6c47ff 0%, transparent 60%)" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text Content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary mb-6">
              <Zap className="w-3 h-3" />
              AI-Powered Resume Analysis
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 800, lineHeight: 1.1, color: "var(--foreground)" }}
          >
            Check Your Resume{" "}
            <span style={{ background: "linear-gradient(135deg, #6c47ff 0%, #06d6a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              ATS Score
            </span>{" "}
            in Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground mb-8 leading-relaxed"
            style={{ fontSize: "1.125rem", maxWidth: "520px" }}
          >
            Upload your resume and receive real AI-powered ATS analysis, keyword insights, and actionable improvement suggestions instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 hover:scale-105 hover:shadow-xl active:scale-95"
              style={{ background: "linear-gradient(135deg, #6c47ff 0%, #8b5cf6 100%)", boxShadow: "0 8px 32px rgba(108,71,255,0.35)" }}
            >
              <Upload className="w-4 h-4" />
              Upload Resume
            </button>
            <button
              onClick={onDemoClick}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-border bg-card text-foreground hover:bg-muted hover:border-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 text-primary" />
              Try Demo Resume
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-6"
          >
            {[
              "No login required",
              "Instant analysis",
              "100% private",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-accent" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Visual Cards */}
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            {/* Main ATS Score Card */}
            <div className="relative rounded-2xl border border-border p-6 shadow-2xl backdrop-blur-sm"
              style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.08) 0%, rgba(6,214,160,0.05) 100%)", borderColor: "rgba(108,71,255,0.2)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-foreground">ATS Score Analysis</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">Live</span>
              </div>

              {/* Score Ring */}
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#scoreGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{ strokeDashoffset: 251.2 * (1 - 0.82) }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6c47ff" />
                        <stop offset="100%" stopColor="#06d6a0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>82</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Skills Match", val: 88, color: "#6c47ff" },
                    { label: "Keywords", val: 75, color: "#06d6a0" },
                    { label: "Experience", val: 90, color: "#f59e0b" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground" style={{ fontFamily: "JetBrains Mono, monospace" }}>{item.val}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Matched KW", val: "24" },
                  { label: "Missing KW", val: "8" },
                  { label: "Suggestions", val: "6" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl p-3 text-center bg-muted/50">
                    <div className="text-lg font-bold text-primary" style={{ fontFamily: "JetBrains Mono, monospace" }}>{stat.val}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card 1 */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-8 rounded-xl border border-border p-3 shadow-lg backdrop-blur-sm bg-card flex items-center gap-2.5"
              style={{ borderColor: "rgba(6,214,160,0.3)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,214,160,0.15)" }}>
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">ATS Ready</div>
                <div className="text-xs text-muted-foreground">+12% this week</div>
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-8 rounded-xl border border-border p-3 shadow-lg backdrop-blur-sm bg-card flex items-center gap-2.5"
              style={{ borderColor: "rgba(108,71,255,0.3)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(108,71,255,0.15)" }}>
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Instant Analysis</div>
                <div className="text-xs text-muted-foreground">Under 10 seconds</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
