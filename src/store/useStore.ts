import { create } from 'zustand'

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  type?: 'text' | 'image' | 'audio'
  imageUrl?: string
  audioUrl?: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  type: 'chat' | 'image' | 'voice'
  createdAt: Date
}

interface AppState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  currentView: 'chat' | 'image' | 'voice'
  setCurrentView: (view: 'chat' | 'image' | 'voice') => void

  conversations: Conversation[]
  currentConversationId: string | null

  addConversation: (type: 'chat' | 'image' | 'voice') => string
  selectConversation: (id: string) => void
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  deleteConversation: (id: string) => void

  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  currentView: 'chat',
  setCurrentView: (view) => set({ currentView: view }),

  conversations: [],
  currentConversationId: null,

  addConversation: (type) => {
    const id = generateId()
    const titles = {
      chat: 'Nueva conversación',
      image: 'Nueva imagen',
      voice: 'Nuevo audio'
    }

    const newConversation: Conversation = {
      id,
      title: titles[type],
      messages: [],
      type,
      createdAt: new Date()
    }

    set(state => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: id,
      currentView: type
    }))

    return id
  },

  selectConversation: (id) => {
    const conversation = get().conversations.find(c => c.id === id)
    if (conversation) {
      set({
        currentConversationId: id,
        currentView: conversation.type
      })
    }
  },

  addMessage: (conversationId, message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date()
    }

    set(state => ({
      conversations: state.conversations.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMessage]
          // Update title from first user message
          let title = conv.title
          if (message.role === 'user' && conv.messages.length === 0) {
            title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
          }
          return { ...conv, messages: updatedMessages, title }
        }
        return conv
      })
    }))
  },

  deleteConversation: (id) => {
    set(state => {
      const newConversations = state.conversations.filter(c => c.id !== id)
      const newCurrentId = state.currentConversationId === id
        ? (newConversations[0]?.id || null)
        : state.currentConversationId
      return {
        conversations: newConversations,
        currentConversationId: newCurrentId
      }
    })
  },

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading })
}))
