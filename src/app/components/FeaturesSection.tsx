import { FileText, Image, BarChart3, Hash, AlertCircle, Lightbulb, Activity, Download } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: FileText,
    title: "PDF Resume Upload",
    description: "Upload PDF resumes with instant text extraction and parsing for accurate ATS analysis.",
    color: "#6c47ff",
    bg: "rgba(108,71,255,0.1)",
  },
  {
    icon: Image,
    title: "Image Resume Upload",
    description: "Support for JPG and PNG resume images with OCR-powered text recognition.",
    color: "#06d6a0",
    bg: "rgba(6,214,160,0.1)",
  },
  {
    icon: BarChart3,
    title: "Real ATS Analysis",
    description: "Genuine ATS scoring based on industry-standard applicant tracking system criteria.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: Hash,
    title: "Keyword Detection",
    description: "Detect and highlight relevant keywords matching your target job role requirements.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  {
    icon: AlertCircle,
    title: "Missing Skills Detection",
    description: "Identify gaps in your skill set compared to industry-standard job requirements.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
  },
  {
    icon: Lightbulb,
    title: "AI Suggestions",
    description: "Receive personalized, actionable suggestions to improve your resume quality and ATS score.",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
  {
    icon: Activity,
    title: "Resume Strength",
    description: "Comprehensive strength analysis identifying strong areas and sections needing improvement.",
    color: "#06d6a0",
    bg: "rgba(6,214,160,0.1)",
  },
  {
    icon: Download,
    title: "Download ATS Report",
    description: "Export a detailed PDF report of your ATS analysis to share or reference anytime.",
    color: "#6c47ff",
    bg: "rgba(108,71,255,0.1)",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6c47ff 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary mb-4">
            Everything You Need
          </span>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.2 }}>
            Powerful Resume Analysis{" "}
            <span style={{ background: "linear-gradient(135deg, #6c47ff 0%, #06d6a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Features
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto" style={{ fontSize: "1.05rem" }}>
            Every tool you need to optimize your resume and land more interviews.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-border p-6 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-default"
              style={{ "--hover-shadow": `0 20px 60px ${feature.color}20` } as React.CSSProperties}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: feature.bg }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="mb-2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem", fontWeight: 700 }}>
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed" style={{ fontSize: "0.85rem" }}>
                {feature.description}
              </p>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}08 0%, transparent 60%)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
