'use client'

import { ToastProvider } from "@/providers/ToastProvider"

 
export default function MainLayout({ children }:{ children: React.ReactNode }) {
  return (
        <ToastProvider>
            {children}
        </ToastProvider>
  )
}