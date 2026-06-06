import { useState, useRef, useCallback } from "react";
import { Upload, FileText, RefreshCw, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { extractSkills, computeATSScore, TECH_KEYWORD_GROUPS } from "./scoringEngine";
import type { ScoreExplanationItem } from "./scoringEngine";

type UploadState = "empty" | "uploading" | "processing" | "success" | "error";

interface UploadSectionProps {
  onAnalysisComplete: (data: ResumeAnalysis) => void;
}

export interface ResumeAnalysis {
  fileName: string;
  fileType: string;
  extractedText: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
  };
  skills: string[];
  education: Array<{ degree: string; institution: string; year: string }>;
  experience: Array<{ title: string; company: string; duration: string; description: string }>;
  projects: Array<{ name: string; description: string; tech: string[] }>;
  certifications: string[];
  atsScore: number;
  scoreBreakdown: {
    skillsMatch: number;
    keywordsMatch: number;
    projectsQuality: number;
    experienceQuality: number;
    education: number;
    formatting: number;
  };
  scoreExplanation: ScoreExplanationItem[];
  isFresher: boolean;
  extractionWarning: string | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{ title: string; reason: string }>;
  strongAreas: string[];
  needsImprovement: string[];
  missingSections: string[];
}

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = [".pdf", ".docx", ".jpg", ".jpeg", ".png"];
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];

// ─── Text extraction ───────────────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Extract ASCII text sequences from raw PDF bytes
    let raw = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 32 && b < 127) raw += String.fromCharCode(b);
      else if (b === 10 || b === 13) raw += "\n";
    }

    // Pull out readable word sequences (3+ chars)
    const sequences = raw.match(/[A-Za-z0-9@._+\-\s,:/]{3,}/g) ?? [];
    const extracted = sequences.join("\n").replace(/\s{3,}/g, "\n").trim();
    return extracted;
  }

  if (
    file.type.includes("wordprocessingml") ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // DOCX is a zip: extract visible ASCII chars (XML text nodes will appear)
    let raw = "";
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 32 && b < 127) raw += String.fromCharCode(b);
      else if (b === 10 || b === 13) raw += "\n";
    }
    // Strip XML tags
    const text = raw.replace(/<[^>]{0,200}>/g, " ").replace(/\s{3,}/g, "\n").trim();
    return text;
  }

  if (file.type.startsWith("image/")) {
    // Image uploads — return a minimal stub so the error path is triggered
    return "";
  }

  return await file.text();
}

// ─── Resume info extraction ────────────────────────────────────────────────────

function extractPersonalInfo(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const name =
    lines.find(
      (l) =>
        /^[A-Z][a-z]+([\s][A-Z][a-z]+){1,3}$/.test(l) &&
        !/\b(resume|cv|curriculum|vitae|profile|summary)\b/i.test(l)
    ) ?? "Not Found";

  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch?.[0] ?? "Not Found";

  // Phone: look for sequences that are plausibly phone numbers
  const phoneMatch = text.match(
    /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/
  );
  const phone = phoneMatch?.[0]?.trim() ?? "Not Found";

  const githubMatch = text.match(/github\.com\/([A-Za-z0-9\-_]+)/i);
  const github = githubMatch ? `github.com/${githubMatch[1]}` : "Not Found";

  const linkedinMatch = text.match(/linkedin\.com\/in\/([A-Za-z0-9\-_%]+)/i);
  const linkedin = linkedinMatch ? `linkedin.com/in/${linkedinMatch[1]}` : "Not Found";

  return { name, email, phone, github, linkedin };
}

function buildSuggestions(
  personalInfo: ReturnType<typeof extractPersonalInfo>,
  skills: string[],
  text: string
): Array<{ title: string; reason: string }> {
  const s: Array<{ title: string; reason: string }> = [];

  if (personalInfo.email === "Not Found")
    s.push({ title: "Add your email address", reason: "ATS systems and recruiters need a contact email to reach you." });
  if (personalInfo.phone === "Not Found")
    s.push({ title: "Add your phone number", reason: "Most recruiters contact candidates via phone for initial screening." });
  if (personalInfo.github === "Not Found")
    s.push({ title: "Add your GitHub profile", reason: "A GitHub link validates technical skills and shows real project work." });
  if (personalInfo.linkedin === "Not Found")
    s.push({ title: "Add your LinkedIn URL", reason: "LinkedIn profiles significantly increase recruiter trust and visibility." });
  if (!/\b(summary|objective|profile|about)\b/i.test(text))
    s.push({ title: "Add a Professional Summary", reason: "A 2–3 line summary at the top captures recruiter attention and boosts ATS match." });
  if (!/\d+\s*%|\d+\s*x\b|\d+\s*(users?|clients?|million|thousand|\$)/i.test(text))
    s.push({ title: "Add measurable achievements", reason: "Quantified results like '40% faster' or '10,000 users' make your impact concrete." });
  if (skills.length < 8)
    s.push({ title: "Expand your Skills section", reason: "More relevant technologies improve keyword match rates for ATS filters." });
  if (!/\bproject/i.test(text))
    s.push({ title: "Add a Projects section", reason: "Projects prove hands-on experience, especially important for freshers." });
  if (
    !/\b(developed|built|created|implemented|designed|optimized|led|managed|delivered)\b/i.test(text)
  )
    s.push({ title: "Use stronger action verbs", reason: "Verbs like 'developed', 'optimized', 'led' raise ATS keyword score." });

  return s;
}

