'use client'

import { Sidebar } from '@/components/Sidebar'
import { ChatView } from '@/components/ChatView'
import { ImageView } from '@/components/ImageView'
import { VoiceView } from '@/components/VoiceView'
import { useStore } from '@/store/useStore'
import { Menu, MessageSquare, ImageIcon, Mic } from 'lucide-react'

const viewConfig = {
  chat: { icon: MessageSquare, title: 'Chat con IA', subtitle: 'Powered by GPT-4o-mini' },
  image: { icon: ImageIcon, title: 'Generar Imagen', subtitle: 'Powered by DALL-E 3' },
  voice: { icon: Mic, title: 'Generador de Voz', subtitle: 'Powered by ElevenLabs' },
}

export default function Home() {
  const { sidebarCollapsed, toggleSidebar, currentView } = useStore()
  const config = viewConfig[currentView]
  const Icon = config.icon

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside
        className={`h-screen bg-[var(--bg-secondary)] border-r-4 border-[var(--border-color)] flex flex-col fixed left-0 top-0 z-40 overflow-hidden transition-transform duration-300 ease-in-out ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
        style={{ width: '288px' }}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-0' : 'ml-72'
        }`}
      >
        {/* Header with burger button and title */}
        <div className="h-16 flex items-center px-4 border-b-4 border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <button
            onClick={toggleSidebar}
            className="cartoon-button p-2 mr-4 flex-shrink-0"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3">
            <Icon size={24} />
            <div>
              <h1 className="text-lg font-bold leading-tight">{config.title}</h1>
              <p className="text-xs text-[var(--text-secondary)]">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="h-[calc(100vh-64px)] overflow-hidden">
          {currentView === 'chat' && <ChatView />}
          {currentView === 'image' && <ImageView />}
          {currentView === 'voice' && <VoiceView />}
        </div>
      </main>

      {/* Overlay when sidebar is open */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
