
export type ComputeNode = {
  id: string
  hostname: string
  status: 'online' | 'offline'
}

export type ComputeNodeDetail = ComputeNode & {
  ip: string;
  port: number;
  added_by: number | null;
  created_at: Date;
}

export type ComputeNodeModel = {
  name: string;
  size: number;
}