'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Send, Download, Sparkles } from 'lucide-react'
import Image from 'next/image'

type ImageSize = '1024x1024' | '1792x1024' | '1024x1792'
type ImageQuality = 'standard' | 'hd'

export function ImageView() {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<ImageSize>('1024x1024')
  const [quality, setQuality] = useState<ImageQuality>('standard')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    currentConversationId,
    addMessage,
    addConversation,
    isLoading,
    setIsLoading,
  } = useStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId && c.type === 'image')
  const messages = currentConversation?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    let conversationId = currentConversationId
    const currentConv = conversations.find(c => c.id === conversationId)
    if (!conversationId || currentConv?.type !== 'image') {
      conversationId = addConversation('image')
    }

    const userPrompt = prompt.trim()
    setPrompt('')

    addMessage(conversationId, {
      role: 'user',
      content: userPrompt,
      type: 'text',
    })

    setIsLoading(true)

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, size, quality }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      addMessage(conversationId, {
        role: 'assistant',
        content: `Imagen generada: "${userPrompt}"`,
        type: 'image',
        imageUrl: data.imageUrl,
      })
    } catch (error) {
      console.error('Image generation error:', error)
      addMessage(conversationId, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al generar la imagen. Por favor, intenta de nuevo.',
        type: 'text',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Options */}
      <div className="p-3 border-b-4 border-[var(--border-color)] bg-[var(--bg-tertiary)] flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Tamaño:</label>
          <select
            value={size}
            onChange={e => setSize(e.target.value as ImageSize)}
            className="cartoon-input py-2 px-3 text-sm"
          >
            <option value="1024x1024">Cuadrado (1024x1024)</option>
            <option value="1792x1024">Horizontal (1792x1024)</option>
            <option value="1024x1792">Vertical (1024x1792)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Calidad:</label>
          <select
            value={quality}
            onChange={e => setQuality(e.target.value as ImageQuality)}
            className="cartoon-input py-2 px-3 text-sm"
          >
            <option value="standard">Estándar</option>
            <option value="hd">HD</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="cartoon-card p-8 max-w-md">
              <Sparkles size={64} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold mb-2">Crea Arte con IA</h2>
              <p className="text-[var(--text-secondary)]">
                Describe lo que quieres ver y DALL-E 3 lo creará para ti.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'image' && msg.imageUrl ? (
                <div className="max-w-lg">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">{msg.content}</p>
                  <div className="generated-image relative group">
                    <Image
                      src={msg.imageUrl}
                      alt={msg.content}
                      width={512}
                      height={512}
                      className="w-full h-auto"
                    />
                    <button
                      onClick={() => downloadImage(msg.imageUrl!, `chati-${msg.id}.png`)}
                      className="absolute bottom-4 right-4 cartoon-button p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[70%] p-4 ${
                    msg.role === 'user'
                      ? 'message-user'
                      : 'message-assistant'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="cartoon-card p-6 text-center">
              <div className="animate-pulse">
                <Sparkles size={40} className="mx-auto mb-3" />
                <p className="font-semibold">Generando imagen...</p>
                <p className="text-sm text-[var(--text-secondary)]">Esto puede tardar unos segundos</p>
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
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe la imagen que quieres crear..."
            className="cartoon-input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="cartoon-button cartoon-button-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
