'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Send, Bot, User, MessageSquare } from 'lucide-react'

export function ChatView() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    currentConversationId,
    addMessage,
    addConversation,
    isLoading,
    setIsLoading,
  } = useStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId)
  const messages = currentConversation?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    let conversationId = currentConversationId
    if (!conversationId) {
      conversationId = addConversation('chat')
    }

    const userMessage = input.trim()
    setInput('')

    addMessage(conversationId, {
      role: 'user',
      content: userMessage,
      type: 'text',
    })

    setIsLoading(true)

    try {
      const conv = useStore.getState().conversations.find(c => c.id === conversationId)
      const chatHistory = conv?.messages.map(m => ({
        role: m.role,
        content: m.content,
      })) || []

      chatHistory.push({ role: 'user', content: userMessage })

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      addMessage(conversationId, {
        role: 'assistant',
        content: data.content,
        type: 'text',
      })
    } catch (error) {
      console.error('Chat error:', error)
      addMessage(conversationId, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        type: 'text',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 px-6 border-b-4 border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center gap-3">
        <MessageSquare size={24} />
        <div>
          <h1 className="text-lg font-bold leading-tight">Chat con IA</h1>
          <p className="text-xs text-[var(--text-secondary)]">Powered by GPT-4o-mini</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="cartoon-card p-8 max-w-md">
              <Bot size={64} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold mb-2">¡Hola! Soy CHATI</h2>
              <p className="text-[var(--text-secondary)]">
                Tu asistente de IA personal. Pregúntame lo que quieras.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
                  <Bot size={20} />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 ${
                  msg.role === 'user'
                    ? 'message-user'
                    : 'message-assistant'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-white dark:text-black" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] flex items-center justify-center flex-shrink-0">
              <Bot size={20} />
            </div>
            <div className="message-assistant p-4">
              <div className="loading-dots flex gap-1">
                <span className="w-2 h-2 rounded-full bg-current inline-block" />
                <span className="w-2 h-2 rounded-full bg-current inline-block" />
                <span className="w-2 h-2 rounded-full bg-current inline-block" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="cartoon-input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="cartoon-button cartoon-button-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
