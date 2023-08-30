'use client'

import { ToastProvider } from "@/providers/ToastProvider"
import { SponsorGasProvider } from "sponsor-gas-sdk"

 
export default function MainLayout({ children }:{ children: React.ReactNode }) {
  return (
      <SponsorGasProvider >
        <ToastProvider>
            {children}
        </ToastProvider>
      </SponsorGasProvider>
  )
}