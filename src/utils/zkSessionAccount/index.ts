import { config } from "@/lib/config";
import { EntryPoint__factory, SimpleZkSessionAccountFactory__factory } from "@/typechain-types";
import { EntryPoint } from "@/typechain-types/contracts/account_abstraction/core";
import { SimpleZkSessionAccountFactory } from "@/typechain-types/contracts/account_abstraction/samples";
import {  ethers } from "ethers"

// GENERATE THE INITCODE
// const SIMPLE_ZK_SESSION_ACCOUNT_FACTORY_ADDRESS = '0x9EC308cce7E7baa370CC1F76179A57e0c333CA0B' //"0x1DFb3Fc1155D4564FEfcf3d1b67cDdc2C2867f22"//"0xCb4AcACe7De55D13e5979C4Ad4205f1fc818af1f" // "0x24271BF6830219be28a05b33e1ab0d94C1fd675F" with session timestamp
const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

export class SimpleZkSessionAccount {
   
    readonly _entryPoint: EntryPoint;
    readonly _signer
    /**
     * @notice Create PaymasterApplicationsRegistry instance to interact with
     * @param signerOrProvider signer or provider to use
     */
    constructor(signer: ethers.providers.JsonRpcSigner ) {
       this._entryPoint = EntryPoint__factory.connect( ENTRY_POINT_ADDRESS, signer)
        this._signer = signer
    }

    async getUserSimpleZkAccountAddress(): Promise<[simpleAccountAddress:string,initCode:string]>  {
        const chainConfig = config[`0x${(await this._signer.getChainId()).toString(16)}`]
        console.log(chainConfig.simpleZkSessionAccountFactory)
        const _simpleZkSessionAccountFactory: SimpleZkSessionAccountFactory = SimpleZkSessionAccountFactory__factory.connect( chainConfig.simpleZkSessionAccountFactory, this._signer )
        
        try{
            const initCode = ethers.utils.hexConcat([
                _simpleZkSessionAccountFactory.address,
              _simpleZkSessionAccountFactory.interface.encodeFunctionData("createAccount", [await this._signer.getAddress(), 0]),
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
 
