'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Mic, Send, Play, Pause, Download, Volume2 } from 'lucide-react'

interface Voice {
  voice_id: string
  name: string
  labels?: {
    accent?: string
    gender?: string
  }
}

export function VoiceView() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    currentConversationId,
    addMessage,
    addConversation,
    isLoading,
    setIsLoading,
  } = useStore()

  const currentConversation = conversations.find(c => c.id === currentConversationId && c.type === 'voice')
  const messages = currentConversation?.messages || []

  useEffect(() => {
    fetchVoices()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices')
      const data = await response.json()
      if (data.voices) {
        setVoices(data.voices)
      }
    } catch (error) {
      console.error('Error fetching voices:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return

    let conversationId = currentConversationId
    const currentConv = conversations.find(c => c.id === conversationId)
    if (!conversationId || currentConv?.type !== 'voice') {
      conversationId = addConversation('voice')
    }

    const userText = text.trim()
    setText('')

    addMessage(conversationId, {
      role: 'user',
      content: userText,
      type: 'text',
    })

    setIsLoading(true)

    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText, voiceId: selectedVoice }),
      })

      if (!response.ok) {
        throw new Error('Error generating audio')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      const voiceName = voices.find(v => v.voice_id === selectedVoice)?.name || 'Voz'

      addMessage(conversationId, {
        role: 'assistant',
        content: `Audio generado con ${voiceName}`,
        type: 'audio',
        audioUrl,
      })
    } catch (error) {
      console.error('Voice generation error:', error)
      addMessage(conversationId, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al generar el audio. Por favor, intenta de nuevo.',
        type: 'text',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlay = (id: string, url: string) => {
    if (playingId === id && audioRef.current) {
      audioRef.current.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(url)
      audio.onended = () => setPlayingId(null)
      audio.play()
      audioRef.current = audio
      setPlayingId(id)
    }
  }

  const downloadAudio = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 px-6 border-b-4 border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center gap-3">
        <Mic size={24} />
        <div>
          <h1 className="text-lg font-bold leading-tight">Generador de Voz</h1>
          <p className="text-xs text-[var(--text-secondary)]">Powered by ElevenLabs</p>
        </div>
      </div>

      {/* Voice Selection */}
      <div className="p-3 border-b-4 border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm">Voz:</label>
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            className="cartoon-input py-2 px-3 text-sm flex-1 max-w-md"
          >
            {voices.length === 0 ? (
              <option value="EXAVITQu4vr4xnSDxMaL">Sarah (Default)</option>
            ) : (
              voices.map(voice => (
                <option key={voice.voice_id} value={voice.voice_id}>
                  {voice.name} {voice.labels?.gender ? `(${voice.labels.gender})` : ''}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="cartoon-card p-8 max-w-md">
              <Volume2 size={64} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-bold mb-2">Texto a Voz con IA</h2>
              <p className="text-[var(--text-secondary)]">
                Escribe cualquier texto y conviértelo en audio con voces realistas.
              </p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'audio' && msg.audioUrl ? (
                <div className="cartoon-card p-4 max-w-md">
                  <p className="text-sm font-semibold mb-3">{msg.content}</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(msg.id, msg.audioUrl!)}
                      className="cartoon-button p-3"
                    >
                      {playingId === msg.id ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full border-2 border-[var(--border-color)]">
                      <div
                        className={`h-full bg-black dark:bg-white rounded-full transition-all ${
                          playingId === msg.id ? 'animate-pulse' : ''
                        }`}
                        style={{ width: playingId === msg.id ? '100%' : '0%' }}
                      />
                    </div>
                    <button
                      onClick={() => downloadAudio(msg.audioUrl!, `chati-${msg.id}.mp3`)}
                      className="cartoon-button p-3"
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
                <Mic size={40} className="mx-auto mb-3" />
                <p className="font-semibold">Generando audio...</p>
                <p className="text-sm text-[var(--text-secondary)]">Procesando texto a voz</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t-4 border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex gap-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe el texto que quieres convertir a voz..."
            className="cartoon-input flex-1 resize-none"
            rows={2}
            disabled={isLoading}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="cartoon-button cartoon-button-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
