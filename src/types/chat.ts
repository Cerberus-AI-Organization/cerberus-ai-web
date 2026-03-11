
export type Chat = {
  id: number
  title: string
  created_by: string
  created_at: string
  last_modified: string
}

export type Message = {
  id: number
  chat_id: number
  sender_type: 'user' | 'ai'
  sender_id: number | null
  think: string | null
  content: string
  created_at: string
  message_rag: MessageRag[] | null
}

export type MessageRag = {
  source: string,
  hash: string,
  metadata: string,
  chunks: MessageRagChunk[]
}

export type MessageRagChunk = {
  text: string
  page_source: string,
  score: number
}