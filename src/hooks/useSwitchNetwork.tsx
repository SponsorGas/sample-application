import { config, isSupportedNetwork } from '../lib/config'

export const useSwitchNetwork = () => {
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID

  // const switchNetwork = async () => {
  //   if(!isSupportedNetwork(networkId)) {
  //     throw new Error('Unsupported network')
  //   }
  
  //   await window.ethereum?.request({
  //     method: 'wallet_addEthereumChain',
  //     params: [
  //       {
  //         chainId: networkId,
  //         ...(config[networkId].blockExplorer ? {
  //           blockExplorerUrls: [config[networkId].blockExplorer]
  //         } : {}),
  //         chainName: config[networkId].name,
  //         nativeCurrency: {
  //           decimals: 18,
  //           name: config[networkId].name,
  //           symbol: config[networkId].symbol,
  //         },
  //         rpcUrls: [config[networkId].rpcUrl],
  //       },
  //     ],
  //   })

  // }

  const switchNetwork = async (newNetworkId:string) => {
    if(!isSupportedNetwork(newNetworkId)) {
      throw new Error('Unsupported network')
    }
  
    await window.ethereum?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: networkId,
          ...(config[newNetworkId].blockExplorer ? {
            blockExplorerUrls: [config[newNetworkId].blockExplorer]
          } : {}),
          chainName: config[newNetworkId].name,
          nativeCurrency: {
            decimals: 18,
            name: config[newNetworkId].name,
            symbol: config[newNetworkId].symbol,
          },
          rpcUrls: [config[newNetworkId].rpcUrl],
        },
      ],
    })

  }
  return {
    switchNetwork,
  }
}
