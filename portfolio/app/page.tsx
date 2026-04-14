"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, Linkedin, ExternalLink, MapPin, Github } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

const fadeIn = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Home() {
  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-16 md:px-8 md:py-24 space-y-20">
      <Header />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Awards />
      <Education />
      <Contact />
    </main>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
      {children}
    </h2>
  )
}

function Header() {
  return (
    <motion.header {...fadeIn} className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Akshay Poothamkotil
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-500 dark:text-gray-400">
          Software Development Engineer II · Amazon
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} />
            Hyderabad, India
          </span>
          <a
            href="https://github.com/notakshayp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Github size={13} />
            notakshayp
          </a>
        </div>
      </div>
      <ThemeToggle />
    </motion.header>
  )
}

function About() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <SectionHeading>About</SectionHeading>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        Backend engineer with 5+ years across Cisco and Amazon, working on distributed systems, AWS services, and LLM integration. Most recently led the design and launch of a Bedrock + RAG marketing content validator at Amazon that cut review time by 50% and iterations by 70%. I like owning services from design through production.
      </p>
    </motion.section>
  )
}

const skillGroups = [
  {
    label: "Languages",
    items: ["Java", "Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    label: "Backend",
    items: ["Microservices", "REST APIs", "Step Functions", "Event-driven", "Flask", "FastAPI"],
  },
  {
    label: "AI / LLM",
    items: ["Amazon Bedrock", "RAG", "Knowledge Bases", "Vector Search", "Prompt Engineering"],
  },
  {
    label: "Cloud & Infra",
    items: ["AWS Lambda", "API Gateway", "DynamoDB", "S3", "CDK", "ECS", "GCP Cloud Run", "Firestore"],
  },
  {
    label: "Data & Tools",
    items: ["PostgreSQL", "MongoDB", "Redis", "Docker", "Jenkins"],
  },
  {
    label: "Frontend",
    items: ["React", "Next.js"],
  },
]

function Skills() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <SectionHeading>Skills</SectionHeading>
      <div className="space-y-3">
        {skillGroups.map(({ label, items }) => (
          <div key={label} className="flex gap-4 items-start">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium w-24 shrink-0 pt-1">
              {label}
            </span>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-0.5 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

const experiences = [
  {
    company: "Amazon",
    role: "Software Development Engineer II",
    team: "AB Marketing Tech · Marketly",
    period: "May 2025 – Present",
    highlights: [
      "Designed and launched a worldwide Bedrock + RAG content validation service — cut review time 50%, iterations 70%, accuracy >90% against human review.",
      "Architected a Step Functions pipeline with parallel AI + rules agents, DynamoDB for state, S3 for payloads, and a Bedrock knowledge base built from brand guidelines.",
      "Ran the 14-milestone launch (CDK infra, monolith extraction, 4 API migrations, E2E/UAT, production cutover). Zero Sev-1s at launch.",
      "Re-architected a batch pipeline to S3 offloading — 3× throughput, fixed recurring payload-size failures.",
      "Mentored 3 SDE1s through the launch; each owned a full workstream by the end.",
    ],
  },
  {
    company: "Cisco",
    role: "Software Engineer (G6)",
    team: "IT Engineering",
    period: "Mar 2024 – May 2025",
    highlights: [
      "Built an Order Workflow System (React/Next.js + Flask) from Figma mocks, replacing a legacy internal tool.",
      "Integrated SmartBuy/Ariba purchase approvals into Webex chat so users could approve orders without leaving the client.",
      "Resolved 1,400+ security vulnerabilities and added CI/CD security gates across Jenkins, Spinnaker, and Red Hat Quay.",
    ],
  },
  {
    company: "Cisco",
    role: "Business Systems Analyst (G4 → G6)",
    team: "IT Engineering",
    period: "Aug 2021 – Mar 2024",
    highlights: [
      "Led SOXCET, a SOX compliance platform (Angular + Flask on OpenShift) covering 70+ controls — cut audit prep effort 60%+ and evidence collection from days to minutes.",
      "Wrote Python pipelines to collect and verify audit evidence across internal IT systems.",
      "Migrated the Saviynt identity platform to the cloud with zero downtime.",
    ],
  },
  {
    company: "Cisco",
    role: "Business Analyst Intern",
    team: "IT Engineering",
    period: "Jan 2021 – Aug 2021",
    highlights: [
      "Built automated test scripts for a Finance Test Automation framework covering 500+ test cases.",
      "Documented IT SOX evidence for critical financial applications including Order Management and Reconciliation.",
    ],
  },
]

function Experience() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <SectionHeading>Experience</SectionHeading>
      <div className="space-y-10">
        {experiences.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            className="relative pl-5 border-l border-gray-200 dark:border-gray-800"
          >
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-gray-950 border-2 border-gray-300 dark:border-gray-600" />
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 mb-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {exp.role}
                </span>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <span className="text-gray-600 dark:text-gray-400">{exp.company}</span>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">
                {exp.period}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wide">
              {exp.team}
            </p>
            <ul className="space-y-2">
              {exp.highlights.map((h, j) => (
                <li
                  key={j}
                  className="text-sm text-gray-600 dark:text-gray-300 flex gap-2.5 leading-relaxed"
                >
                  <span className="text-gray-300 dark:text-gray-700 shrink-0 mt-0.5">—</span>
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

const projects = [
  {
    name: "Rezfolio",
    url: "https://rezfolio.in",
    description:
      "Turns a resume into an interactive portfolio page. Next.js frontend, Gemini for generation, RAG pipeline for structured content extraction. Deployed on GCP — Cloud Run, Firestore, Redis.",
  },
  {
    name: "Pxl-Artisan",
    url: "https://pxl-artisan.web.app/",
    description:
      "Pixel art editor built with Angular, hosted on Firebase.",
  },
]

function Projects() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <SectionHeading>Projects</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
            className="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {p.name}
              </h3>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors"
                aria-label={`Visit ${p.name}`}
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {p.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

const awards = [
  {
    title: "The Last Mile",
    year: "2025",
    company: "Amazon",
    detail: "Fast delivery of feature integrations on Marketly.",
  },
  {
    title: "Going Above and Beyond",
    year: "2024",
    company: "Cisco",
    detail: "RPO Engine analytics and automation.",
  },
  {
    title: "Living Cisco's Principles",
    year: "2023",
    company: "Cisco",
    detail: "FY23 SOX compliance automation.",
  },
  {
    title: "Innovate Everywhere",
    year: "2022",
    company: "Cisco",
    detail: "Test automation and SOX control testing.",
  },
]

function Awards() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <SectionHeading>Awards</SectionHeading>
      <div className="space-y-4">
        {awards.map((a, i) => (
          <div key={i} className="flex gap-5 items-start">
            <span className="text-sm text-gray-300 dark:text-gray-600 w-10 shrink-0 pt-0.5 tabular-nums">
              {a.year}
            </span>
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {a.title}
                </span>
                <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{a.company}</span>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{a.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

function Education() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <SectionHeading>Education</SectionHeading>
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            B.Tech, Computer Science and Engineering
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">KL University</p>
        </div>
        <span className="text-sm text-gray-400 dark:text-gray-500 shrink-0">
          2021 · CGPA 8.8 / 10
        </span>
      </div>
    </motion.section>
  )
}

function Contact() {
  return (
    <motion.section
      {...fadeIn}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <SectionHeading>Contact</SectionHeading>
      <div className="flex flex-wrap gap-6">
        <Link
          href="mailto:notakshayp@gmail.com"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Mail size={15} />
          notakshayp@gmail.com
        </Link>
        <Link
          href="https://linkedin.com/in/notakshayp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Linkedin size={15} />
          linkedin.com/in/notakshayp
        </Link>
      </div>
    </motion.section>
  )
}
