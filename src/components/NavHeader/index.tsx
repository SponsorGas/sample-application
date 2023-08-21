'use client'
import React, { useState } from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import Drawer from '@/components/AccountDrawer';
import WalletConnect from '@/components/WalletConnect';
import WalletDashboard from '@/components/WalletDashboard';
import ApplicationDropdown, { ApplicationDropdownOption, ApplicationLogo } from '../Dropdown/ApplicationDropdown';
import { usePathname, useRouter } from 'next/navigation';
import { Router } from "next/router";

const applications:ApplicationDropdownOption[] = [ {
  id:'1',
  name:"ETHGlobal Staking",
  value: <ApplicationLogo name='ETHGlobal Staking' sponsor="SponsorGas" image='/ethglobal.png' />,
  url:'/ethglobal/staking'

},{
  id:'2',
  name:"xSuperhack NFT",
  value: <ApplicationLogo name='xSuperhack NFT' sponsor="SponsorGas" />,
  url:'/ethglobal/nft'
},{
  id:'3',
  name:"Sponsor Pay",
  value: <ApplicationLogo name='Sponsor Pay' sponsor="SponsorGas" />,
  url:'/pay'
}]

export default function NavHeader() {

  const { wallet} = useMetaMask()
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname()
  const [selectedApplication,setSelectedApplication] = useState<ApplicationDropdownOption | undefined>(applications.find(a => a.url == `${pathname}`))
  const router = useRouter()

  const handleApplicationSelection = (option:ApplicationDropdownOption|undefined) =>{
    setSelectedApplication(option)
    if(option && option.url){
      router.push(option.url)
    }
  }
  return (
      <header >
        <nav className="mx-auto flex max-w-8xl items-center justify-between p-2 lg:px-8" aria-label="Global">
          <div className="flex ">
            <ApplicationDropdown options={applications} setSelected={handleApplicationSelection} selected={selectedApplication} />
          </div>
          <div className="flex gap-2">
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

