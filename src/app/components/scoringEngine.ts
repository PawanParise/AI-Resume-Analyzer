// ─── ATS Scoring Engine ───────────────────────────────────────────────────────
// All scoring is purely dynamic — derived from extracted resume text.
// No hardcoded scores or placeholder values.

export interface ScoreExplanationItem {
  category: string;
  weight: number;       // percentage weight in final score
  rawScore: number;     // 0-100 subscore for this category
  weighted: number;     // contribution to final ATS score (rawScore * weight / 100)
  notes: string[];      // human-readable breakdown points
}

export interface ScoringResult {
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
}

// ─── Weights ──────────────────────────────────────────────────────────────────
const WEIGHTS = {
  skillsMatch:      30,
  keywordsMatch:    25,
  projectsQuality:  15,
  experienceQuality:10,
  education:        10,
  formatting:       10,
} as const;

// ─── Fuzzy helpers ────────────────────────────────────────────────────────────

/** Strip spaces, hyphens, dots, underscores, dots for fuzzy comparison */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.+]/g, "");
}

/** Check if text (normalized whole-doc string) contains any alias of the keyword */
function fuzzyContains(normText: string, aliases: string[]): boolean {
  return aliases.some((alias) => normText.includes(normalize(alias)));
}

// ─── Keyword alias groups (fuzzy-friendly) ────────────────────────────────────
// Each entry: [canonical label, ...aliases]
const TECH_KEYWORD_GROUPS: [string, ...string[]][] = [
  ["JavaScript",    "javascript", "js"],
  ["TypeScript",    "typescript", "ts"],
  ["Python",        "python"],
  ["Java",          "java"],
  ["C++",           "c++", "cpp", "c plus plus"],
  ["C#",            "c#", "csharp", "c sharp"],
  ["Go",            "golang", "go lang"],
  ["Rust",          "rust"],
  ["Ruby",          "ruby"],
  ["PHP",           "php"],
  ["Swift",         "swift"],
  ["Kotlin",        "kotlin"],
  ["React",         "react", "reactjs", "react.js", "react js"],
  ["Angular",       "angular", "angularjs"],
  ["Vue",           "vue", "vuejs", "vue.js"],
  ["Next.js",       "nextjs", "next.js", "next js"],
  ["Node.js",       "nodejs", "node.js", "node js"],
  ["Express",       "express", "expressjs"],
  ["Spring Boot",   "springboot", "spring boot", "spring-boot"],
  ["Django",        "django"],
  ["Flask",         "flask"],
  ["FastAPI",       "fastapi"],
  ["Laravel",       "laravel"],
  ["SQL",           "sql"],
  ["MySQL",         "mysql"],
  ["PostgreSQL",    "postgresql", "postgres"],
  ["MongoDB",       "mongodb", "mongo"],
  ["Redis",         "redis"],
  ["Firebase",      "firebase"],
  ["Supabase",      "supabase"],
  ["AWS",           "aws", "amazon web services"],
  ["GCP",           "gcp", "google cloud"],
  ["Azure",         "azure"],
  ["Docker",        "docker"],
  ["Kubernetes",    "kubernetes", "k8s"],
  ["Git",           "git"],
  ["GitHub",        "github"],
  ["REST API",      "rest api", "restapi", "restful", "rest"],
  ["GraphQL",       "graphql"],
  ["HTML",          "html", "html5"],
  ["CSS",           "css", "css3"],
  ["Tailwind",      "tailwind", "tailwindcss"],
  ["Bootstrap",     "bootstrap"],
  ["Figma",         "figma"],
  ["Linux",         "linux", "unix"],
  ["Agile",         "agile", "scrum"],
  ["Machine Learning","machine learning", "ml"],
  ["Deep Learning", "deep learning", "dl"],
  ["TensorFlow",    "tensorflow"],
  ["PyTorch",       "pytorch"],
  ["Pandas",        "pandas"],
  ["NumPy",         "numpy"],
  ["Scikit-learn",  "scikit-learn", "sklearn"],
];

const ACTION_VERBS = [
  "developed", "built", "created", "designed", "implemented", "managed",
  "led", "optimized", "improved", "increased", "reduced", "analyzed",
  "deployed", "architected", "engineered", "delivered", "launched",
  "automated", "integrated", "collaborated", "coordinated", "achieved",
  "resolved", "maintained", "migrated", "refactored", "tested",
];

