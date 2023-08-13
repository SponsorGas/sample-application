interface ApplicationConfig{
  applicationContractAddress:string
  name:string
}
interface ChainConfig {
  name: string;
  entryPointContractAddress:string;
  ethStakingContractAddress: string;
  symbol: string;
  pimlicoChainValue:string;
  blockExplorer: string;
  rpcUrl: string;
}

interface Config {
  [key: string]: ChainConfig;
}

export const config: Config = {
  '0xe704': {
    name: 'Goerli Linea',
    entryPointContractAddress:'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    ethStakingContractAddress:'0xea68b3efbbf63bb837f36a90aa97df27bbf9b864',
    symbol: 'LineaETH',
    pimlicoChainValue:'linea-testnet',
    blockExplorer: 'https://explorer.goerli.linea.build',
    rpcUrl: 'https://rpc.goerli.linea.build',
  },
  '0x14a33': {
    name: 'Goerli Base',
    entryPointContractAddress:'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    ethStakingContractAddress:'0x7f829ab036fa3ac32928910152c78d93038dc3e2',
    symbol: 'BaseETH',
    pimlicoChainValue:'base-goerli',
    blockExplorer: 'https://goerli.basescan.org',
    rpcUrl: 'https://goerli.base.org',
  },
  '0x1a4': {
    name: 'Goerli Optimism',
    entryPointContractAddress:'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    ethStakingContractAddress:'0xe6e61b4cb54ecfc67421b61bcdc5a566d91888ae',
    symbol: 'OptimismETH',
    pimlicoChainValue:'optimism-goerli',
    blockExplorer: 'https://goerli-optimism.etherscan.io',
    rpcUrl: process.env.OPRIMISM_GOERLI_RPC!,
  }
}

export const isSupportedNetwork = (id: string) => {
  if (!id) {
    return false;
  }
  const isHexChain = id.startsWith('0x');
  const networkId = isHexChain ? id : `0x${Number(id).toString(16)}`;
  return !!(networkId in config );
}


export const getEntryPointContractAddressByChainId = (chainId: string): string | undefined => {
  const chainConfig = config[chainId];
  if (chainConfig && isSupportedNetwork(chainId)) {
    return chainConfig.entryPointContractAddress
  } else {
    return ''; // Chain ID not found in config
  }
}
export const getPimlicoChainNameByChainId = (chainId: string): string | undefined => {
  const chainConfig = config[chainId];
  if (chainConfig && isSupportedNetwork(chainId)) {
    return chainConfig.pimlicoChainValue
  } else {
    return ''; // Chain ID not found in config
  }
}
export const getChainConfigForChainId = (chainId: string): ChainConfig | undefined=> {
  const chainConfig = config[chainId];
  if (chainConfig && isSupportedNetwork(chainId)) {
    return chainConfig;
  } 
}
export const getContractAddressByChainId = (chainId: string): string | undefined => {
  const chainConfig = config[chainId];
  
  if (chainConfig && isSupportedNetwork(chainId)) {
    return chainConfig.ethStakingContractAddress;
  } 
}
export const getBlockExplorerURLByChainId = (chainId: string): string | undefined => {
  const chainConfig = config[chainId];
  if (chainConfig && isSupportedNetwork(chainId)) {
    return chainConfig.blockExplorer;
  } 
}