function buildStrengthAreas(breakdown: ResumeAnalysis["scoreBreakdown"]): {
  strongAreas: string[];
  needsImprovement: string[];
} {
  const labels: Record<keyof typeof breakdown, string> = {
    skillsMatch:       "Technical Skills",
    keywordsMatch:     "Keyword Density",
    projectsQuality:   "Projects Section",
    experienceQuality: "Work Experience",
    education:         "Education",
    formatting:        "Resume Formatting",
  };
  const strongAreas: string[] = [];
  const needsImprovement: string[] = [];
  for (const [key, label] of Object.entries(labels) as [keyof typeof breakdown, string][]) {
    if (breakdown[key] >= 70) strongAreas.push(label);
    else if (breakdown[key] < 55) needsImprovement.push(label);
  }
  return { strongAreas, needsImprovement };
}

function buildMissingSections(
  personalInfo: ReturnType<typeof extractPersonalInfo>,
  text: string
): string[] {
  const missing: string[] = [];
  if (!/\b(summary|objective|profile|about)\b/i.test(text)) missing.push("Professional Summary");
  if (personalInfo.github === "Not Found") missing.push("GitHub Profile");
  if (personalInfo.linkedin === "Not Found") missing.push("LinkedIn Profile");
  if (!/\bcertif/i.test(text)) missing.push("Certifications");
  if (!/\b(award|achievement|honor)\b/i.test(text)) missing.push("Awards / Achievements");
  return missing;
}

// ─── Main parse function ───────────────────────────────────────────────────────

function buildResumeAnalysis(text: string, fileName: string, fileType: string): ResumeAnalysis {
  const personalInfo = extractPersonalInfo(text);
  const skills = extractSkills(text);

  const scoring = computeATSScore(text, personalInfo, skills);

  const suggestions = buildSuggestions(personalInfo, skills, text);
  const { strongAreas, needsImprovement } = buildStrengthAreas(scoring.scoreBreakdown);
  const missingSections = buildMissingSections(personalInfo, text);

  // Education — detect and format
  const eduMatch = text.match(
    /\b(b\.?\s*tech|m\.?\s*tech|b\.?\s*e|m\.?\s*e|b\.?\s*sc|m\.?\s*sc|bca|mca|bba|mba|phd|p\.?\s*h\.?\s*d|diploma|bachelor|master|degree)[^\n]{0,120}/i
  );
  const education = eduMatch
    ? [{ degree: eduMatch[0].trim().slice(0, 80), institution: "", year: "" }]
    : [];

  // Experience
  const expSection = text.match(
    /\b(?:experience|work experience|work history|employment)\b[\s\S]{0,2000}?(?=\n(?:education|project|skills|certif|award|achievement)|$)/i
  );
  const experience = expSection
    ? [{ title: "Detected", company: "", duration: "", description: expSection[0].slice(0, 300) }]
    : [];

  // Projects
  const projSection = text.match(
    /\bprojects?\b[\s\S]{0,3000}?(?=\n(?:education|experience|skills|certif|award|achievement|work)|$)/i
  );
  const projects = projSection
    ? [{ name: "Detected", description: projSection[0].slice(0, 300), tech: skills.slice(0, 5) }]
    : [];

  // Certifications
  const certSection = text.match(/\bcertif[\s\S]{0,600}?(?=\n\n|\n(?=[A-Z])|\n(?:education|experience|project|skills)|$)/i);
  const certifications = certSection
    ? certSection[0]
        .split("\n")
        .slice(1)
        .map((l) => l.trim())
        .filter((l) => l.length > 4 && l.length < 120)
        .slice(0, 6)
    : [];

  // Keyword lists (general pool — role-specific ones are handled in the dashboard)
  const normText = text.toLowerCase().replace(/[\s\-_.+]/g, "");
  const allMatched: string[] = [];
  const allMissing: string[] = [];
  for (const [canonical, ...aliases] of TECH_KEYWORD_GROUPS) {
    const found = aliases.some((a) => normText.includes(a.toLowerCase().replace(/[\s\-_.+]/g, "")));
    if (found) allMatched.push(canonical);
    else allMissing.push(canonical);
  }

  return {
    fileName,
    fileType,
    extractedText: text,
    personalInfo,
    skills,
    education,
    experience,
    projects,
    certifications,
    atsScore: scoring.atsScore,
    scoreBreakdown: scoring.scoreBreakdown,
    scoreExplanation: scoring.scoreExplanation,
    isFresher: scoring.isFresher,
    extractionWarning: scoring.extractionWarning,
    matchedKeywords: allMatched,
    missingKeywords: allMissing.slice(0, 12),
    suggestions,
    strongAreas,
    needsImprovement,
    missingSections,
  };
}

