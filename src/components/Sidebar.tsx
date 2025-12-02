'use client'

import { useStore } from '@/store/useStore'
import { useTheme } from '@/components/ThemeProvider'
import Image from 'next/image'
import {
  MessageSquare,
  ImageIcon,
  Mic,
  Plus,
  Trash2,
  Sun,
  Moon,
} from 'lucide-react'

export function Sidebar() {
  const {
    sidebarCollapsed,
    currentView,
    setCurrentView,
    conversations,
    currentConversationId,
    addConversation,
    selectConversation,
    deleteConversation,
  } = useStore()

  const { theme, toggleTheme } = useTheme()

  const menuItems = [
    { id: 'chat' as const, icon: MessageSquare, label: 'Chat IA' },
    { id: 'image' as const, icon: ImageIcon, label: 'Generar Imagen' },
    { id: 'voice' as const, icon: Mic, label: 'Voz IA' },
  ]

  const handleNewConversation = () => {
    addConversation(currentView)
  }

  const filteredConversations = conversations.filter(c => c.type === currentView)

  return (
    <aside
      className={`h-screen bg-[var(--bg-secondary)] border-r-4 border-[var(--border-color)] flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo area */}
      <div className="h-16 border-b-4 border-[var(--border-color)] flex items-center justify-center px-2">
        {sidebarCollapsed ? (
          <Image
            src="/icon.png"
            alt="CHATI"
            width={36}
            height={36}
            className="dark:invert"
          />
        ) : (
          <Image
            src="/logo.png"
            alt="CHATI"
            width={140}
            height={36}
            className="dark:invert"
          />
        )}
      </div>

      {/* Menu Items */}
      <nav className="p-2 border-b-4 border-[var(--border-color)]">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'cartoon-button-primary border-3 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--shadow-color)]'
                  : 'hover:bg-[var(--bg-tertiary)] border-3 border-transparent'
                }
              `}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon size={22} />
              {!sidebarCollapsed && (
                <span className="font-semibold">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* New Conversation Button */}
      <div className="p-2">
        <button
          onClick={handleNewConversation}
          className={`cartoon-button w-full flex items-center gap-2 ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-center'
          }`}
          title={sidebarCollapsed ? 'Nuevo' : undefined}
        >
          <Plus size={20} />
          {!sidebarCollapsed && <span>Nuevo</span>}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {!sidebarCollapsed && filteredConversations.length > 0 && (
          <div className="space-y-2">
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
                  ${currentConversationId === conv.id
                    ? 'bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)]'
                    : 'hover:bg-[var(--bg-tertiary)] border-2 border-transparent'
                  }
                `}
                onClick={() => selectConversation(conv.id)}
              >
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    deleteConversation(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white rounded transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="p-2 border-t-4 border-[var(--border-color)]">
        <button
          onClick={toggleTheme}
          className={`cartoon-button w-full flex items-center gap-2 ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-center'
          }`}
          title={sidebarCollapsed ? (theme === 'light' ? 'Modo Oscuro' : 'Modo Claro') : undefined}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!sidebarCollapsed && (
            <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          )}
        </button>
      </div>
    </aside>
  )
}
