export const config = {
  '0x13881': {
    name: 'Mumbai',
    contractAddress: '',
    symbol: 'TestMATIC',
    blockExplorer: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
  },
  '0xe704': {
    name: 'Goerli Linea',
    contractAddress: '0x0DFC533cA0E2ff075a66662dD85b626F72Ec317e',
    symbol: 'LineaETH',
    blockExplorer: 'https://explorer.goerli.linea.build',
    rpcUrl: 'https://rpc.goerli.linea.build',
  },
  '0x5': {
    name: 'Goerli',
    contractAddress: '',
    symbol: 'GoerliETH',
    blockExplorer: 'https://goerli.etherscan.io',
    rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
  '0x14a33': {
    name: 'Goerli Base',
    contractAddress: '',
    symbol: 'BaseETH',
    blockExplorer: 'https://goerli.basescan.org',
    rpcUrl: 'https://goerli.base.org',
  },
  
  '0x1a4': {
    name: 'Goerli Optimism',
    contractAddress: '',
    symbol: 'OptimismETH',
    blockExplorer: 'https://goerli-optimism.etherscan.io',
    rpcUrl: 'https://optimism-goerli.publicnode.com',
  }
}

/**
 * It returns true if the id is a key of the config object
 * @param {string | null} [id] - The network ID of the network you want to check.
 * @returns A function that takes an id and returns a boolean.
 */
export const isSupportedNetwork = (id?: string | null): id is keyof typeof config => {
  if (!id) {
    return false
  }
  const isHexChain = id.startsWith('0x')
  const networkId = isHexChain ? id : `0x${Number(id).toString(16)}` // if not hexstring transform to hexString
  // Make sure that networkId is in our supported network and is the current network set in .env
  return !!(networkId in config && process.env.NEXT_PUBLIC_NETWORK_ID === networkId)
}