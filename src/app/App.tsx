import { useState, useEffect, useRef } from "react";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Upload, ArrowDown } from "lucide-react";

import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { UploadSection, type ResumeAnalysis } from "./components/UploadSection";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { FAQSection } from "./components/FAQSection";
import { Footer } from "./components/Footer";


const DEMO_ANALYSIS: ResumeAnalysis = {
  fileName: "demo-resume.pdf",
  fileType: "application/pdf",
  extractedText: `John Developer
john.developer@email.com  +1 555 123 4567
github.com/johndeveloper  linkedin.com/in/johndeveloper

Summary
Full Stack Developer with 2 years of experience building scalable web applications.

Skills
JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker, Git, MongoDB, REST API, HTML, CSS

Experience
Software Engineer — Tech Corp  2022 – Present
Developed and maintained web applications using React and Node.js.
Improved API response time by 40%. Led a team of 3 engineers.

Projects
E-Commerce Platform | React, Node.js, MongoDB, Docker
Built a full-stack e-commerce app serving 10,000 users.
github.com/johndeveloper/ecommerce

Task Manager | React, Firebase, TypeScript
Developed a real-time task management app with authentication.
github.com/johndeveloper/taskmanager

Education
B.Tech Computer Science — State University  2022

Certifications
AWS Certified Developer
Google Cloud Professional`,
  personalInfo: {
    name: "John Developer",
    email: "john.developer@email.com",
    phone: "+1 555 123 4567",
    github: "github.com/johndeveloper",
    linkedin: "linkedin.com/in/johndeveloper",
  },
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git", "MongoDB", "REST API", "HTML", "CSS", "Firebase"],
  education: [{ degree: "B.Tech Computer Science", institution: "State University", year: "2022" }],
  experience: [{ title: "Software Engineer", company: "Tech Corp", duration: "2022 – Present", description: "Developed and maintained web applications using React and Node.js. Improved API response time by 40%." }],
  projects: [
    { name: "E-Commerce Platform", description: "Built a full-stack e-commerce app with React, Node.js, and MongoDB serving 10,000 users.", tech: ["React", "Node.js", "MongoDB", "Docker"] },
    { name: "Task Manager", description: "Real-time task management app with Firebase authentication.", tech: ["React", "Firebase", "TypeScript"] },
  ],
  certifications: ["AWS Certified Developer", "Google Cloud Professional"],
  atsScore: 84,
  scoreBreakdown: {
    skillsMatch: 95,
    keywordsMatch: 82,
    projectsQuality: 88,
    experienceQuality: 80,
    education: 90,
    formatting: 100,
  },
  scoreExplanation: [
    { category: "Skills Match", weight: 30, rawScore: 95, weighted: 29, notes: ["14 skills detected", "Excellent skills breadth (12+)", "+5 bonus: dedicated Skills section found"] },
    { category: "Keywords Match", weight: 25, rawScore: 82, weighted: 21, notes: ["28/50 general tech keywords matched", "6 action verbs found (developed, improved, built, led, maintained, serving)", "Quantified achievements detected (+bonus)"] },
    { category: "Projects Quality", weight: 15, rawScore: 88, weighted: 13, notes: ["Projects section present (+25)", "2 projects detected (+20)", "Detailed project descriptions (+20)", "5 technologies mentioned in projects (+15)", "GitHub links present in projects (+10)"] },
    { category: "Experience", weight: 10, rawScore: 80, weighted: 8, notes: ["Work/Experience section present", "Full-time work experience detected (+30)", "2+ years of experience mentioned"] },
    { category: "Education", weight: 10, rawScore: 90, weighted: 9, notes: ["Education section present (+20)", "Degree detected: 'B.Tech' (+45)", "Institution name detected (+15)", "Graduation year present (+10)"] },
    { category: "Resume Formatting", weight: 10, rawScore: 100, weighted: 10, notes: ["Name present (+20)", "Email present (+25)", "Phone present (+20)", "Skills section present (+10)", "Education section present (+10)", "Projects section present (+10)", "Professional summary/objective present (+5 bonus)"] },
  ],
  isFresher: false,
  extractionWarning: null,
  matchedKeywords: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "AWS", "Docker", "Git", "MongoDB", "REST API", "HTML", "CSS", "Firebase"],
  missingKeywords: ["Kubernetes", "GraphQL", "Redis", "Angular", "Vue"],
  suggestions: [
    { title: "Add more measurable results", reason: "Include specific metrics in each role (e.g., 'reduced load time by 60%')." },
    { title: "Add open-source contributions", reason: "Open-source work on GitHub further validates your technical skills." },
    { title: "Consider adding Kubernetes", reason: "K8s is frequently required for senior full-stack and backend roles." },
  ],
  strongAreas: ["Technical Skills", "Projects Section", "Resume Formatting", "Education"],
  needsImprovement: [],
  missingSections: ["Certifications Detail"],
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const uploadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.4 }
    );
    ["home", "features", "upload", "faq"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAnalysisComplete = (data: ResumeAnalysis) => {
    setAnalysis(data);
    setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleReset = () => {
    setAnalysis(null);
    scrollToUpload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors theme={darkMode ? "dark" : "light"} />

      <Navbar
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(!darkMode)}
        onUploadClick={scrollToUpload}
        activeSection={activeSection}
      />

      <HeroSection
        onUploadClick={scrollToUpload}
        onDemoClick={() => {
          setAnalysis(DEMO_ANALYSIS);
          setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 300);
        }}
      />

      <FeaturesSection />

      {/* Upload Section */}
      <section id="upload" className="py-20 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #6c47ff 0%, transparent 70%)" }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary mb-4">
              <Upload className="w-3 h-3" />
              Get Started Free
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }} className="text-foreground">
              Upload Your{" "}
              <span style={{ background: "linear-gradient(135deg, #6c47ff 0%, #06d6a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Resume
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground" style={{ fontSize: "1.05rem" }}>
              Get your real ATS score in under 10 seconds. No login. No signup.
            </p>
          </motion.div>

          <div ref={uploadRef}>
            <UploadSection onAnalysisComplete={handleAnalysisComplete} />
          </div>

          {!analysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center mt-8"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-muted-foreground/50"
              >
                <ArrowDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <section id="results" className="py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnalysisDashboard analysis={analysis} onReset={handleReset} />
            </div>
          </section>
        )}
      </AnimatePresence>

      <FAQSection />
      <Footer />
    </div>
  );
}
