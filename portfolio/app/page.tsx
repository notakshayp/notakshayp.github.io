"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mail, Linkedin, ExternalLink } from "lucide-react"
import { ThemeToggle } from "../components/ThemeToggle"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

export default function Home() {
  return (
    <div className="min-h-screen p-8 md:p-16 lg:p-24 space-y-16 max-w-4xl mx-auto">
      <Header />
      <About />
      <Skills />
      <Work />
      <Contact />
    </div>
  )
}

function Header() {
  return (
    <motion.header {...fadeIn} className="flex justify-between items-center">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Akshay</h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">AI Fullstack Engineer</p>
      </div>
      <ThemeToggle />
    </motion.header>
  )
}

function About() {
  return (
    <motion.section {...fadeIn} className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">About Me</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        I'm a full stack dev with 4 years of exp in building high quality web apps for my clients using modern tech
        stack (Angular, React, TypeScript, JavaScript, Python). Experience building AI applications using Ollama and
        LangChain. Adept at coordinating remote teams across time zones, ensuring smooth communication and on-time
        delivery. Open to freelance projects and collaborations.
      </p>
    </motion.section>
  )
}

function Skills() {
  const skills = [
    "Angular",
    "React",
    "TypeScript",
    "JavaScript",
    "Python",
    "Google Cloud",
    "Cloud Run Fucntions",
    "Vertex AI",
    "NextJS",
    "Docker",
    "Prompt Engineering",
    "Babel",
    "Ollama",
    "LangChain",
    "AI Applications",
    "Remote Team Coordination",
  ]

  return (
    <motion.section {...fadeIn} className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">Skills</h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.section>
  )
}

function Work() {
  const projects = [
    {
      name: "🎨 Pxl-Artisan",
      description: "A Pixel art making web app built using Angular and hosted on Firebase.",
      link: "https://pxl-artisan.web.app/",
      status: "completed",
    },
    {
      name: "🚀 ResFolio",
      description: "A resume to portfolio builder using LLM, Python, and hosted on Google Cloud.",
      link: "https://rezfolio.in",
      status: "completed",
    },
  ]

  return (
    <motion.section {...fadeIn} className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">My Work</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <h3 className="text-lg font-medium mb-2">{project.name}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
            {project.status === "completed" ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                🚀 Try It <ExternalLink className="ml-2 -mr-1 h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <button
                disabled
                className="inline-flex items-center px-6 py-2 border border-gray-300 dark:border-gray-600 border-dashed text-sm font-medium rounded-full text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 cursor-not-allowed transition-colors duration-200"
                aria-label={`${project.name} is in progress`}
              >
                🔧 In Progress
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

function Contact() {
  return (
    <motion.section {...fadeIn} className="space-y-4">
      <h2 className="text-2xl md:text-3xl font-semibold">Let's Connect</h2>
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p className="flex items-center gap-2">
          <Mail size={20} />
          <Link
            href="mailto:notakshayp@gmail.com"
            className="underline hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            notakshayp@gmail.com
          </Link>
        </p>
        <p className="flex items-center gap-2">
          <Linkedin size={20} />
          <Link
            href="https://linkedin.com/in/notakshayp"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            linkedin.com/in/notakshayp
          </Link>
        </p>
      </div>
    </motion.section>
  )
}
