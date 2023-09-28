import { EntryPoint__factory, SimpleAccountFactory__factory } from "@/typechain-types";
import { EntryPoint } from "@/typechain-types/contracts/account_abstraction/core";
import { SimpleAccountFactory } from "@/typechain-types/contracts/account_abstraction/samples";
import { Wallet, ethers } from "ethers"

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
      this._simpleAccountFactory = SimpleAccountFactory__factory.connect( SIMPLE_ACCOUNT_FACTORY_ADDRESS, signer )
      this._entryPoint = EntryPoint__factory.connect( ENTRY_POINT_ADDRESS, signer)
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
}
 
