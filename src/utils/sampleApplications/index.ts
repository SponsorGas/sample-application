import { Contract} from "ethers"
import STAKING_CONTRACT_ABI from "../../abis/StakingContract.json"
import X_SUPERHACK from "../../abis/xSuperhack.json"
import NAVH_HACKER_NFT_ABI from "../../abis/NAVHHackerNFT.json"
import { NAVHHackerNFT,StakingContract,XSuperhack } from "@/abis/types";
import { JsonRpcProvider,JsonRpcSigner } from '@ethersproject/providers'

export function getNAVHHackerNFTContract(address:string,signerOrProvider: JsonRpcProvider|JsonRpcSigner):NAVHHackerNFT  {
    return  new Contract(address,NAVH_HACKER_NFT_ABI,signerOrProvider) as NAVHHackerNFT 
  }
export function getXSuperhackNFTContract(address:string,signerOrProvider: JsonRpcProvider|JsonRpcSigner):XSuperhack  {
    return  new Contract(address,X_SUPERHACK,signerOrProvider) as XSuperhack 
  }
export function getStakingContract(address:string,signerOrProvider: JsonRpcProvider|JsonRpcSigner):StakingContract  {
    return  new Contract(address,STAKING_CONTRACT_ABI,signerOrProvider) as StakingContract 
  }

 
