"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getAccessToken } from "@/lib/auth"

export interface ChatMessage {
  id: number
  body: string
  sender_id: number
  sender_name: string
  sender_avatar: string | null
  is_read: boolean
  created_at: string
}

function socketUrl(conversationId: string): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const token = getAccessToken()
  if (!apiUrl || !token) return null
  const wsBase = apiUrl.replace(/^http/, "ws")
  return `${wsBase}/ws/chat/${conversationId}/?token=${encodeURIComponent(token)}`
}

/** Real-time chat over api/chat's Django Channels consumer. Protocol:
 * send {type:"message", body} / {type:"read"}; receive {type:"history"|"message", ...}. */
export function useChatSocket(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting")
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const url = socketUrl(conversationId)
    if (!url) {
      setStatus("closed")
      return
    }

    setStatus("connecting")
    const socket = new WebSocket(url)
    socketRef.current = socket

    socket.onopen = () => {
      setStatus("open")
      socket.send(JSON.stringify({ type: "read" }))
    }
    socket.onclose = () => setStatus("closed")
    socket.onerror = () => setStatus("closed")
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "history") {
        setMessages(data.messages)
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.message])
      }
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [conversationId])

  const send = useCallback((body: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "message", body }))
    }
  }, [])

  return { messages, status, send }
}
