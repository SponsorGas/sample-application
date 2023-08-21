import React, { useEffect, useState } from "react";
import Dropdown, { DropdownOption } from "../Dropdown";
import { useMetaMask } from "@/hooks/useMetaMask";
import { config, getBlockExplorerURLByChainId } from "@/lib/config";
import { formatAddress } from "@/utils";

export default function WalletConnect() {
  const { wallet, isConnecting, connectMetaMask, sdk, sdkConnected } = useMetaMask()
  const chains: DropdownOption[] = Object.entries(config).map(([chainId, chainConfig]) => ({
    'id': chainId,
    'name': chainConfig.name,
    'value': chainId,
  }));

  const [nativeTokenSymbol,setNativeTokenSymbol] = useState("ETH")
  
  // Set a default network based on the networkId if available, otherwise, set to the first chain
  const defaultNetwork = chains.find(chain => chain.value === wallet.chainId) || chains[0];
  const [selected, setSelected] = useState(defaultNetwork);

  const handleConnection = () =>{
    console.log(selected.name)
    connectMetaMask(selected.value)
  }
  const handleNetworkChange = (newNetwork:DropdownOption) =>{
    console.log(newNetwork)
    if(wallet.accounts.length > 0)
      connectMetaMask(newNetwork.value)
    setSelected(newNetwork)
  }

  useEffect(()=>{
    if(wallet.accounts.length > 0 && wallet.chainId!=''){
      const connectedNetwork = chains.find(chain => chain.value === wallet.chainId);
      connectedNetwork && setSelected(connectedNetwork)
    }
    const cc = Object.entries(config).find(([chainId, chainConfig]) => chainId === selected.id)
    if(cc){
      setNativeTokenSymbol(cc[1].symbol)
    }
    console.log(wallet)
  },[wallet,])
  
  return (
    <div className='flex justify-center items-center w-full gap-4 '>
      <div className="flex w-44 ">
        <Dropdown options={chains} setSelected={handleNetworkChange} selected={selected}  />
      </div>
      {wallet.accounts.length < 1 &&
        <button className="bg-blue-500 text-white py-2 px-4 rounded-md mr-2" onClick={handleConnection}>
          Connect MetaMask Signer
        </button>
      }

      <>
        {wallet && wallet.accounts.length > 0 && (
          <>
            <a href={`${getBlockExplorerURLByChainId(wallet.chainId)}/address/${wallet.address}`}
              target="_blank"
              title="Open in Block Explorer"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {formatAddress(wallet.address)}
            </a>
            {/* |
            <div className="text-sm font-semibold leading-6 text-gray-900">
              {wallet.balance} {nativeTokenSymbol}
            </div> */}
          </>
        )}
      </>
    </div>
  );
}
