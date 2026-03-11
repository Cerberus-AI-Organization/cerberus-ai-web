
export type ComputeNode = {
  id: number
  hostname: string
  status: 'online' | 'offline'
  priority: number
}

export type ComputeNodeDetail = ComputeNode & {
  ip: string;
  port: number;
  max_ctx: number;
  max_layers_on_gpu: number;
  added_by: number | null;
  created_at: Date;
}

export type ComputeNodeModel = {
  name: string;
  size: number;
}