// ─── Degree patterns (fresher-friendly) ───────────────────────────────────────
const DEGREE_PATTERNS = [
  /\bb\.?\s*tech\b/i, /\bm\.?\s*tech\b/i,
  /\bb\.?\s*e\b/i,   /\bm\.?\s*e\b/i,
  /\bb\.?\s*sc\b/i,  /\bm\.?\s*sc\b/i,
  /\bbca\b/i,        /\bmca\b/i,
  /\bbba\b/i,        /\bmba\b/i,
  /\bphd\b/i,        /\bp\.?\s*h\.?\s*d\b/i,
  /\bdiploma\b/i,
  /\bbachelor/i,     /\bmaster/i,
  /\bdegree\b/i,
  /\buniversity\b/i, /\bcollege\b/i,
  /\binstitute\b/i,
];

// ─── Section detectors ────────────────────────────────────────────────────────
function detectSection(text: string, patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
}

function hasSection(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(text));
}

// ─── Skills extraction ────────────────────────────────────────────────────────
export function extractSkills(text: string): string[] {
  const normText = normalize(text);
  // Match against all tech keyword groups
  const matched: string[] = [];
  for (const [canonical, ...aliases] of TECH_KEYWORD_GROUPS) {
    if (fuzzyContains(normText, aliases)) {
      matched.push(canonical);
    }
  }

  // Also try to parse an explicit skills section for unlisted items
  const skillsSectionMatch = text.match(
    /(?:skills?|technologies|tech stack|technical skills?)[:\s]*([\s\S]{0,800}?)(?:\n{2,}|\n(?=[A-Z][A-Z\s]{2,}:)|\n(?=education|experience|project|certif|achievement|summary|objective)|$)/i
  );
  if (skillsSectionMatch) {
    const raw = skillsSectionMatch[1]
      .split(/[,•|·\n\/]/)
      .map((s) => s.trim().replace(/^\W+|\W+$/g, ""))
      .filter((s) => s.length >= 2 && s.length <= 40 && /[a-zA-Z]/.test(s));
    for (const item of raw) {
      const normItem = normalize(item);
      const alreadyCovered = TECH_KEYWORD_GROUPS.some(([, ...aliases]) =>
        aliases.some((a) => normalize(a) === normItem)
      );
      if (!alreadyCovered && !matched.some((m) => normalize(m) === normItem)) {
        matched.push(item);
      }
    }
  }

  return [...new Set(matched)].slice(0, 25);
}

// ─── Individual scoring functions ─────────────────────────────────────────────

function scoreSkillsMatch(skills: string[], text: string): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  const count = skills.length;
  notes.push(`${count} skill${count !== 1 ? "s" : ""} detected`);

  if (count === 0) {
    notes.push("No skills section or recognizable technologies found");
    return { score: 0, notes };
  }

  // Base score from count
  if (count >= 15) { score = 100; notes.push("Excellent skills breadth (15+)"); }
  else if (count >= 12) { score = 90; notes.push("Strong skills breadth (12–14)"); }
  else if (count >= 9)  { score = 80; notes.push("Good skills breadth (9–11)"); }
  else if (count >= 6)  { score = 68; notes.push("Moderate skills breadth (6–8)"); }
  else if (count >= 3)  { score = 52; notes.push("Few skills listed (3–5) — expand this section"); }
  else                  { score = 35; notes.push("Very few skills (1–2) — add more relevant technologies"); }

  // Bonus: dedicated skills section header present
  if (/\b(technical\s+)?skills?\s*:/i.test(text)) {
    score = Math.min(100, score + 5);
    notes.push("+5 bonus: dedicated Skills section found");
  }

  return { score, notes };
}

