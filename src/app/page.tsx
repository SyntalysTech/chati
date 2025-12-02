'use client'

import { Sidebar } from '@/components/Sidebar'
import { ChatView } from '@/components/ChatView'
import { ImageView } from '@/components/ImageView'
import { VoiceView } from '@/components/VoiceView'
import { useStore } from '@/store/useStore'
import { Menu } from 'lucide-react'

export default function Home() {
  const { sidebarCollapsed, toggleSidebar, currentView } = useStore()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar - Always visible, just collapses */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Top bar with burger button */}
        <div className="h-16 px-4 border-b-4 border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center">
          <button
            onClick={toggleSidebar}
            className="cartoon-button p-2"
            aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Content area */}
        <div className="h-[calc(100vh-64px)] overflow-hidden">
          {currentView === 'chat' && <ChatView />}
          {currentView === 'image' && <ImageView />}
          {currentView === 'voice' && <VoiceView />}
        </div>
      </main>
    </div>
  )
}
