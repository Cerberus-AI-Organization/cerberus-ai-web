
export type Chat = {
  id: string
  title: string
  created_by: string
  created_at: string
  last_modified: string
}

export type Message = {
  id: string
  chat_id: string
  sender_type: 'user' | 'ai'
  sender_id: string | null
  content: string
  created_at: string
}