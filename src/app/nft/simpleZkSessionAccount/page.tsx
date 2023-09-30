'use client'
import React, { Fragment, useEffect, useMemo, useState } from "react";
import Image from 'next/image'
import demoNFT from './DemoNFT.png'
import generateProof from '@/utils/aa/zkSessionAccountProof';
import { Identity } from "@semaphore-protocol/identity"
import {  Contract, ethers } from "ethers";
import { useMetaMask } from '@/hooks/useMetaMask';
import { defaultAbiCoder, hexlify} from 'ethers/lib/utils';
import { Dialog, Transition } from '@headlessui/react';
import { useToast } from '@/providers/ToastProvider';
import { ZkSessionAccount } from '@/utils/aa/zkSessionAccount';
import { getDemoNFTContract } from '@/utils/sampleApplications';
import {  getBlockExplorerURLByChainId,getDemoNFTContractAddressByChainId,getEntryPointContractAddressByChainId,getPimlicoChainNameByChainId } from "@/lib/config";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import { formatAddress } from "@/utils/common";
import TooltipCopyTextButton from "@/components/TooltipCopyTextButton";

export interface Session{
    sessionCommitment:string,
    validUntil:number,
    validAfter:number
}

export default function NFT() {

  const { wallet, connectMetaMask } = useMetaMask()
  const [scwAddress,setSCWAddress] = useState('')
  const [scwInitCode,setSCWInitCode] = useState('')
  const [isLoading,setLoading] = useState(false)
  const [logMessage,setLogMessage] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(0); // Default to 5 minutes
  const [session,setSession] = useState<Session>()
  const [identity,setIdentity] = useState<Identity>()
  const { addToast } = useToast();
  const [transactionReceipt,setTransactionReceipt] = useState('')
  
  const nftContractAddress = useMemo(() => {
    if (wallet.chainId) {
      return getDemoNFTContractAddressByChainId(wallet.chainId);
    }
    return '0x';
  }, [wallet.chainId]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSessionExpiry = () => {
   setSession(undefined)
  }
  const handleLogin = async () => {
    try{
      setLoading(true)
      setLogMessage("Waiting user sign on session data...")
      const sessionStartTime = new Date(Date.now());
      const sessionEndTime = (new Date( Date.now() + sessionTime*60*1000))
      // Close the modal
      // eth_signTypedData_v4 parameters. All of these parameters affect the resulting signature.
      const msgParams = JSON.stringify({
        domain: {
          // This defines the network, in this case, Mainnet.
          chainId: wallet.chainId,
          // Give a user-friendly name to the specific contract you're signing for.
          name: 'DemoNFT',
          // Add a verifying contract to make sure you're establishing contracts with the proper entity.
          verifyingContract: scwAddress,
          // This identifies the latest version.
          version: '1',
        },

        // This defines the message you're proposing the user to sign, is dapp-specific, and contains
        // anything you want. There are no required fields. Be as explicit as possible when building out
        // the message schema.
        message: {
          contents: 'Demo NFT Session',
          sessionStartTime: sessionStartTime.toLocaleString(),
          sessionEndTime: sessionEndTime.toLocaleString() 
        },
        // This refers to the keys of the following types object.
        primaryType: 'Session',
        types: {
          // This refers to the domain the contract is hosted on.
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          
          // Refer to primaryType.
          Session: [
            { name: 'contents', type: 'string' },
            { name: 'sessionStartTime', type: 'string' },
            { name: 'sessionEndTime', type: 'string' },
          ],
        },
      });

      if(wallet.accounts.length > 0 && scwAddress!='' && scwInitCode!=''){
        const signedMessage = await window.ethereum?.request({
          method: 'eth_signTypedData_v4',
          params: [wallet.accounts[0], msgParams],
        }) as string
        
        const identity = new Identity(signedMessage);
        setIdentity(identity)
        const session:Session={
          sessionCommitment:identity.commitment.toString(),
          validAfter:Math.round(sessionStartTime.getTime()/1000),
          validUntil:Math.round(sessionEndTime.getTime()/1000)
        }
        console.log('Session :',session)
      

        const provider = new ethers.providers.Web3Provider(
          window.ethereum as unknown as ethers.providers.ExternalProvider
        );
        const signer = provider.getSigner();
        const zkSessionAccount = new ZkSessionAccount(signer,wallet.chainId)
        const simpleZkAccountContract = zkSessionAccount.getSimpleZkAccountContract(scwAddress)
        let callData = simpleZkAccountContract.interface.encodeFunctionData("setSessionForApplication",[nftContractAddress!,session])
        console.log(callData)

        const gasPrice = await signer.getGasPrice()
        if (provider == null) throw new Error('must have entryPoint to autofill nonce')
        const c = new Contract(scwAddress, [`function getNonce() view returns(uint256)`], provider)
        const nonceValue = await getNonceValue(c)
        const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
        const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
        const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
        const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
        const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        const userOperation = {
          sender: scwAddress,
          nonce:hexlify(nonceValue),
          initCode:nonceValue === 0?scwInitCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
        }
        setLogMessage("Waiting paymaster signature...")
        const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
          userOperation,
          {
            entryPoint: entryPointContractAddress,
          },
        ])
        const paymasterAndData = sponsorUserOperationResult.paymasterAndData
        console.log(`paymasterAndData: ${paymasterAndData}`)
        
        
        if (paymasterAndData){
          userOperation.paymasterAndData = paymasterAndData
          const userOpHash = await zkSessionAccount._entryPoint.getUserOpHash(userOperation)
          setLogMessage("Waiting user signature...")
          const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          const sessionMode = '0x00000000'
          const encodedSignature = defaultAbiCoder.encode(['bytes4'],[sessionMode])+ signature.substring(2)
          userOperation.signature = encodedSignature
          console.log(userOperation)
        
          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
            userOperation,
            entryPointContractAddress // ENTRY_POINT_ADDRESS
          ])
          console.log("UserOperation hash:", userOperationHash)
          setLogMessage("Waiting userOperation receipt...")
          // let's also wait for the userOperation to be included, by continually querying for the receipts
          console.log("Querying for receipts...")
          let receipt = null
          while (receipt === null) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            receipt = await pimlicoProvider.send("eth_getUserOperationReceipt", [
            userOperationHash,
          ]);
            console.log(receipt === null ? "Still waiting..." : receipt)
          }

          const txHash = receipt.receipt.transactionHash
          const blockExplorer = getBlockExplorerURLByChainId(wallet.chainId)
          console.log(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
          addToast("Successfully started session",'success')
          setLogMessage("")
          setSession(session)
          setLoading(false)
        } else {
          console.error('Invalid PaymasterAndData.');
          setLogMessage("")
        }
      }else{
        connectMetaMask('0xe704')
      }
    }catch(e){
      console.error(e)
      addToast("Error Occurred.",'error')
      setLogMessage("")
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
    const fetchSCWAddressAndCode = async() =>{
      const signer = provider.getSigner();
      const zkSessionAccount = new ZkSessionAccount(signer,wallet.chainId);
      const [simpleZkSessionAccountAddress,initCode] = await zkSessionAccount.getUserSimpleZkAccountAddress();
      setSCWAddress(simpleZkSessionAccountAddress);
      setSCWInitCode(initCode);
    }
    
    if(wallet.accounts.length > 0){
      fetchSCWAddressAndCode()
      if (session) {
        setLogMessage("You can mint now");
      } else if (sessionTime === 0) {
        setLogMessage("Configure Session time");
      } else {
        setLogMessage("You can Login now");
      } 
    }else{
      setLogMessage("Please Connect Wallet")
    }
    
  }, [session, sessionTime, wallet]);

  const handleMint = async () => {
    try{
      setLoading(true)
      setLogMessage("Processing request...")
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      )
      const signer = provider.getSigner()
      const metadataFile = 'bafybeifyl3g3wr24zqlxplb37zzxykk6crcl6wbvn7fcpi3rwnnerqzjpm'
      if(wallet.accounts.length > 0 && scwAddress != '' && scwInitCode!=''){
        const zkSessionAccount = new ZkSessionAccount(signer,wallet.chainId)
        const simpleZkSessionAccountContract = zkSessionAccount.getSimpleZkAccountContract(scwAddress)
        const to =  nftContractAddress!;
        const value = ethers.utils.parseEther('0')
        const demoNFTContracts = getDemoNFTContract(nftContractAddress!,provider.getSigner()) //await NAVHHackerNFT__factory.connect( nftContractAddress!, provider );
        const mintingCall = demoNFTContracts.interface.encodeFunctionData("mintNFT",[scwAddress,metadataFile])
        const data = mintingCall
        let callData = simpleZkSessionAccountContract.interface.encodeFunctionData("execute", [to, value,data])
        console.log("Generated callData:", callData)
        
        const gasPrice = await signer.getGasPrice()
  
        if (provider == null) throw new Error('must have entryPoint to autofill nonce')
        const c = new Contract(scwAddress!, [`function getNonce() view returns(uint256)`], provider)
        const nonceValue = await getNonceValue(c)
        const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
        const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
        const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
        const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
        const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        const userOperation = {
          sender: scwAddress,
          nonce:hexlify(nonceValue),
          initCode:nonceValue === 0?scwInitCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
        }
        setLogMessage("Waiting paymaster signature...")
        const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
          userOperation,
          {
            entryPoint: entryPointContractAddress,
          },
        ])
         
        const paymasterAndData = sponsorUserOperationResult.paymasterAndData
        console.log(`PaymasterAndData: ${paymasterAndData}`)
        if (paymasterAndData && identity){
          setLogMessage("Generating proof of session...")
          userOperation.paymasterAndData = paymasterAndData
          const userOpHash = await zkSessionAccount._entryPoint.getUserOpHash(userOperation)
          const nullifier = identity.nullifier;
          const trapdoor = identity.trapdoor;
          const externalNullifier =  BigInt(userOpHash) >> BigInt(8) //BigInt(solidityKeccak256(['bytes'],[calldataHash])) >> BigInt(8)
          const {proof,publicSignals} = await generateProof(trapdoor,nullifier,externalNullifier)
          const sessionProof: any[8] = proof
          const proofInput: any[3] = publicSignals
          const argv = sessionProof.map((x:any) => BigInt(x))
          const hexStrings = argv.map((n:BigInt) => '0x' + n.toString(16));
          const sessionMode = '0x00000001' // '0x00000001' for session mode, '0x00000000' for direct signature mode
          // Encode the array of hex strings
          const encodedSessionProof = defaultAbiCoder.encode(['bytes4','address','uint256','uint256[8]'], [sessionMode,nftContractAddress,proofInput[1],hexStrings]);
          userOperation.signature = encodedSessionProof
          console.log(userOperation)

          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
            userOperation,
            entryPointContractAddress // ENTRY_POINT_ADDRESS
          ])
          console.log("UserOperation hash:", userOperationHash)
          setLogMessage("Waiting UserOperation Receipt...")
          // let's also wait for the userOperation to be included, by continually querying for the receipts
          console.log("Querying for receipts...")
          let receipt = null
          while (receipt === null) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            receipt = await pimlicoProvider.send("eth_getUserOperationReceipt", [
            userOperationHash,
          ]);
            console.log(receipt === null ? "Still waiting..." : receipt)
          }

          const txHash = receipt.receipt.transactionHash
          const blockExplorer = getBlockExplorerURLByChainId(wallet.chainId)
          addToast("Successfully minted DEMO NFT",'success')
          setTransactionReceipt(`${blockExplorer}/tx/${txHash}`)
          setLogMessage("")
          } else {
          console.log('Invalid PaymasterAndData.');
          setLogMessage("")
          
        }  
      }

    }catch(e){
      console.error(e)
      addToast("Error Occurred.",'error')
      setLogMessage("")
    }finally{
      setLoading(false)
    }
   
  };

  const getNonceValue = async (c:Contract) => {
    let nonceValue = 0;
    try {
      nonceValue = await c['getNonce']();
      
    } catch (error) {
      console.error("Error fetching nonce:", error);
    }finally{
      return nonceValue
    }
  }

  const handleConfigureSession = async () =>{
    setIsModalOpen(true)

  }
  const handleConnectWallet = async () => {
    if(wallet.accounts.length == 0 ){
      await connectMetaMask('0xe704')
    }
  }

  return (
    <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
      <div className='flex flex-col items-center w-full '>
        <div className="bg-white p-4 rounded-xl mb-4 flex flex-col gap-2 dark:text-black items-center w-2/4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1">
              <span>Account: </span>
              {scwAddress 
                ?<TooltipCopyTextButton textToDisplay={formatAddress(scwAddress)} textToCopy={scwAddress}/>
                : <span className="text-sm">{`NotConnected`}</span> 
              }
            </div>
            <span className="font-bold">Pimlico Paymaster</span>
            <div className="flex items-center gap-1">
              <span>Session Time:</span>
              {
                session 
                ?<SessionCountdown onSessionExpired={handleSessionExpiry} sessionTime={session.validUntil - (Math.round(Date.now()/1000))} />
                : sessionTime == 0
                  ?<span className="text-sm">{`Not Configured`}</span> 
                  : `${sessionTime} min`
              }
              </div>
            <Cog6ToothIcon className="h-6 w-6 cursor-pointer" onClick={handleConfigureSession}/>
          </div>
          <div className="flex items-center  text-black dark:text-black text-sm font-bold px-4 py-3" role="alert">
            <p>{logMessage}</p>
          </div>
          <Image className="h-2/6 w-auto rounded-full border-black border-solid" src={demoNFT} alt="DemoNFT" />
          
          <p className="text-md mb-2  text-black dark:text-black  text-center">{`Utilizing zero-knowledge proofs in session-based access control mechanisms can provide a robust solution for achieving a harmonious blend of user security and a frictionless user experience.`}</p>
          <p className="text-md mb-2  text-black dark:text-black  text-center">{`This application serves as an example demonstrating a zk session-based smart contract account, eliminating the need for third-party involvement. `}</p>
         
          {(wallet.accounts.length === 0 || !session) && 
            <div  className="flex gap-2 ">
              <button 
              type={'button'}
              className="bg-blue-500 text-white py-2 px-4 gap-1 rounded-md mr-2 inline-flex"
              onClick={handleLogin}
              disabled={isLoading || sessionTime === 0}
              >
                 {isLoading && <CircularLoading />}
                 {isLoading ? `Logging In`:`Login With EOA`}
              </button>
            </div>
            }
            {isModalOpen && (
               <Transition.Root show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={()=>setIsModalOpen(false)}>
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                  </Transition.Child>
        
                  <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      >
                        <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-2xl">
                          <div className="bg-white rounded shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Start Session</h2>
                            <p className="text-gray-600 mb-4">
                              To use this application seamlessly, please select the session
                              time.
                            </p>
                            {wallet.accounts.length > 0 
                              ? <div>
                                  <div className="mb-4 flex flex-col">
                                    <label className="block text-gray-600 font-bold mb-2 ">
                                      Your SCW Address :<span className=" text-gray-600 ml-2 font-normal text-sm  mb-2 lowercase">{scwAddress} </span>
                                    </label>
                                  </div>
                                  <div className="mb-4 flex items-center">
                                    <label className="block text-gray-600 font-bold mb-2 ">
                                      Paymaster : 
                                    </label>
                                    <div className="ml-2 text-sm text-gray-700 mb-2 ">
                                      Pimlico Verifying Paymaster
                                    </div>
                                  </div>
                                  <div className="mb-4 flex items-center">
                                    <label className=" text-gray-600 font-bold ">
                                      Session Time:
                                    </label>
                                    <select
                                      className="ml-2 border border-gray-300 p-2 w-48 rounded"
                                      value={sessionTime}
                                      onChange={(e) => setSessionTime(parseInt(e.target.value))}
                                    >
                                      <option disabled value={0}>Select session time</option>
                                      <option value={5}>5 minutes</option>
                                      <option value={10}>10 minutes</option>
                                      <option value={30}>30 minutes</option>
                                    </select>
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      className="ml-2 bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                      onClick={handleModalClose}
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              : <div className="mb-4 flex justify-center space-y-4">
                                  <button 
                                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                  onClick={handleConnectWallet}
                                  >
                                    Connect Wallet
                                  </button>
                                </div>
                            }
                          </div>
                          
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </div>
                </Dialog>
              </Transition.Root>
            )}
            {(session) && (
              <button
                className="bg-blue-500 text-white inline-flex py-2 px-4 rounded-md mr-2"
                onClick={handleMint}
                disabled={isLoading}
              >
                {isLoading && <CircularLoading />}
                {isLoading ? `Minting`:`Mint`}
              </button>
            )}
          <p className="text-xs mb-4">{`Supported networks:  Linea`}</p>
          <p className="text-sm mb-4 text-center" >
            {`Feel free to explore it and don't hesitate to reach out to `}
            <span className="font-bold">@kdsinghsaini</span>
            {` on Telegram or Twitter for any inquiries.`}
          </p>
        </div>
        {transactionReceipt != '' 
          && <p className="text-gray-600 mb-1">UserOperation Receipt: 
              <a href={transactionReceipt} className="text-blue-600   dark:text-blue-600 font-semibold"
              target="_blank"
              title="Open in Block Explorer">
                {` link`}
              </a>
            </p>
          }
      </div>
    </div>
  );
}
interface ISessionCountdown{
  sessionTime:number
  onSessionExpired(): void
}
const SessionCountdown = ({ sessionTime ,onSessionExpired}:ISessionCountdown) => {
  const [timeRemaining, setTimeRemaining] = useState(sessionTime);

  // Function to format seconds into "hh:mm:ss" format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

    return formattedTime;
  };

  useEffect(() => {
    // Check if the session time is greater than 0
    if (timeRemaining > 0) {
      const countdown = setInterval(() => {
        // Decrement the time remaining by 1 second
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);

      // Clean up the interval when the component unmounts
      return () => clearInterval(countdown);
    }else{
      onSessionExpired && onSessionExpired()
    }
  }, [timeRemaining,onSessionExpired]);

  return (
    <div>
      {timeRemaining > 0 ? (
        <p className='font-bold text-lg' ><span className='font-semibold text-lg'> {formatTime(timeRemaining)}</span> </p>
      ) : (
        <p className="text-red-700">Expired</p>
      )}
    </div>
  );
};

const CircularLoading = () => {
  return (
    <svg aria-hidden="true" className="w-5 h-5 mr-2 text-white animate-spin dark:text-gray-600 fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
    </svg>
  );
};