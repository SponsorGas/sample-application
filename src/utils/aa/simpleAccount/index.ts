import { Contract, ethers } from "ethers"
import ENTRY_POINT_ABI from "./abis/EntryPoint.json"
import SIMPLE_ACCOUNT_FACTORY_ABI from "./abis/SimpleAccountFactory.json"
import SIMPLE_ACCOUNT_ABI from "./abis/SimpleAccount.json"
import { EntryPoint, SimpleAccountFactory,SimpleAccount as SimpleAccountContract } from "./abis/types"

// GENERATE THE INITCODE
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = "0x9406Cc6185a346906296840746125a0E44976454"
const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

export class SimpleAccount {
    readonly _simpleAccountFactory: SimpleAccountFactory;
    readonly _entryPoint: EntryPoint;
    readonly _signer
    /**
     * @notice Create PaymasterApplicationsRegistry instance to interact with
     * @param signerOrProvider signer or provider to use
     */
    constructor(signer: ethers.providers.JsonRpcSigner ) {
      this._simpleAccountFactory = new Contract(SIMPLE_ACCOUNT_FACTORY_ADDRESS, SIMPLE_ACCOUNT_FACTORY_ABI, signer) as SimpleAccountFactory
      this._entryPoint = new Contract(ENTRY_POINT_ADDRESS,ENTRY_POINT_ABI,signer) as EntryPoint
      this._signer = signer
    }

    async getUserSimpleAccountAddress(): Promise<[simpleAccountAddress:string,initCode:string]>  {
        try{
            const initCode = ethers.utils.hexConcat([
                SIMPLE_ACCOUNT_FACTORY_ADDRESS,
                this._simpleAccountFactory.interface.encodeFunctionData("createAccount", [await this._signer.getAddress(), 0]),
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

    getSimpleAccountContract(address:string):SimpleAccountContract  {
        return  new Contract(address,SIMPLE_ACCOUNT_ABI,this._signer) as SimpleAccountContract 
     }
}
 
