import { useMetaMask } from '@/hooks/useMetaMask';
import React, { useState } from 'react';
import SwitchNetwork from '../SwitchNetwork/SwitchNetwork';
import { config, isSupportedNetwork } from '@/lib/config';
import { formatAddress, formatChainAsNum } from '@/utils';

interface TabProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
  
  const Tab: React.FC<TabProps> = ({ active, onClick, children }) => (
  
  <button
    className={`flex px-4 py-2 font-medium ${
      active ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsLayout = () => {
  const [activeTab, setActiveTab] = useState('EOA');
  const { wallet, isConnecting, connectMetaMask, sdk, sdkConnected } = useMetaMask()
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID
  const walletChainSupported = isSupportedNetwork(wallet.chainId)
  // now chainInfo is strongly typed or fallback to linea if not a valid chain
  const chainInfo = isSupportedNetwork(networkId) ? config[networkId] : config['0xe704']
  

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full border-b">
        <Tab active={activeTab === 'EOA'} onClick={() => setActiveTab('EOA')}>
          EOA
        </Tab>
        <Tab active={activeTab === 'SMART CONTRACT ACCOUNT'} onClick={() => setActiveTab('SMART CONTRACT ACCOUNT')}>
        SMART CONTRACT WALLET (SCW)
        </Tab>
      </div>
      
      <div className="w-11/12 mt-8">
        {activeTab === 'EOA' && 
            <div>
                <>
                    {wallet.accounts.length > 0 &&
                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                        {sdkConnected ? "EXTENSION":"MOBILE" }
                    </span>
                    
                    }
                    {wallet.accounts.length > 0 && !isSupportedNetwork(wallet.chainId) && (
                    <SwitchNetwork />
                    )}
                    {wallet && wallet.accounts.length > 0 && (
                    <>
                        
                        {walletChainSupported &&
                        <a href={`${chainInfo?.blockExplorer}/address/${chainInfo?.contractAddress}`}
                            target="_blank"
                            title="Open in Block Explorer"
                            className="text-sm font-semibold leading-6 text-gray-900"
                        >
                            {chainInfo.name}:{formatChainAsNum(wallet.chainId)}
                        </a>
                        }
                        &nbsp;|&nbsp;
                        <a href={`https://etherscan.io/address/${wallet.address}`}
                        target="_blank"
                        title="Open in Block Explorer"
                        className="text-sm font-semibold leading-6 text-gray-900"
                        >
                        {formatAddress(wallet.address)}
                        </a>
                        &nbsp;|&nbsp;
                        <span className="text-sm font-semibold leading-6 text-gray-900">
                            {wallet.balance} ETH
                        </span>
                        {/* <button 
                            className="inline-flex items-center gap-x-2 rounded-full bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            onClick={async () => sdk!.terminate()}>
                            Disconnect
                        </button> */}
                    </>
                    )}
              </>
            </div>}
        {activeTab === 'SMART CONTRACT ACCOUNT' && <p>Content of Tab 2</p>}
      </div>
    </div>
  );
};

export default TabsLayout;
