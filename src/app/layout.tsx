import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavHeader from '../components/NavHeader'
import { MetaMaskContextProvider } from '@/hooks/useMetaMask'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETHGlobal X SponsorGas',
  description: 'Gasless staking for ETHGlobal events powered by Sponsor Gas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MetaMaskContextProvider>
      <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
        <NavHeader/>
        {children}
      </div>
    </MetaMaskContextProvider>
  )
}