function scoreKeywordsMatch(text: string): { score: number; notes: string[]; matched: string[]; missing: string[] } {
  const normText = normalize(text);
  const notes: string[] = [];

  // Tech keyword coverage
  const matched: string[] = [];
  const missing: string[] = [];
  for (const [canonical, ...aliases] of TECH_KEYWORD_GROUPS) {
    if (fuzzyContains(normText, aliases)) matched.push(canonical);
    else missing.push(canonical);
  }

  const techRatio = matched.length / TECH_KEYWORD_GROUPS.length;
  let techScore = Math.round(techRatio * 100);
  notes.push(`${matched.length}/${TECH_KEYWORD_GROUPS.length} general tech keywords matched`);

  // Action verb coverage
  const foundVerbs = ACTION_VERBS.filter((v) => text.toLowerCase().includes(v));
  const verbScore = Math.min(100, foundVerbs.length * 6);
  notes.push(`${foundVerbs.length} action verb${foundVerbs.length !== 1 ? "s" : ""} found (${foundVerbs.slice(0, 4).join(", ")}${foundVerbs.length > 4 ? "…" : ""})`);
  if (foundVerbs.length < 4) notes.push("Add more action verbs to strengthen language");

  // Quantified achievements
  const hasQuantified = /\d+\s*%|\d+\s*x\b|\d+\s*(users?|clients?|projects?|team|people|million|thousand|\$)/i.test(text);
  const quantScore = hasQuantified ? 100 : 0;
  if (hasQuantified) notes.push("Quantified achievements detected (+bonus)");
  else notes.push("No measurable achievements found — add numbers/percentages");

  // Weighted blend: tech 50%, verbs 35%, quant 15%
  const blended = techScore * 0.50 + verbScore * 0.35 + quantScore * 0.15;

  return {
    score: Math.round(blended),
    notes,
    matched,
    missing: missing.slice(0, 12),
  };
}

function scoreProjects(text: string): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  const hasProjectsSection = hasSection(text, ["project", "projects", "personal project", "side project"]);
  if (!hasProjectsSection) {
    notes.push("No Projects section found — add one to significantly boost your score");
    return { score: 10, notes };
  }

  score += 25;
  notes.push("Projects section present (+25)");

  // Count project entries (heuristic: lines that start with a project name pattern)
  const projectsBlock = text.match(
    /\bprojects?\b[\s\S]{0,3000}?(?=\n(?:education|experience|skills|certif|achievement|work history|internship|awards?)\b|$)/i
  )?.[0] ?? "";

  // Count headings/bullets that look like project titles
  const projectTitleLines = projectsBlock.match(/\n\s*[A-Z][A-Za-z0-9 \-_]+\s*(\||–|-|:|\n)/g) ?? [];
  const projectCount = Math.max(1, projectTitleLines.length);

  if (projectCount >= 3) {
    score += 30; notes.push(`${projectCount} projects detected (+30)`);
  } else if (projectCount === 2) {
    score += 20; notes.push("2 projects detected (+20)");
  } else {
    score += 10; notes.push("1 project detected — adding more would improve score (+10)");
  }

  // Description quality (length of projects block)
  const blockLen = projectsBlock.length;
  if (blockLen > 800) {
    score += 20; notes.push("Detailed project descriptions (+20)");
  } else if (blockLen > 400) {
    score += 12; notes.push("Moderate project descriptions (+12)");
  } else {
    score += 4; notes.push("Short project descriptions — add more detail (+4)");
  }

  // Tech stack mentioned in projects
  const normBlock = normalize(projectsBlock);
  const techInProjects = TECH_KEYWORD_GROUPS.filter(([, ...aliases]) =>
    fuzzyContains(normBlock, aliases)
  ).length;
  if (techInProjects >= 5) {
    score += 15; notes.push(`${techInProjects} technologies mentioned in projects (+15)`);
  } else if (techInProjects >= 2) {
    score += 8; notes.push(`${techInProjects} technologies mentioned in projects (+8)`);
  } else {
    notes.push("Mention specific technologies used in each project");
  }

  // GitHub link in projects
  if (/github\.com\//i.test(projectsBlock)) {
    score += 10; notes.push("GitHub links present in projects (+10)");
  } else if (/github\.com\//i.test(text)) {
    score += 5; notes.push("GitHub profile present (+5)");
  }

  return { score: Math.min(100, score), notes };
}

