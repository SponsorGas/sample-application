'use client'
import Image from 'next/image'
import React from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import Drawer from '@/components/AccountDrawer';
import WalletConnect from '@/components/WalletConnect';
import WalletDashboard from '@/components/WalletDashboard';

export default function NavHeader() {

  const { wallet, isConnecting, connectMetaMask, sdk, sdkConnected } = useMetaMask()
  const [isOpen, setIsOpen] = React.useState(false);

  return (
      <header >
        <nav className="mx-auto flex max-w-8xl items-center justify-between p-2 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              <Image width={50} height={50} className="rounded-full border-yellow-200" src={'/ethglobal.png'} alt="Logo" />
              <span className='font-semibold text-xl'>ETH</span>
              <span className='text-xl'>Global</span>
              <span className='font-bold text-3xl px-2'>X</span>
              <span className='font-semibold text-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent'>Sponsor Gas</span>
            </a>
          </div>
          <div className="flex lg:flex-1">
            <a href="/xsuperhack" className="-m-1.5 p-1.5 flex items-center">
              <span className='font-semibold text-xl'>xSuperhack NFT</span>
              <span className='font-bold text-3xl px-2'>X</span>
              <span className='font-semibold text-xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent'>Sponsor Gas</span>
            </a>
          </div>
          <div className="mb-6 flex gap-2">
            <div className="lg:flex lg:flex-1 gap-1 items-center lg:justify-end">
              <WalletConnect />
            </div>
            <button className="bg-green-600 text-white inline-block h-10 w-10 rounded-full ring-2 ring-white"
              onClick={() => setIsOpen(true)} > KS </button>
          </div> 
          
          <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
            {wallet.accounts.length < 1 
              ? <WalletConnect/>
              :<div className='flex justify-center w-full '>
                <WalletDashboard />
              </div>
            }
          </Drawer>
        </nav>
      </header>

  );
}

