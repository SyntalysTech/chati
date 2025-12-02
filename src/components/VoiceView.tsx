'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Mic, Send, Play, Pause, Download, Volume2, Filter, X } from 'lucide-react'

interface Voice {
  voice_id: string
  name: string
  labels?: {
    accent?: string
    gender?: string
    age?: string
    description?: string
    use_case?: string
    language?: string
  }
  preview_url?: string
}

export function VoiceView() {
  const [text, setText] = useState('')
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filters
  const [filterGender, setFilterGender] = useState<string>('all')
  const [filterAccent, setFilterAccent] = useState<string>('all')
  const [filterUseCase, setFilterUseCase] = useState<string>('all')
  const [filterAge, setFilterAge] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

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

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const genders = new Set<string>()
    const accents = new Set<string>()
    const useCases = new Set<string>()
    const ages = new Set<string>()

    voices.forEach(voice => {
      if (voice.labels?.gender) genders.add(voice.labels.gender)
      if (voice.labels?.accent) accents.add(voice.labels.accent)
      if (voice.labels?.use_case) useCases.add(voice.labels.use_case)
      if (voice.labels?.age) ages.add(voice.labels.age)
    })

    return {
      genders: Array.from(genders).sort(),
      accents: Array.from(accents).sort(),
      useCases: Array.from(useCases).sort(),
      ages: Array.from(ages).sort(),
    }
  }, [voices])

  // Filter voices
  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      if (filterGender !== 'all' && voice.labels?.gender !== filterGender) return false
      if (filterAccent !== 'all' && voice.labels?.accent !== filterAccent) return false
      if (filterUseCase !== 'all' && voice.labels?.use_case !== filterUseCase) return false
      if (filterAge !== 'all' && voice.labels?.age !== filterAge) return false
      return true
    })
  }, [voices, filterGender, filterAccent, filterUseCase, filterAge])

  const activeFiltersCount = [filterGender, filterAccent, filterUseCase, filterAge].filter(f => f !== 'all').length

  const clearFilters = () => {
    setFilterGender('all')
    setFilterAccent('all')
    setFilterUseCase('all')
    setFilterAge('all')
  }

  const previewVoice = (voice: Voice) => {
    if (previewingVoice === voice.voice_id && previewAudioRef.current) {
      previewAudioRef.current.pause()
      setPreviewingVoice(null)
      return
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause()
    }

    if (voice.preview_url) {
      const audio = new Audio(voice.preview_url)
      audio.onended = () => setPreviewingVoice(null)
      audio.play()
      previewAudioRef.current = audio
      setPreviewingVoice(voice.voice_id)
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

  const selectedVoiceData = voices.find(v => v.voice_id === selectedVoice)

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

      {/* Voice Selection with Filters */}
      <div className="p-3 border-b-4 border-[var(--border-color)] bg-[var(--bg-tertiary)]">
        {/* Filter Toggle and Voice Select Row */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`cartoon-button p-2 flex items-center gap-2 ${showFilters ? 'cartoon-button-primary' : ''}`}
          >
            <Filter size={18} />
            <span className="text-sm">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <label className="font-semibold text-sm whitespace-nowrap">Voz:</label>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              className="cartoon-input py-2 px-3 text-sm flex-1 max-w-sm"
            >
              {filteredVoices.length === 0 ? (
                <option value="">No hay voces con estos filtros</option>
              ) : (
                filteredVoices.map(voice => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                    {voice.labels?.accent ? ` • ${voice.labels.accent}` : ''}
                    {voice.labels?.gender ? ` • ${voice.labels.gender}` : ''}
                  </option>
                ))
              )}
            </select>

            {selectedVoiceData?.preview_url && (
              <button
                onClick={() => previewVoice(selectedVoiceData)}
                className="cartoon-button p-2"
                title="Escuchar preview"
              >
                {previewingVoice === selectedVoice ? <Pause size={18} /> : <Play size={18} />}
              </button>
            )}
          </div>
        </div>

        {/* Selected Voice Info */}
        {selectedVoiceData && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedVoiceData.labels?.gender && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                {selectedVoiceData.labels.gender}
              </span>
            )}
            {selectedVoiceData.labels?.accent && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                {selectedVoiceData.labels.accent}
              </span>
            )}
            {selectedVoiceData.labels?.age && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                {selectedVoiceData.labels.age}
              </span>
            )}
            {selectedVoiceData.labels?.use_case && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                {selectedVoiceData.labels.use_case}
              </span>
            )}
            {selectedVoiceData.labels?.description && (
              <span className="text-xs px-2 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                {selectedVoiceData.labels.description}
              </span>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-3 p-3 bg-[var(--bg-primary)] rounded-xl border-2 border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Filtrar voces</span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X size={14} />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Gender Filter */}
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Género</label>
                <select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                  className="cartoon-input py-1.5 px-2 text-sm w-full"
                >
                  <option value="all">Todos</option>
                  {filterOptions.genders.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Accent Filter */}
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Acento</label>
                <select
                  value={filterAccent}
                  onChange={e => setFilterAccent(e.target.value)}
                  className="cartoon-input py-1.5 px-2 text-sm w-full"
                >
                  <option value="all">Todos</option>
                  {filterOptions.accents.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Use Case Filter */}
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Uso</label>
                <select
                  value={filterUseCase}
                  onChange={e => setFilterUseCase(e.target.value)}
                  className="cartoon-input py-1.5 px-2 text-sm w-full"
                >
                  <option value="all">Todos</option>
                  {filterOptions.useCases.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Age Filter */}
              <div>
                <label className="text-xs text-[var(--text-secondary)] mb-1 block">Edad</label>
                <select
                  value={filterAge}
                  onChange={e => setFilterAge(e.target.value)}
                  className="cartoon-input py-1.5 px-2 text-sm w-full"
                >
                  <option value="all">Todos</option>
                  {filterOptions.ages.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-3">
              {filteredVoices.length} voz{filteredVoices.length !== 1 ? 'es' : ''} disponible{filteredVoices.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
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
            disabled={!text.trim() || isLoading || filteredVoices.length === 0}
            className="cartoon-button cartoon-button-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}