function scoreExperience(text: string): { score: number; notes: string[]; isFresher: boolean } {
  const notes: string[] = [];
  let score = 0;
  let isFresher = false;

  const hasExperienceSection = hasSection(text, ["experience", "work experience", "work history", "employment"]);
  const hasInternship = /internship|intern\b/i.test(text);
  const hasFullTime = /\b(software engineer|developer|analyst|consultant|manager|lead|senior|junior)\b/i.test(text) &&
    /\b(20\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/i.test(text);

  if (!hasExperienceSection && !hasInternship) {
    isFresher = true;
    notes.push("No work experience found — treated as fresher");
    notes.push("Project and skills sections will carry more weight as a fresher");
    // Fresher base: 55 — projects compensate
    return { score: 55, notes, isFresher };
  }

  score = 45; // base for having something

  if (hasInternship) {
    score += 20; notes.push("Internship experience detected (+20)");
  }
  if (hasFullTime) {
    score += 30; notes.push("Full-time work experience detected (+30)");
  }
  if (hasExperienceSection) {
    notes.push("Work/Experience section present");
  }

  // Duration indicators
  const yearsMatch = text.match(/(\d+)\+?\s*years?\s+(?:of\s+)?experience/i);
  if (yearsMatch) {
    const yrs = parseInt(yearsMatch[1], 10);
    const bonus = Math.min(15, yrs * 4);
    score += bonus;
    notes.push(`${yrs}+ years of experience mentioned (+${bonus})`);
  }

  // Multiple roles
  const roleCount = (text.match(/\b(20\d{2})\s*[-–]/g) ?? []).length;
  if (roleCount >= 3) {
    score += 10; notes.push("Multiple roles/dates detected (+10)");
  }

  return { score: Math.min(100, score), notes, isFresher };
}

function scoreEducation(text: string): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  const hasEduSection = hasSection(text, ["education", "academic", "qualification"]);
  if (hasEduSection) {
    score += 20; notes.push("Education section present (+20)");
  }

  // Detect degree
  let degreeFound = false;
  for (const pattern of DEGREE_PATTERNS) {
    if (pattern.test(text)) {
      degreeFound = true;
      const match = text.match(pattern);
      notes.push(`Degree detected: "${match?.[0]?.trim()}" (+45)`);
      score += 45;
      break;
    }
  }
  if (!degreeFound) {
    notes.push("No recognized degree pattern found — add your qualification clearly");
  }

  // Institution name heuristic
  if (/\b(university|college|institute|iit|nit|bits|vit|anna|amity|manipal)\b/i.test(text)) {
    score += 15; notes.push("Institution name detected (+15)");
  }

  // Graduation year
  if (/\b(20\d{2}|19\d{2})\b/.test(text)) {
    score += 10; notes.push("Graduation year present (+10)");
  }

  // GPA/CGPA — bonus, not penalty
  if (/\b(gpa|cgpa|percentage|grade)\b/i.test(text)) {
    score += 10; notes.push("GPA/CGPA present (+10) — not required but a bonus");
  }

  return { score: Math.min(100, score), notes };
}

function scoreFormatting(
  personalInfo: { name: string; email: string; phone: string; github: string; linkedin: string },
  text: string
): { score: number; notes: string[] } {
  const notes: string[] = [];
  let score = 0;

  // Contact fields
  if (personalInfo.name !== "Not Found")   { score += 20; notes.push("Name present (+20)"); }
  else notes.push("Name not detected — ensure your name is clearly at the top");

  if (personalInfo.email !== "Not Found")  { score += 25; notes.push("Email present (+25)"); }
  else notes.push("Email not found — critical for recruiter contact");

  if (personalInfo.phone !== "Not Found")  { score += 20; notes.push("Phone present (+20)"); }
  else notes.push("Phone number not found — add for recruiter access");

  // Sections present
  if (hasSection(text, ["skills", "technical skills"]))      { score += 10; notes.push("Skills section present (+10)"); }
  if (hasSection(text, ["education", "academic"]))           { score += 10; notes.push("Education section present (+10)"); }
  if (hasSection(text, ["project", "projects"]))             { score += 10; notes.push("Projects section present (+10)"); }

  // Bonus for summary/objective
  if (/\b(summary|objective|profile|about me)\b/i.test(text)) {
    score += 5; notes.push("Professional summary/objective present (+5 bonus)");
  }

  return { score: Math.min(100, score), notes };
}

// ─── Master scoring function ──────────────────────────────────────────────────

