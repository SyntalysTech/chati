'use client'

import { useStore } from '@/store/useStore'
import { Menu, X } from 'lucide-react'

export function BurgerButton() {
  const { sidebarCollapsed, toggleSidebar } = useStore()

  return (
    <button
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 cartoon-button p-3"
      aria-label={sidebarCollapsed ? 'Abrir menú' : 'Cerrar menú'}
    >
      {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
    </button>
  )
}
