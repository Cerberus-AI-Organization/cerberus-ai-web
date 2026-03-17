import {type LucideIcon, MessageSquare, Shield, Terminal} from "lucide-react";

export type ChatModeId = "chat" | "malware" | "pentest"

export interface ChatMode {
  id: ChatModeId
  label: string
  description: string
}

export const CHAT_MODES: ChatMode[] = [
  {
    id: "chat",
    label: "General Chat",
    description: "Cybersecurity chatbot"
  },
  {
    id: "malware",
    label: "Malware Advisor",
    description: "Get advice on detecting and preventing malware"
  },
  {
    id: "pentest",
    label: "Pentest Advisor",
    description: "Get pentest advice and tips"
  },
]

export const MODE_ICONS: Record<ChatModeId, LucideIcon> = {
  chat: MessageSquare,
  malware: Shield,
  pentest: Terminal,
}