export function computeATSScore(
  text: string,
  personalInfo: { name: string; email: string; phone: string; github: string; linkedin: string },
  skills: string[]
): ScoringResult {
  // Guard: if text is too short or obviously failed extraction
  const meaningfulChars = text.replace(/[^a-zA-Z]/g, "").length;
  let extractionWarning: string | null = null;
  if (meaningfulChars < 80) {
    extractionWarning =
      "Very little text was extracted from your resume. Results may be inaccurate. " +
      "Try uploading a text-based PDF or DOCX file for best results.";
  }

  const skillsResult      = scoreSkillsMatch(skills, text);
  const keywordsResult    = scoreKeywordsMatch(text);
  const projectsResult    = scoreProjects(text);
  const experienceResult  = scoreExperience(text);
  const educationResult   = scoreEducation(text);
  const formattingResult  = scoreFormatting(personalInfo, text);

  const { isFresher } = experienceResult;

  // For freshers: if no experience, boost projects weight at the expense of experience
  // Experience weight goes to 0 and its 10% redistributes into projects
  let effectiveWeights = { ...WEIGHTS };
  if (isFresher) {
    effectiveWeights = {
      ...WEIGHTS,
      experienceQuality: 0,
      projectsQuality: WEIGHTS.projectsQuality + WEIGHTS.experienceQuality,
    };
    experienceResult.notes.push(
      "Experience weight redistributed to Projects for fresher profile"
    );
  }

  const breakdown = {
    skillsMatch:       Math.round(skillsResult.score),
    keywordsMatch:     Math.round(keywordsResult.score),
    projectsQuality:   Math.round(projectsResult.score),
    experienceQuality: Math.round(experienceResult.score),
    education:         Math.round(educationResult.score),
    formatting:        Math.round(formattingResult.score),
  };

  // Weighted final score
  const rawFinal =
    (breakdown.skillsMatch      * effectiveWeights.skillsMatch      / 100) +
    (breakdown.keywordsMatch     * effectiveWeights.keywordsMatch     / 100) +
    (breakdown.projectsQuality   * effectiveWeights.projectsQuality   / 100) +
    (breakdown.experienceQuality * effectiveWeights.experienceQuality / 100) +
    (breakdown.education         * effectiveWeights.education         / 100) +
    (breakdown.formatting        * effectiveWeights.formatting        / 100);

  const atsScore = Math.round(Math.max(1, Math.min(99, rawFinal)));

  const scoreExplanation: ScoreExplanationItem[] = [
    {
      category: "Skills Match",
      weight: effectiveWeights.skillsMatch,
      rawScore: breakdown.skillsMatch,
      weighted: Math.round(breakdown.skillsMatch * effectiveWeights.skillsMatch / 100),
      notes: skillsResult.notes,
    },
    {
      category: "Keywords Match",
      weight: effectiveWeights.keywordsMatch,
      rawScore: breakdown.keywordsMatch,
      weighted: Math.round(breakdown.keywordsMatch * effectiveWeights.keywordsMatch / 100),
      notes: keywordsResult.notes,
    },
    {
      category: "Projects Quality",
      weight: effectiveWeights.projectsQuality,
      rawScore: breakdown.projectsQuality,
      weighted: Math.round(breakdown.projectsQuality * effectiveWeights.projectsQuality / 100),
      notes: projectsResult.notes,
    },
    {
      category: "Experience",
      weight: effectiveWeights.experienceQuality,
      rawScore: breakdown.experienceQuality,
      weighted: Math.round(breakdown.experienceQuality * effectiveWeights.experienceQuality / 100),
      notes: experienceResult.notes,
    },
    {
      category: "Education",
      weight: effectiveWeights.education,
      rawScore: breakdown.education,
      weighted: Math.round(breakdown.education * effectiveWeights.education / 100),
      notes: educationResult.notes,
    },
    {
      category: "Resume Formatting",
      weight: effectiveWeights.formatting,
      rawScore: breakdown.formatting,
      weighted: Math.round(breakdown.formatting * effectiveWeights.formatting / 100),
      notes: formattingResult.notes,
    },
  ].filter((item) => item.weight > 0);

  return {
    atsScore,
    scoreBreakdown: breakdown,
    scoreExplanation,
    isFresher,
    extractionWarning,
  };
}

// ─── Keyword lists for analysis dashboard ────────────────────────────────────
export { TECH_KEYWORD_GROUPS };

// ─── Score label ──────────────────────────────────────────────────────────────
export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 81) return { label: "Excellent", color: "#06d6a0" };
  if (score >= 61) return { label: "Good",      color: "#22c55e" };
  if (score >= 41) return { label: "Fair",      color: "#f59e0b" };
  return             { label: "Poor",      color: "#ef4444" };
}
