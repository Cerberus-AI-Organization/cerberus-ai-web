
export type ComputeNode = {
  id: number
  hostname: string
  status: 'online' | 'offline'
  priority: number,
  api_type: 'ollama' | 'openai'
}

export type ComputeNodeDetail = ComputeNode & {
  url: string;
  api_key: string | null;
  max_ctx: number;
  max_layers_on_gpu: number;
  added_by: number | null;
  created_at: Date;
}

export type ComputeNodeModel = {
  name: string;
  size: number;
}