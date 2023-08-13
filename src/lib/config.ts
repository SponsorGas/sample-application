interface ChainConfig {
  name: string;
  entryPointContractAddress:string;
  ethStakingContractAddress: string;
  xSuperhackContractAddress:string;
  symbol: string;
  pimlicoChainValue:string;
  blockExplorer: string;
  rpcUrl: string;
}

interface Config {
  [key: string]: ChainConfig;
}

export const config: Config = {
  
  '0x14a33': {
    name: 'Goerli Base',
    entryPointContractAddress:'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    ethStakingContractAddress:'0x7f829ab036fa3ac32928910152c78d93038dc3e2',
    xSuperhackContractAddress:'0x36d07d0b52eab491d714732c7cc79dc39e3ab373',
    symbol: 'BaseETH',
    pimlicoChainValue:'base-goerli',
    blockExplorer: 'https://goerli.basescan.org',
    rpcUrl: 'https://goerli.base.org',
  },
  '0x1a4': {
    name: 'Goerli Optimism',
    entryPointContractAddress:'0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
    ethStakingContractAddress:'0xe6e61b4cb54ecfc67421b61bcdc5a566d91888ae',
    xSuperhackContractAddress:'0x7F829Ab036fa3aC32928910152C78D93038Dc3e2',
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

