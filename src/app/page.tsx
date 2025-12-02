'use client'

import { Sidebar } from '@/components/Sidebar'
import { BurgerButton } from '@/components/BurgerButton'
import { ChatView } from '@/components/ChatView'
import { ImageView } from '@/components/ImageView'
import { VoiceView } from '@/components/VoiceView'
import { useStore } from '@/store/useStore'

export default function Home() {
  const { sidebarCollapsed, currentView } = useStore()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Burger Button - Always visible, outside sidebar */}
      <BurgerButton />

      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden pl-14 md:pl-0">
        {currentView === 'chat' && <ChatView />}
        {currentView === 'image' && <ImageView />}
        {currentView === 'voice' && <VoiceView />}
      </main>
    </div>
  )
}
