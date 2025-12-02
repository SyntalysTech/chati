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
  X,
} from 'lucide-react'

export function Sidebar() {
  const {
    toggleSidebar,
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
    <div className="flex flex-col h-full w-72">
      {/* Header with Logo and Close Button */}
      <div className="h-14 px-4 border-b-4 border-[var(--border-color)] flex items-center justify-between">
        <Image
          src="/logo.png"
          alt="CHATI"
          width={120}
          height={32}
          className="dark:invert"
        />
        <button
          onClick={toggleSidebar}
          className="cartoon-button p-2"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-3 border-b-4 border-[var(--border-color)]">
        {menuItems.map(item => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-all
                ${isActive
                  ? 'cartoon-button-primary border-3 border-[var(--border-color)] shadow-[3px_3px_0px_0px_var(--shadow-color)]'
                  : 'hover:bg-[var(--bg-tertiary)] border-3 border-transparent'
                }
              `}
            >
              <Icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* New Conversation Button */}
      <div className="p-3">
        <button
          onClick={handleNewConversation}
          className="cartoon-button w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Nuevo</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredConversations.length > 0 && (
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
      <div className="p-3 border-t-4 border-[var(--border-color)]">
        <button
          onClick={toggleTheme}
          className="cartoon-button w-full flex items-center justify-center gap-2"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
        </button>
      </div>
    </div>
  )
}