// ─── Upload UI Component ───────────────────────────────────────────────────────

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const [state, setState] = useState<UploadState>("empty");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (f.size > MAX_SIZE) return "File size exceeds 10 MB limit.";
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXT.includes(ext) && !ALLOWED_TYPES.includes(f.type)) {
      return "Unsupported format. Please upload PDF, DOCX, JPG, or PNG.";
    }
    return null;
  };

  const processFile = useCallback(
    async (f: File) => {
      const err = validateFile(f);
      if (err) {
        setError(err);
        setState("error");
        toast.error(err);
        return;
      }

      setFile(f);
      setState("uploading");
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress((p) => {
          if (p >= 88) { clearInterval(interval); return 88; }
          return p + Math.random() * 18;
        });
      }, 130);

      await new Promise((r) => setTimeout(r, 1400));
      clearInterval(interval);
      setUploadProgress(100);
      setState("processing");
      toast.info("Analyzing your resume with ATS engine…");
      await new Promise((r) => setTimeout(r, 900));

      try {
        const text = await extractTextFromFile(f);

        // Image uploads: no text available
        if (f.type.startsWith("image/") || text.replace(/[^a-zA-Z]/g, "").length < 80) {
          setState("error");
          const msg =
            f.type.startsWith("image/")
              ? "Image resumes require OCR which is not available in this browser. Please upload a PDF or DOCX for accurate analysis."
              : "Very little text could be extracted from this file. Please upload a text-based PDF or DOCX resume.";
          setError(msg);
          toast.error("Text extraction failed");
          return;
        }

        const analysis = buildResumeAnalysis(text, f.name, f.type);
        setState("success");
        toast.success(`ATS Score: ${analysis.atsScore}/100 — Analysis complete!`);
        onAnalysisComplete(analysis);
      } catch (e) {
        setState("error");
        setError("Failed to process the file. Please try a different file.");
        toast.error("Analysis failed. Please try again.");
      }
    },
    [onAnalysisComplete]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  };

  const reset = () => {
    setState("empty");
    setFile(null);
    setError("");
    setUploadProgress(0);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileInput}
      />

      <AnimatePresence mode="wait">
        {state === "empty" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <motion.div
              animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
            >
              <Upload className="w-7 h-7 text-primary" />
            </motion.div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.15rem" }} className="mb-2 text-foreground">
              {dragOver ? "Drop your resume here" : "Drag & drop your resume"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">or click to browse files</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["PDF", "DOCX", "JPG", "PNG"].map((fmt) => (
                <span key={fmt} className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                  {fmt}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Maximum file size: 10 MB · Best results with PDF or DOCX</p>
          </motion.div>
        )}

        {(state === "uploading" || state === "processing") && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-border p-8 text-center bg-card"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {state === "processing"
                ? <Loader2 className="w-7 h-7 text-primary animate-spin" />
                : <FileText className="w-7 h-7 text-primary" />}
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }} className="mb-1 text-foreground">
              {state === "uploading" ? "Uploading Resume…" : "Running ATS Engine…"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{file?.name}</p>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #6c47ff 0%, #06d6a0 100%)" }}
                animate={{ width: `${state === "processing" ? 100 : uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {state === "processing"
                ? "Scoring skills, keywords, projects, education…"
                : `${Math.round(uploadProgress)}%`}
            </p>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-accent/30 p-8 text-center bg-card"
            style={{ background: "linear-gradient(135deg, rgba(6,214,160,0.05) 0%, rgba(108,71,255,0.05) 100%)" }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(6,214,160,0.15)" }}>
              <CheckCircle className="w-7 h-7 text-accent" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }} className="mb-1 text-foreground">
              Analysis Complete!
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{file?.name} · Scroll down for results</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-all text-foreground mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Upload Another
            </button>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-destructive/30 p-8 text-center bg-card"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)" }}>
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }} className="mb-1 text-foreground">
              Could Not Analyze Resume
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{error}</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground mx-auto hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
