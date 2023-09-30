import { config } from "@/lib/config";
import {  Contract, ethers } from "ethers"
import { EntryPoint, SimpleZkSessionAccountFactory ,SimpleZkSessionAccount} from "./abis/types";
import ENTRY_POINT_ABI from "./abis/EntryPoint.json"
import SIMPLE_ZK_SESSION_ACCOUNT_FACTORY_ABI from "./abis/SimpleZkSessionAccountFactory.json"
import SIMPLE_ZK_SESSION_ACCOUNT_ABI from "./abis/SimpleZkSessionAccount.json"

// GENERATE THE INITCODE
const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

export class ZkSessionAccount {
   
    readonly _entryPoint: EntryPoint;
    readonly _simpleZkSessionAccountFactory: SimpleZkSessionAccountFactory;
    readonly _signer
    /**
     * @notice Create PaymasterApplicationsRegistry instance to interact with
     * @param signerOrProvider signer or provider to use
     */
    constructor(signer: ethers.providers.JsonRpcSigner, chainId:string ) {
        const chainConfig = config[chainId]
        this._simpleZkSessionAccountFactory=  new Contract(chainConfig.simpleZkSessionAccountFactory,SIMPLE_ZK_SESSION_ACCOUNT_FACTORY_ABI,signer) as SimpleZkSessionAccountFactory 
        this._entryPoint = new Contract(ENTRY_POINT_ADDRESS,ENTRY_POINT_ABI,signer) as EntryPoint
        this._signer = signer
    }

    async getUserSimpleZkAccountAddress(): Promise<[simpleAccountAddress:string,initCode:string]>  {
        try{
            const initCode = ethers.utils.hexConcat([
                this._simpleZkSessionAccountFactory.address,
                this._simpleZkSessionAccountFactory.interface.encodeFunctionData("createAccount", [await this._signer.getAddress(), 0]),
            ])
            console.log("Generated initCode:", initCode)
            
            // CALCULATE THE SENDER ADDRESS
            const senderAddress = await this._entryPoint.callStatic.getSenderAddress(initCode)
            .then(() => {
                throw new Error("Expected getSenderAddress() to revert");
            })
            .catch((e) => {
                const data = e.message.match(/0x6ca7b806([a-fA-F\d]*)/)?.[1];
                if (!data) {
                return Promise.reject(new Error("Failed to parse revert data"));
                }
                const addr = ethers.utils.getAddress(`0x${data.slice(24, 64)}`);
                return Promise.resolve(addr);
            })
 
            console.log("Calculated sender address:", senderAddress)
            return [senderAddress,initCode]
        }catch(err){
            console.log(err)
        }
        return ['','']
    }

    getSimpleZkAccountContract(address:string):SimpleZkSessionAccount  {
       return  new Contract(address,SIMPLE_ZK_SESSION_ACCOUNT_ABI,this._signer) as SimpleZkSessionAccount 
    }
}
 
