import {ChevronDown, Cpu, Database, Zap, Search, LucideServerCog} from "lucide-react"
import {Button} from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {Switch} from "@/components/ui/switch"
import {Label} from "@/components/ui/label"
import type {ComputeNode, ComputeNodeModel} from "@/types/computeNode.ts"

// ─── RAG Level ────────────────────────────────────────────────────────────────

type RagLevel = "off" | "low" | "medium" | "high"

const RAG_LEVELS: { label: string; value: RagLevel; limit: number; description: string }[] = [
  {label: "Off", value: "off", limit: 0, description: "No retrieval"},
  {label: "Low", value: "low", limit: 3, description: "3 chunks"},
  {label: "Medium", value: "medium", limit: 10, description: "10 chunks"},
  {label: "High", value: "high", limit: 15, description: "15 chunks"},
]

// eslint-disable-next-line react-refresh/only-export-components
export function ragLevelToLimit(level: RagLevel): number {
  return RAG_LEVELS.find(r => r.value === level)?.limit ?? 0
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModelConfigPopoverProps {
  nodes: ComputeNode[]
  selectedNode: number | null
  onSelectNode: (nodeId: number) => void
  models: ComputeNodeModel[]
  selectedModel: string | null
  onSelectModel: (model: string) => void
  ragLevel: RagLevel
  onRagLevelChange: (level: RagLevel) => void
  ragAdvanced: boolean
  onRagAdvancedChange: (val: boolean) => void
  webSearch: boolean
  onWebSearchChange: (val: boolean) => void
  braveWebSearchConfigured?: boolean
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LLMConfigPopover({
                                     nodes,
                                     selectedNode,
                                     onSelectNode,
                                     models,
                                     selectedModel,
                                     onSelectModel,
                                     ragLevel,
                                     onRagLevelChange,
                                     ragAdvanced,
                                     onRagAdvancedChange,
                                     webSearch,
                                     onWebSearchChange,
                                     braveWebSearchConfigured,
                                     disabled,
                                   }: ModelConfigPopoverProps) {

  const selectedNodeObj = selectedNode !== null ? nodes.find(n => n.id === selectedNode) : undefined;
  const disabledWebSearch = selectedNodeObj?.api_type === "openai" && !braveWebSearchConfigured;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 h-9 px-3 text-sm font-normal max-w-52 min-w-0"
        >
          <Cpu className="w-3.5 h-3.5 shrink-0 text-muted-foreground"/>
          <span className="truncate">
            {selectedModel ?? "Select model"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground ml-auto"/>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-0 overflow-hidden"
      >
        {/* Node selection */}
        <div className="px-4 pt-4 pb-3 border-b">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <LucideServerCog className="w-3 h-3" /> Compute Node
          </p>
          <div className="flex flex-col gap-1">
            {nodes.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">No nodes available</p>
            )}
            {nodes
              .sort((a, b) =>
                b.priority - a.priority ||
                (a.status === b.status ? 0 : a.status === "online" ? -1 : 1) ||
                a.hostname.localeCompare(b.hostname)
              )
              .map(node => (
              <button
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2
                  ${selectedNode === node.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
                }`}
              >
                <div className={`size-1.5 rounded-full shrink-0 ${node.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                <span className="truncate">{node.hostname}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model selection */}
        <div className="px-4 pt-4 pb-3 border-b">
          <p
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Cpu className="w-3 h-3"/> Model
          </p>
          <div className="flex flex-col gap-1">
            {models.length === 0 && (
              <p className="text-xs text-muted-foreground py-1">No models available</p>
            )}
            {models.map(model => (
              <button
                key={model.name}
                onClick={() => onSelectModel(model.name)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${selectedModel === model.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* RAG level */}
        <div className="px-4 pt-3 pb-3 border-b">
          <p
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Database className="w-3 h-3"/> Knowledge Retrieval
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {RAG_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => onRagLevelChange(level.value)}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-md text-xs transition-colors border
                  ${ragLevel === level.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-transparent text-foreground"
                }`}
              >
                <span className="font-medium">{level.label}</span>
                <span
                  className={`text-[10px] ${ragLevel === level.value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {level.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RAG Advanced */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground"/>
              <div>
                <Label htmlFor="rag-advanced" className="text-sm cursor-pointer">
                  Advanced RAG
                </Label>
                <p className="text-xs text-muted-foreground">Enhanced retrieval processing</p>
              </div>
            </div>
            <Switch
              id="rag-advanced"
              checked={ragAdvanced}
              onCheckedChange={onRagAdvancedChange}
              disabled={ragLevel === "off"}
            />
          </div>
        </div>

        {/* Web Search */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-muted-foreground"/>
              <div>
                <Label htmlFor="rag-advanced" className="text-sm cursor-pointer">
                  Web Search
                </Label>
                <p className="text-xs text-muted-foreground">Allow model search for latest data</p>
              </div>
            </div>
            <Switch
              id="web-search"
              checked={disabledWebSearch ? false : webSearch}
              onCheckedChange={onWebSearchChange}
              disabled={disabledWebSearch}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type {RagLevel}