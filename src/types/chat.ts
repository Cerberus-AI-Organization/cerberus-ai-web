
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
  content: string
  created_at: string
}