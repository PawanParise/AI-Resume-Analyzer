import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, Mail, Phone, Github, Linkedin, Award, Code2,
  TrendingUp, CheckCircle, XCircle, AlertTriangle, Copy, Download, RefreshCw,
  Hash, ChevronDown, ChevronUp, Info, AlertCircle,
} from "lucide-react";
import type { ResumeAnalysis } from "./UploadSection";
import { getScoreLabel, TECH_KEYWORD_GROUPS } from "./scoringEngine";
import { toast } from "sonner";

interface Props {
  analysis: ResumeAnalysis;
  onReset: () => void;
}

const JOB_ROLES: Record<string, string[]> = {
  "Java Developer":          ["Java", "Spring Boot", "Hibernate", "MySQL", "REST API", "Maven", "Docker", "AWS", "Microservices", "SQL"],
  "Full Stack Developer":    ["React", "Node.js", "JavaScript", "TypeScript", "MongoDB", "SQL", "REST API", "Docker", "Git", "CSS"],
  "Frontend Developer":      ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Tailwind", "Figma", "Redux", "Next.js", "Vue"],
  "Backend Developer":       ["Node.js", "Python", "Java", "SQL", "MongoDB", "REST API", "Docker", "AWS", "Redis", "PostgreSQL"],
  "Software Engineer":       ["Git", "JavaScript", "Python", "SQL", "REST API", "Linux", "Docker", "Agile", "TypeScript", "AWS"],
  "Data Analyst":            ["Python", "SQL", "Pandas", "NumPy", "Scikit-learn", "Figma", "Machine Learning", "PostgreSQL", "MongoDB", "GitHub"],
  "Python Developer":        ["Python", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "SQL", "Docker", "AWS", "PostgreSQL"],
  "Cyber Security Engineer": ["Linux", "Python", "Git", "AWS", "Docker", "SQL", "REST API", "GitHub", "Agile", "Kubernetes"],
  "AI/ML Engineer":          ["Machine Learning", "TensorFlow", "PyTorch", "Python", "Deep Learning", "Pandas", "NumPy", "Scikit-learn", "SQL", "GitHub"],
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.+]/g, "");
}

function AnimatedScore({ score }: { score: number }) {
  const { color, label } = getScoreLabel(score);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--muted)" strokeWidth="12" />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
        />
        <defs>
          <linearGradient id="atsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6c47ff" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "2.5rem", fontWeight: 700, color }}
        >
          {score}
        </motion.span>
        <span className="text-muted-foreground text-sm">/ 100</span>
        <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, delay = 0 }: { label: string; value: number; delay?: number }) {
  const { color } = getScoreLabel(value);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold" style={{ fontFamily: "JetBrains Mono, monospace", color }}>
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
        <div className="text-sm font-medium text-foreground break-all">{value}</div>
      </div>
    </div>
  );
}

