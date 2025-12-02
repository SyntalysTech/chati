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
      {/* Burger Button - Fixed position, always accessible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 cartoon-button p-3"
        aria-label={sidebarCollapsed ? 'Abrir menú' : 'Cerrar menú'}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar-transition h-screen bg-[var(--bg-secondary)] border-r-4 border-[var(--border-color)] flex flex-col fixed left-0 top-0 z-40 ${
          sidebarCollapsed ? 'w-0 -translate-x-full' : 'w-72 translate-x-0'
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 h-screen overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0 pl-16' : 'ml-72 pl-4'
        }`}
      >
        {currentView === 'chat' && <ChatView />}
        {currentView === 'image' && <ImageView />}
        {currentView === 'voice' && <VoiceView />}
      </main>

      {/* Overlay when sidebar is open on mobile */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
