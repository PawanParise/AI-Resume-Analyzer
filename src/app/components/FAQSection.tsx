import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    q: "What is ATS?",
    a: "ATS stands for Applicant Tracking System. It's software used by companies to automatically scan, filter, and rank resumes before a human recruiter reviews them. An ATS parses your resume for keywords, formatting, and relevance to the job description.",
  },
  {
    q: "How does ATS Score Work?",
    a: "Your ATS score is calculated based on multiple factors: keyword density matching your target role, skills presence, action verb usage, quantified achievements, resume formatting quality, and completeness of key sections like experience, education, and contact information.",
  },
  {
    q: "Is Login Required?",
    a: "No! AI Resume Analyzer requires absolutely no login or signup. Simply upload your resume and get instant results. Your privacy is our priority.",
  },
  {
    q: "Which File Formats Are Supported?",
    a: "We support PDF, DOCX, JPG, and PNG file formats. PDF and DOCX files provide the most accurate text extraction and analysis. Image formats (JPG/PNG) are also supported. Maximum file size is 10MB.",
  },
  {
    q: "Is My Resume Secure?",
    a: "Yes, your resume is processed entirely in your browser. Your document is never stored on any server or shared with third parties. Once you close the tab, all data is gone. Your privacy and security are guaranteed.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary mb-4">
            FAQ
          </span>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }} className="text-foreground">
            Frequently Asked{" "}
            <span style={{ background: "linear-gradient(135deg, #6c47ff 0%, #06d6a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Questions
            </span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border overflow-hidden bg-card"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-foreground pr-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.95rem" }}>
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-5 text-muted-foreground leading-relaxed border-t border-border pt-4" style={{ fontSize: "0.9rem" }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
