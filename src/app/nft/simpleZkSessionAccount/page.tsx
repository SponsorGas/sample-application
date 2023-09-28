'use client'
import Image from 'next/image'
import { Identity } from "@semaphore-protocol/identity"
import {  Contract, ethers } from "ethers";
import xSuperhackNFT from './NAVHHackerNFT.png'
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import { defaultAbiCoder, hexlify} from 'ethers/lib/utils';
import PaymasterModal from '@/components/PaymasterModal';
import {  getBlockExplorerURLByChainId,getEntryPointContractAddressByChainId,getNFTContractAddressByChainId,getPimlicoChainNameByChainId } from "@/lib/config";
import HorizontalLoading from '@/components/HorizontalLoading';
import { Dialog, Transition } from '@headlessui/react';
import { useSponsorGas, getPaymasters }  from 'sponsor-gas-sdk';
import { Paymaster } from 'sponsor-gas-sdk/dist/model';
import { useToast } from '@/providers/ToastProvider';
import { SimpleZkSessionAccount } from '@/utils/zkSessionAccount';
import { NAVHHackerNFT__factory, SimpleZkSessionAccount__factory } from '@/typechain-types';
import generateProof from '@/utils/zkSessionAccountProof';

export interface Session{
    sessionCommitment:string,
    // The UNIX timestamp (seconds) when the permission is not valid anymore (0 = infinite)
    validUntil:number,
    // The UNIX timestamp when the permission becomes valid
    validAfter:number
}

