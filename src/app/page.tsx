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
      {/* Burger Button - OUTSIDE sidebar, fixed position */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 z-50 cartoon-button p-2"
        aria-label={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar - Always visible, just collapses */}
      <Sidebar />

      {/* Main Content */}
      <main
        className={`flex-1 h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {currentView === 'chat' && <ChatView />}
        {currentView === 'image' && <ImageView />}
        {currentView === 'voice' && <VoiceView />}
      </main>
    </div>
  )
}