function ScoreExplanationPanel({ explanation }: { explanation: ResumeAnalysis["scoreExplanation"] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-border p-6 bg-card">
      <h3
        className="text-foreground mb-5 flex items-center gap-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
      >
        <Info className="w-5 h-5 text-primary" /> Score Explanation
        <span className="text-xs font-normal text-muted-foreground ml-1">
          — why each point was awarded
        </span>
      </h3>

      <div className="space-y-2">
        {explanation.map((item, i) => {
          const { color } = getScoreLabel(item.rawScore);
          const isOpen = openIdx === i;
          return (
            <div
              key={item.category}
              className="rounded-xl border border-border overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                onClick={() => setOpenIdx(isOpen ? null : i)}
              >
                {/* Category + weight */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground">({item.weight}% weight)</span>
                    {item.weight === 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Redistributed (fresher)
                      </span>
                    )}
                  </div>
                </div>

                {/* Score chip */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className="text-sm font-bold"
                      style={{ fontFamily: "JetBrains Mono, monospace", color }}
                    >
                      {item.rawScore}/100
                    </div>
                    <div className="text-xs text-muted-foreground">
                      +{item.weighted} pts
                    </div>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.rawScore}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ul className="px-4 pb-4 pt-2 space-y-1.5 border-t border-border">
                      {item.notes.map((note, ni) => (
                        <li key={ni} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: color }}
                          />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Weighted Total</span>
        <span
          className="text-lg font-bold"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: getScoreLabel(explanation.reduce((s, e) => s + e.weighted, 0)).color,
          }}
        >
          {explanation.reduce((s, e) => s + e.weighted, 0)} / 100
        </span>
      </div>
    </div>
  );
}

export function AnalysisDashboard({ analysis, onReset }: Props) {
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [copied, setCopied] = useState<number | null>(null);

  const normText = analysis.extractedText.toLowerCase().replace(/[\s\-_.+]/g, "");
  const roleKeywords = JOB_ROLES[selectedRole] ?? [];
  const roleMatched = roleKeywords.filter((kw) =>
    normalize(kw).split("").every(() => true) && normText.includes(normalize(kw))
  );
  const roleMissing = roleKeywords.filter((kw) => !normText.includes(normalize(kw)));
  const matchPct = Math.round((roleMatched.length / roleKeywords.length) * 100);

  const copySuggestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadReport = () => {
    const { color: scoreColor, label: scoreLabel } = getScoreLabel(analysis.atsScore);
    const content = [
      "AI RESUME ANALYZER — ATS REPORT",
      "=".repeat(40),
      `File        : ${analysis.fileName}`,
      `Date        : ${new Date().toLocaleDateString()}`,
      `Profile     : ${analysis.isFresher ? "Fresher (no work experience)" : "Experienced"}`,
      "",
      `OVERALL ATS SCORE: ${analysis.atsScore}/100 — ${scoreLabel}`,
      "",
      "SCORE BREAKDOWN (weighted)",
      "-".repeat(30),
      ...analysis.scoreExplanation.map(
        (e) =>
          `${e.category.padEnd(22)} Raw: ${String(e.rawScore).padStart(3)}%  Weight: ${String(e.weight).padStart(2)}%  → +${e.weighted} pts`
      ),
      "",
      "SCORE EXPLANATION",
      "-".repeat(30),
      ...analysis.scoreExplanation.flatMap((e) => [
        `\n[${e.category}]`,
        ...e.notes.map((n) => `  • ${n}`),
      ]),
      "",
      "PERSONAL INFORMATION",
      "-".repeat(30),
      `Name     : ${analysis.personalInfo.name}`,
      `Email    : ${analysis.personalInfo.email}`,
      `Phone    : ${analysis.personalInfo.phone}`,
      `GitHub   : ${analysis.personalInfo.github}`,
      `LinkedIn : ${analysis.personalInfo.linkedin}`,
      "",
      "DETECTED SKILLS",
      "-".repeat(30),
      analysis.skills.join(", ") || "None detected",
      "",
      `KEYWORD ANALYSIS — ${selectedRole}`,
      "-".repeat(30),
      `Matched (${roleMatched.length}): ${roleMatched.join(", ") || "None"}`,
      `Missing (${roleMissing.length}): ${roleMissing.join(", ") || "None"}`,
      `Match Rate: ${matchPct}%`,
      "",
      "AI SUGGESTIONS",
      "-".repeat(30),
      ...analysis.suggestions.map((s, i) => `${i + 1}. ${s.title}\n   → ${s.reason}`),
      "",
      "RESUME STRENGTH",
      "-".repeat(30),
      `Strong Areas      : ${analysis.strongAreas.join(", ") || "—"}`,
      `Needs Improvement : ${analysis.needsImprovement.join(", ") || "—"}`,
      `Missing Sections  : ${analysis.missingSections.join(", ") || "—"}`,
      "",
      "Generated by AI Resume Analyzer · Browser-side analysis · No data stored",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ats-report-${analysis.fileName.replace(/\.[^.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ATS Report downloaded!");
  };

  const { sb } = { sb: analysis.scoreBreakdown };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.5rem" }}
          >
            Analysis Results
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">{analysis.fileName}</p>
            {analysis.isFresher && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Fresher profile
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted text-foreground transition-all"
          >
            <Download className="w-4 h-4" /> Download Report
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> New Resume
          </button>
        </div>
      </div>

      {/* Extraction warning */}
      {analysis.extractionWarning && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-xl border border-yellow-400/30 bg-yellow-400/5"
        >
          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">{analysis.extractionWarning}</p>
        </motion.div>
      )}

      {/* ATS Score + Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border p-8 bg-card text-center">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wide">
            Overall ATS Score
          </h3>
          <AnimatedScore score={analysis.atsScore} />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs mx-auto">
            {analysis.atsScore >= 81
              ? "Excellent! Your resume is highly optimized for ATS systems."
              : analysis.atsScore >= 61
              ? "Good score. A few improvements can push you into the excellent range."
              : analysis.atsScore >= 41
              ? "Fair score. Follow the suggestions below to improve significantly."
              : "Your resume needs improvements to pass ATS filters effectively."}
          </p>

          {/* Score scale legend */}
          <div className="mt-5 flex justify-center gap-4 flex-wrap">
            {[
              { label: "Poor", range: "0–40", color: "#ef4444" },
              { label: "Fair", range: "41–60", color: "#f59e0b" },
              { label: "Good", range: "61–80", color: "#22c55e" },
              { label: "Excellent", range: "81–100", color: "#06d6a0" },
            ].map(({ label, range, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-xs text-muted-foreground">
                  {label} <span style={{ fontFamily: "JetBrains Mono, monospace" }}>({range})</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-8 bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wide">
            Score Breakdown
          </h3>
          <div className="space-y-4">
            <ProgressBar label={`Skills Match (30%)`}       value={analysis.scoreBreakdown.skillsMatch}       delay={0.1} />
            <ProgressBar label={`Keywords Match (25%)`}     value={analysis.scoreBreakdown.keywordsMatch}     delay={0.2} />
            <ProgressBar label={`Projects Quality (${analysis.isFresher ? "25" : "15"}%)`} value={analysis.scoreBreakdown.projectsQuality} delay={0.3} />
            <ProgressBar label={`Experience (${analysis.isFresher ? "0" : "10"}%)`}        value={analysis.scoreBreakdown.experienceQuality} delay={0.4} />
            <ProgressBar label={`Education (10%)`}          value={analysis.scoreBreakdown.education}         delay={0.5} />
            <ProgressBar label={`Formatting (10%)`}         value={analysis.scoreBreakdown.formatting}        delay={0.6} />
          </div>
          {analysis.isFresher && (
            <p className="mt-4 text-xs text-primary bg-primary/8 rounded-lg px-3 py-2">
              Fresher mode: Experience weight redistributed to Projects section.
            </p>
          )}
        </div>
      </div>

      {/* Score Explanation */}
      <ScoreExplanationPanel explanation={analysis.scoreExplanation} />

      {/* Extracted Info */}
      <div className="rounded-2xl border border-border p-6 bg-card">
        <h3
          className="text-foreground mb-5 flex items-center gap-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
        >
          <User className="w-5 h-5 text-primary" /> Extracted Information
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <InfoCard icon={User}     label="Full Name"  value={analysis.personalInfo.name}     color="#6c47ff" />
          <InfoCard icon={Mail}     label="Email"      value={analysis.personalInfo.email}    color="#06d6a0" />
          <InfoCard icon={Phone}    label="Phone"      value={analysis.personalInfo.phone}    color="#f59e0b" />
          <InfoCard icon={Github}   label="GitHub"     value={analysis.personalInfo.github}   color="#8b5cf6" />
          <InfoCard icon={Linkedin} label="LinkedIn"   value={analysis.personalInfo.linkedin} color="#3b82f6" />
        </div>

        {analysis.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Detected Skills <span className="text-muted-foreground font-normal">({analysis.skills.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysis.certifications.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Certifications</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.certifications.map((cert) => (
                <span key={cert} className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Keyword Analysis */}
      <div className="rounded-2xl border border-border p-6 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <h3
            className="text-foreground flex items-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            <Hash className="w-5 h-5 text-primary" /> Keyword Analysis
          </h3>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/30 focus:outline-none"
          >
            {Object.keys(JOB_ROLES).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div
          className="flex items-center gap-4 mb-6 p-4 rounded-xl"
          style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.08) 0%, rgba(6,214,160,0.05) 100%)", border: "1px solid rgba(108,71,255,0.15)" }}
        >
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Match for <strong className="text-foreground">{selectedRole}</strong>
              </span>
              <span className="font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: getScoreLabel(matchPct).color }}>
                {matchPct}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6c47ff, #06d6a0)" }}
                initial={{ width: 0 }}
                animate={{ width: `${matchPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "JetBrains Mono, monospace", color: getScoreLabel(matchPct).color }}
          >
            {roleMatched.length}/{roleKeywords.length}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Matched Keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {roleMatched.length > 0
                ? roleMatched.map((kw) => (
                    <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">{kw}</span>
                  ))
                : <span className="text-sm text-muted-foreground">No matches found for this role</span>}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-foreground">Missing Keywords</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {roleMissing.length > 0
                ? roleMissing.map((kw) => (
                    <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">{kw}</span>
                  ))
                : <span className="text-sm text-muted-foreground">All keywords matched!</span>}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="rounded-2xl border border-border p-6 bg-card">
          <h3
            className="text-foreground mb-5 flex items-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            <TrendingUp className="w-5 h-5 text-primary" /> AI Suggestions
          </h3>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all group"
                style={{ background: "rgba(108,71,255,0.03)" }}
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm mb-1">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.reason}</div>
                </div>
                <button
                  onClick={() => copySuggestion(`${suggestion.title}: ${suggestion.reason}`, i)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-muted transition-all flex-shrink-0"
                  title="Copy suggestion"
                >
                  <Copy className={`w-3.5 h-3.5 ${copied === i ? "text-accent" : "text-muted-foreground"}`} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Resume Strength */}
      <div className="grid sm:grid-cols-3 gap-5">
        <StrengthCard icon={CheckCircle}  title="Strong Areas"       items={analysis.strongAreas}      color="#06d6a0" emptyText="Keep improving your resume" />
        <StrengthCard icon={AlertTriangle} title="Needs Improvement" items={analysis.needsImprovement} color="#f59e0b" emptyText="Great — no major issues!" />
        <StrengthCard icon={XCircle}      title="Missing Sections"   items={analysis.missingSections}  color="#ef4444" emptyText="All key sections present!" />
      </div>

      {/* Download */}
      <div
        className="rounded-2xl border border-border p-6 flex flex-wrap items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.06) 0%, rgba(6,214,160,0.04) 100%)" }}
      >
        <div>
          <h3
            className="text-foreground mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
          >
            Download Your Report
          </h3>
          <p className="text-sm text-muted-foreground">Full ATS analysis with score breakdown and suggestions</p>
        </div>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #6c47ff 0%, #8b5cf6 100%)", boxShadow: "0 4px 20px rgba(108,71,255,0.3)" }}
        >
          <Download className="w-4 h-4" /> Download ATS Report
        </button>
      </div>
    </motion.div>
  );
}

function StrengthCard({
  icon: Icon, title, items, color, emptyText,
}: {
  icon: React.ElementType; title: string; items: string[]; color: string; emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-5 bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}