export default function NFT() {

  const { wallet, connectMetaMask } = useMetaMask()
  const [selectedWalletType,setSelectedWalletType] = useState<string>('SCW')
  const [scwAddress,setSCWAddress] = useState('')
  const [isLoading,setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(5); // Default to 5 minutes
  const [session,setSession] = useState<Session>()
  const [identity,setIdentity] = useState<Identity>()
  const { addToast } = useToast();
  const [transactionReceipt,setTransactionReceipt] = useState('')
  
  const nftContractAddress = useMemo(() => {
    if (wallet.chainId) {
      return getNFTContractAddressByChainId(wallet.chainId);
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
    // Handle the logic for granting permissions here
    console.log('Session Time:', sessionTime);
    const sessionStartTime = new Date(Date.now());
    const sessionEndTime = (new Date( Date.now() + sessionTime*60*1000))
    // Close the modal
     // eth_signTypedData_v4 parameters. All of these parameters affect the resulting signature.
    const msgParams = JSON.stringify({
      domain: {
        // This defines the network, in this case, Mainnet.
        chainId: wallet.chainId,
        // Give a user-friendly name to the specific contract you're signing for.
        name: 'NAVHHackerNFT',
        // Add a verifying contract to make sure you're establishing contracts with the proper entity.
        verifyingContract: nftContractAddress,
        // This identifies the latest version.
        version: '1',
      },

      // This defines the message you're proposing the user to sign, is dapp-specific, and contains
      // anything you want. There are no required fields. Be as explicit as possible when building out
      // the message schema.
      message: {
        contents: 'New NavhHackerNFT Session',
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
    if(wallet.accounts.length > 0){
      const signedMessage = await window.ethereum?.request({
        method: 'eth_signTypedData_v4',
        params: [wallet.accounts[0], msgParams],
      })
      console.log(signedMessage)
      
      const identity = new Identity();
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
      const simpleZkAccount = new SimpleZkSessionAccount(signer)
      const [simpleAccountAddress,initCode] = await simpleZkAccount.getUserSimpleZkAccountAddress()
      const simpleZkAccountContract = SimpleZkSessionAccount__factory.connect(
        simpleAccountAddress!,
        signer,
      )
      
      console.log(session)
      let callData = simpleZkAccountContract.interface.encodeFunctionData("setSessionForApplication",[nftContractAddress!,session])
      console.log(callData)

      const gasPrice = await signer.getGasPrice()
      console.log(`Checking Nonce of: ${simpleAccountAddress}`)

      if (provider == null) throw new Error('must have entryPoint to autofill nonce')
      const c = new Contract(simpleAccountAddress!, [`function getNonce() view returns(uint256)`], provider)
      const nonceValue = await getNonceValue(c)
      console.log(nonceValue)
      const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
      const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
      const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
      const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
      const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
      const userOperation = {
        sender: simpleAccountAddress,
        nonce:hexlify(nonceValue),
        initCode:nonceValue === 0?initCode:'0x',
        callData,
        callGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
        verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
        preVerificationGas: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
        maxFeePerGas: ethers.utils.hexlify(gasPrice),
        maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
        paymasterAndData: "0x",
        signature: "0x"
      }
        // const paymasterAndData = await getPaymasterAndData(userOperation,wallet.chainId,selectedPaymaster!,entryPointContractAddress)
        const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
          userOperation,
          {
            entryPoint: entryPointContractAddress,
          },
        ])
         
        const paymasterAndData = sponsorUserOperationResult.paymasterAndData
         
        setLoading(true)
        
        console.log(`PaymasterAndData promise: ${paymasterAndData}`)
        
        if (paymasterAndData){
          userOperation.paymasterAndData = paymasterAndData

          const userOpHash = await simpleZkAccount._entryPoint.getUserOpHash(userOperation)
          const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          console.log(ethers.utils.verifyMessage(ethers.utils.arrayify(userOpHash),signature))
          console.log(await signer.getAddress())
          const sessionMode = '0x00000000'
          console.log(defaultAbiCoder.encode(['bytes4'],[sessionMode]));
          // const encodedSignature = defaultAbiCoder.encode(['bytes4','bytes'], [sessionMode,signature]);
          const encodedSignature = defaultAbiCoder.encode(['bytes4'],[sessionMode])+ signature.substring(2)
          userOperation.signature = encodedSignature
          
          console.log("UserOperation signature:", signature)
          console.log(`Encoded Signature: ${encodedSignature}`)
          console.log(userOperation)

          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
            userOperation,
            entryPointContractAddress // ENTRY_POINT_ADDRESS
          ])

          console.log("UserOperation hash:", userOperationHash)
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
          console.log(wallet.chainId, blockExplorer)
          console.log(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
          addToast("Successfully Submitted User Operation",'success')
          setSession(session)
          setLoading(false)
          } else {
          console.log('Invalid PaymasterAndData.');
          }
    }else{
      connectMetaMask('0xe704')
    }
  };

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
    const fetchSCWAddress = async() =>{
      const signer = provider.getSigner();
      const simpleZkSessionAccount = new SimpleZkSessionAccount(signer);
      const [simpleZkSessionAccountAddress] = await simpleZkSessionAccount.getUserSimpleZkAccountAddress();
      setSCWAddress(simpleZkSessionAccountAddress);
    }
    if(wallet.accounts.length > 0){
      console.log(`useEffect fetchSCWAddress executing`)
      fetchSCWAddress()
    }
      
  }, [wallet]);

  const handleMint = async () => {
    // Implement stake functionality using ethers.js
    try{
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      )
      const signer = provider.getSigner()
      const metadataFile = 'bafybeihiawt2btyclrj7hvihmpfrqlf6pcje6qfmwxlydql3k3lsfc7u7m'
      if(selectedWalletType === 'SCW'){
        const simpleZkSessionAccount = new SimpleZkSessionAccount(signer)
        const [simpleAccountAddress,initCode] = await simpleZkSessionAccount.getUserSimpleZkAccountAddress()
        const to =  nftContractAddress!;
        const value = ethers.utils.parseEther('0')
        const NAVHHackerNFTContracts = await NAVHHackerNFT__factory.connect( nftContractAddress!, provider );
        const mintingCall = NAVHHackerNFTContracts.interface.encodeFunctionData("mintNFT",[simpleAccountAddress,metadataFile])
        const data = mintingCall
        console.log(`Mint call data: ${data}`)
        const simpleZkSessionAccountContract = SimpleZkSessionAccount__factory.connect(
          simpleAccountAddress!,
          signer,
        )
        const session =  await simpleZkSessionAccountContract.getSessionForApplication(nftContractAddress);
        console.log(session);
        let callData = simpleZkSessionAccountContract.interface.encodeFunctionData("execute", [to, value,data])
        console.log("Generated callData:", callData)

        
        // FILL OUT REMAINING USER OPERATION VALUES
        const gasPrice = await signer.getGasPrice()
        console.log(`Checking Nonce of: ${simpleAccountAddress}`)
  
        if (provider == null) throw new Error('must have entryPoint to autofill nonce')
        const c = new Contract(simpleAccountAddress!, [`function getNonce() view returns(uint256)`], provider)
        const nonceValue = await getNonceValue(c)
        console.log(nonceValue)
        const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
        const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
        const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
        const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
        const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        const userOperation = {
          sender: simpleAccountAddress,
          nonce:hexlify(nonceValue),
          initCode:nonceValue === 0?initCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
        }
        // const paymasterAndData = await getPaymasterAndData(userOperation,wallet.chainId,selectedPaymaster!,entryPointContractAddress)
        const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
          userOperation,
          {
            entryPoint: entryPointContractAddress,
          },
        ])
         
        const paymasterAndData = sponsorUserOperationResult.paymasterAndData
         
        setLoading(true)
        
        console.log(`PaymasterAndData promise: ${paymasterAndData}`)
        if (paymasterAndData && identity){
          userOperation.paymasterAndData = paymasterAndData

          const userOpHash = await simpleZkSessionAccount._entryPoint.getUserOpHash(userOperation)
          
          const nullifier = identity.nullifier;
          const trapdoor = identity.trapdoor;
          const externalNullifier =  BigInt(userOpHash) >> BigInt(8) //BigInt(solidityKeccak256(['bytes'],[calldataHash])) >> BigInt(8)
          
          const {proof,publicSignals} = await generateProof(trapdoor,nullifier,externalNullifier)
          const sessionProof: any[8] = proof
          const proofInput: any[3] = publicSignals
          const argv = sessionProof.map((x:any) => BigInt(x))
          console.log(argv)
          const hexStrings = argv.map((n:BigInt) => '0x' + n.toString(16));

          const sessionMode = '0x00000001' // '0x00000001' for session mode, '0x00000000' for direct signature mode
          // Encode the array of hex strings
          const encodedSessionProof = defaultAbiCoder.encode(['bytes4','address','uint256','uint256[8]'], [sessionMode,nftContractAddress,proofInput[1],hexStrings]);
          console.log(`SessionProof encoded: ${encodedSessionProof}`);
          
          
          userOperation.signature = encodedSessionProof
          
          console.log("UserOperation signature:", encodedSessionProof)
          console.log(userOperation)

          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
            userOperation,
            entryPointContractAddress // ENTRY_POINT_ADDRESS
          ])

          console.log("UserOperation hash:", userOperationHash)
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
          console.log(wallet.chainId, blockExplorer)
          console.log(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
          addToast("Successfully Submitted User Operation",'success')
          setTransactionReceipt(`${blockExplorer}/tx/${txHash}`)
          } else {
          console.log('Invalid PaymasterAndData.');
          
        }  
      }

    }catch(e){
      console.error(e)
      addToast("Error Occurred.",'error')
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

  if(isLoading){
    return (
      <Transition.Root show={isLoading} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={()=>setLoading(false)}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg lg:max-w-5xl">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                    <div className='flex flex-col items-center w-full '>
                        <HorizontalLoading />
                        <p>Waiting for tx completion...</p>
                    
                    </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    )
  }

  return (
    <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
      <div className='flex flex-col items-center w-full '>
        <div className="bg-white p-4 rounded-xl mb-4 flex flex-col items-center w-2/4">
          <Image className="h-2/6 w-auto rounded-full border-white" src={xSuperhackNFT} alt="xSuperhackNFT" />
          {session && <SessionCountdown onSessionExpired={handleSessionExpiry} sessionTime={session.validUntil - (Math.round(Date.now()/1000))} />}
          <p className="text-md mb-2 text-center">NAVH celebrates web3 developers, NFT artists, students, community builders, product specialists, and futurists, among others, empowering them to make a meaningful impact through innovation, blockchain, and collaboration. </p>
          <p className="text-md mb-2 text-center">{`Whether you're a developer, a designer, an entrepreneur, or a visionary with an idea that's ready to shake things up, this hackathon is for you.`}</p>
         
          {(wallet.accounts.length === 0 || !session) && 
            <div  className="flex gap-2 ">
              <button 
              type={'button'}
              className="inline-flex items-center gap-x-2 rounded-md px-3 py-1.5 text-white  bg-violet-500  text-sm font-semibold  shadow-sm hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              onClick={handleLogin}
              >
                Login
              </button>
              <button 
              type={'button'}
              className="inline-flex items-center gap-x-2 rounded-md px-3 py-1.5 text-white   bg-violet-500 text-sm font-semibold  shadow-sm hover:bg-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              onClick={handleConfigureSession}
              >
                Configure Session
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
                                    {/* <div className="ml-2 text-sm text-gray-700 mb-2 ">
                                      {paymasterList.length > 0  
                                        ? (selectedPaymaster 
                                            ? <>
                                                <span className="text-gray-600 mb-2 ">{` ${selectedPaymaster?.name} `}</span>
                                                <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Change`}</span>
                                              </>
                                            : <>
                                                <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Click `}</span>
                                                <span>{`to choose from ${paymasterList.length} sponsors`}</span>
                                              </>)
                                        : <span>{`${paymasterList.length} sponsors available`}</span>
                                      }
                                    </div> */}
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
                                      <option value={5}>5 minutes</option>
                                      <option value={10}>10 minutes</option>
                                      <option value={30}>30 minutes</option>
                                    </select>
                                  </div>
                                  <div className="flex justify-end">
                                    {/* <button
                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                      onClick={handleModalClose}
                                    >
                                      Save
                                    </button> */}
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
            {/* <div className="ml-2 text-sm text-gray-700 mb-2 ">
              {paymasterList.length > 0  
                ? (selectedPaymaster 
                    ? <>
                        <span className="text-gray-600 mb-2 ">{` ${selectedPaymaster?.name} `}</span>
                        <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Change`}</span>
                      </>
                    : <>
                        <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Click `}</span>
                        <span>{`to choose from ${paymasterList.length} sponsors`}</span>
                      </>)
                : <span>{`${paymasterList.length} sponsors available`}</span>
              }
            </div> */}
            {(session) && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleMint}
              >
                MINT
              </button>
            )}
          <p className="text-xs mb-4">{`Supported networks:  Linea`}</p>
        </div>
        {transactionReceipt != '' && <TransactionReceiptModal isOpen={transactionReceipt != '' ?true:false} 
				setOpen={async (arg) => {
					setTransactionReceipt('')
				}} 
				receiptLink={transactionReceipt} />}
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
        <p className='font-bold text-lg' >Session Time Remaining:<span className='font-semibold text-lg'> {formatTime(timeRemaining)}</span> </p>
      ) : (
        <p>Session Expired</p>
      )}
    </div>
  );
};

interface TransactionReceiptModalProps{
	isOpen:boolean
	setOpen(arg0:boolean):void
	receiptLink:string
}
function TransactionReceiptModal({isOpen,setOpen,receiptLink}:TransactionReceiptModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10"  onClose={setOpen}>
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
                <div className="bg-white flex flex-col px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h2 className='text-xl font-semibold'>Transaction Receipt</h2>
                  <div className="sm:flex flex-col sm:items-start">
							      <p className="text-gray-600 mb-1">Receipt: 
											<a href={receiptLink} className="text-blue-600 font-semibold"
											 target="_blank"
											 title="Open in Block Explorer">
												{` Receipt link`}
											</a>
										</p>
                    {/* <PaymastersGrid paymasterList={paymasterList} selectedPaymaster={selectedPaymaster} setSelectPaymaster={setSelectPaymaster}/> */}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </button>
                 
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
