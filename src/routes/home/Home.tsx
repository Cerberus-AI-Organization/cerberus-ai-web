import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Bug, Terminal, Shield, ChevronRight, Server, Database, Globe, Lock, Zap } from "lucide-react"
import { useNavigate } from "react-router-dom"

const MODES = [
  {
    icon: MessageSquare,
    label: "General Chat",
    description: "Conversational AI with RAG pipeline and web search. Security analyses, reports or open-ended discussion.",
    tags: ["RAG", "Web Search", "Streaming"],
  },
  {
    icon: Bug,
    label: "Malware Advisor",
    description: "Malware analysis, IOC extraction, behavioral triage and threat intelligence.",
    tags: ["Static Analysis", "IOC", "Threat Intel"],
  },
  {
    icon: Terminal,
    label: "Pentest Advisor",
    description: "Reconnaissance, CVE lookup, payload suggestions and structured pentest reports.",
    tags: ["OSINT", "CVE Lookup", "Payloads"],
  },
]

const DOCKER_SERVICES = [
  { image: "sobotat/cerberus-ai", icon: Globe, label: "Frontend", port: "80" },
  { image: "sobotat/cerberus-ai-api", icon: Server, label: "API", port: "8080" },
  { image: "postgres", icon: Database, label: "PostgreSQL", port: "5432" },
]

const COMPOSE = `services:
  web:
    image: sobotat/cerberus-ai
    container_name: cerberus-ai
    restart: unless-stopped
    ports:
      - "80:80"
    environment:
      CERBERUS_API_URL: url where is your api

  api:
    image: sobotat/cerberus-ai-api
    container_name: cerberus-ai-api
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      JWT_SECRET: secret password for tokens
      CORS_URL: your cerberus ui url
      DB_HOST: ip of postgres db
      DB_PORT: 5432
      DB_USER: cerberusai
      DB_PASSWORD: cerberusai
      DB_NAME: cerberusai_db
      MODEL_KEEPALIVE: 300
      OLLAMA_API_KEY: ollama api key for websearch
    volumes:
      - data:/app/data

volumes:
  data:`

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="h-screen overflow-y-auto bg-background text-foreground">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">CerberusAI</span>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard")}>
            Open Dashboard <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 text-xs">
          Agent-mode · Powered by Ollama
        </Badge>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          Cybersecurity AI<br />
          <span className="text-primary">for professionals</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
          A self-hosted platform for malware analysis, penetration testing and
          security chat — all powered by an agent running on Ollama.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" onClick={() => navigate("/dashboard")}>
            Launch app
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("deploy")?.scrollIntoView({ behavior: "smooth" })}>
            Docker deploy
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Lock, label: "100% local", sub: "no cloud required" },
            { icon: Zap, label: "Streaming", sub: "real-time output" },
            { icon: Shield, label: "Agent LLM", sub: "multi-step reasoning" },
            { icon: Globe, label: "RAG + Web", sub: "up-to-date context" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-xl border bg-muted/40 p-4 text-center">
              <Icon className="h-4 w-4 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* MODES */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Modes</p>
          <h2 className="text-3xl font-bold">Three specialized agents</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon
            return (
              <div key={mode.label} className="rounded-xl border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{mode.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mode.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                  {mode.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[11px] font-normal">{t}</Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* AGENT ARCH */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Architecture</p>
          <h2 className="text-3xl font-bold mb-4">Agent-style LLM<br />via Ollama</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Every query is processed by an agent that iteratively searches local documents (RAG),
            the web, and composes answers across multiple steps — all running locally on your own hardware.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Multi-step reasoning pipeline",
              "RAG over local knowledge base",
              "Integrated web search",
              "Fully offline on your own hardware",
            ].map(t => (
              <li key={t} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          {["User Query", "Agent Planner", "RAG  +  Web Search", "Ollama LLM (local)", "Streaming Response"].map((step, i, arr) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-full rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-center font-medium">
                {step}
              </div>
              {i < arr.length - 1 && <div className="w-px h-3 bg-border" />}
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* DOCKER DEPLOY */}
      <section id="deploy" className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Deployment</p>
          <h2 className="text-3xl font-bold">Up and running in minutes</h2>
          <p className="text-sm text-muted-foreground mt-1">Two Docker containers, no cloud dependencies.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {DOCKER_SERVICES.map((svc) => {
            const Icon = svc.icon
            return (
              <div key={svc.image} className="rounded-xl border bg-card p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm">{svc.label}</div>
                  <code className="text-xs text-muted-foreground break-all">{svc.image}</code>
                  <div className="text-xs text-muted-foreground mt-0.5">:{svc.port}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted/30">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">docker-compose.yml</span>
          </div>
          <pre className="p-5 text-xs font-mono text-muted-foreground leading-relaxed overflow-x-auto">{COMPOSE}</pre>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <code className="text-xs bg-muted rounded-md px-3 py-1.5 font-mono">docker compose up -d</code>
          <code className="text-xs bg-muted rounded-md px-3 py-1.5 font-mono">ollama serve</code>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-muted-foreground mb-7">Deploy CerberusAI locally and take full control of your security AI.</p>
        <Button size="lg" onClick={() => navigate("/dashboard")}>
          Open Dashboard <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            CerberusAI
          </div>
          <a
            href="https://github.com/orgs/Cerberus-AI-Organization/repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub → source code
          </a>
        </div>
      </footer>
    </div>
  )
}