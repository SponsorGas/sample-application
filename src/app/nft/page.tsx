'use client'
import Image from 'next/image'
import {  Contract, ethers } from "ethers";
import xSuperhackNFT from './NAVHHackerNFT.png'
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import { SimpleAccount } from '@/utils/aa/simpleAccount';
import { hexlify } from 'ethers/lib/utils';
import PaymasterModal from '@/components/PaymasterModal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {  getBlockExplorerURLByChainId,getEntryPointContractAddressByChainId,getPimlicoChainNameByChainId } from "@/lib/config";
import HorizontalLoading from '@/components/HorizontalLoading';
import { Dialog, Transition } from '@headlessui/react';
import { useSponsorGas, getPaymasters }  from 'sponsor-gas-sdk';
import { Paymaster } from 'sponsor-gas-sdk/dist/model';
import { useToast } from '@/providers/ToastProvider';
import { getNAVHHackerNFTContract } from '@/utils/sampleApplications';
import TransactionReceiptModal from '@/components/TransactionReceiptModal';

export default function NFT() {

  const { wallet } = useMetaMask()
  const {getPaymasterAndData} = useSponsorGas()
  const [selectedWalletType,setSelectedWalletType] = useState<string>('EOA')
  const [hasMinted, setHasMinted] = useState<boolean>(false); // New state variable
  const [scwAddress,setSCWAddress] = useState('')
  const [mintedCount,setMintedCount] = useState<string>("0");

  const [isLoading,setLoading] = useState(false)
  const [loadingPaymasters, setLoadingPaymaster] = useState(true);
  const [paymasterList, setPaymasterList] = useState<Paymaster[]>([]);
  const [selectedPaymaster,setSelectedPaymaster] = useState<Paymaster>()
  const [paymasterModalIsOpen,setPaymasterModalIsOpen] = useState(false)
  const [transactionReceipt,setTransactionReceipt] = useState('')
  const { addToast } = useToast();
  
  const nftContractAddress = useMemo(() => {
    if (wallet.chainId) {
      return '0x2ceb1c6626da4cd3c2d48ed99536a59b7f8241b9' //getNFTContractAddressByChainId(wallet.chainId); on linea chain
    }
    return '0x2ceb1c6626da4cd3c2d48ed99536a59b7f8241b9';
  }, [wallet.chainId]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
    const fetchSCWAddress = async() =>{
      const signer = provider.getSigner();
      const simpleAccount = new SimpleAccount(signer);
      const [simpleAccountAddress] = await simpleAccount.getUserSimpleAccountAddress();
      setSCWAddress(simpleAccountAddress);
    }
    if(wallet.accounts.length > 0)
      fetchSCWAddress()
  }, [wallet]);

  
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );

		const fetchNFTData = async () => {
      const contract = getNAVHHackerNFTContract( nftContractAddress!, provider.getSigner() )
      let address=''
      try{
        if(selectedWalletType === 'EOA'){
          address = wallet.address
        }else if(selectedWalletType === 'SCW'){
          address = scwAddress
        }
        const nftCount = await contract.balanceOf(address);
        setHasMinted(nftCount.toNumber() > 0); // Check if staked amount is greater than 0
        setMintedCount(ethers.utils.formatEther(nftCount))
      }catch(e){
        console.error(e)
      }
      
			
		};
    if(wallet.accounts.length > 0 && nftContractAddress  && nftContractAddress != ''){
      fetchNFTData();
      setSelectedPaymaster(undefined)
    }
		
  }, [selectedWalletType, wallet, nftContractAddress, scwAddress]);


  useEffect(() => {
    const fetchRegisteredPaymaster = async () => {
      try {
        setLoadingPaymaster(true);
        if(wallet.chainId != ''){
          const chainId = wallet.chainId;
          if (chainId && nftContractAddress) {
            const paymasters = await getPaymasters(chainId, nftContractAddress);
            setPaymasterList(paymasters);
          } else {
            console.error("Chain ID or application contract address is missing.");
          }
          }
      } catch (error) {
        console.error("Error fetching paymasters:", error);
      } finally {
        setLoadingPaymaster(false);
      }
    };
    if(wallet.accounts.length > 0 && nftContractAddress  && nftContractAddress != ''){
      fetchRegisteredPaymaster();
    }else{
      setLoadingPaymaster(false)
    }
    
  }, [ nftContractAddress, wallet]);

  const handleSelectPaymaster = () =>{
    setPaymasterModalIsOpen(true);
  }

  const handleMint = async () => {
    // Implement stake functionality using ethers.js
    try{
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider,
      )
      const signer = provider.getSigner()
      const metadataFile = 'bafybeihiawt2btyclrj7hvihmpfrqlf6pcje6qfmwxlydql3k3lsfc7u7m'
      if(selectedWalletType === 'SCW'){
        const simpleAccount = new SimpleAccount(signer)
        const [simpleAccountAddress,initCode] = await simpleAccount.getUserSimpleAccountAddress()
        const to =  nftContractAddress!;
        const value = ethers.utils.parseEther('0')
        const mintingCall = getNAVHHackerNFTContract( nftContractAddress!,
                                  signer
                                ).interface.encodeFunctionData("mintNFT",[simpleAccountAddress,metadataFile])
        const data = mintingCall
        const simpleAccountContract = simpleAccount.getSimpleAccountContract( simpleAccountAddress! )
        let callData = simpleAccountContract.interface.encodeFunctionData("execute", [to, value, data])
        console.log("Generated callData:", callData)
  
        // FILL OUT REMAINING USER OPERATION VALUES
        const gasPrice = await signer.getGasPrice()
  
        if (provider == null) throw new Error('must have entryPoint to autofill nonce')
        const c = new Contract(simpleAccountAddress!, [`function getNonce() view returns(uint256)`], provider)
        const nonceValue = await getNonceValue(c)
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
      
          const paymasterAndData = await getPaymasterAndData(userOperation,wallet.chainId,selectedPaymaster!,entryPointContractAddress)
          setLoading(true)
          
          console.log(`PaymasterAndData: ${paymasterAndData}`)
          
          if (paymasterAndData){
            userOperation.paymasterAndData = paymasterAndData

            const userOpHash = await simpleAccount._entryPoint.getUserOpHash(userOperation)
            const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
            userOperation.signature = signature
            
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
            console.log(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
            addToast("Successfully Submitted User Operation",'success')
            setTransactionReceipt(`${blockExplorer}/tx/${txHash}`)
          } else {
            console.error('Invalid PaymasterAndData.');
          }
        }

    }catch(e){
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

  if (loadingPaymasters) {
    return <HorizontalLoading />;
  }

  if(isLoading){
    return <Transition.Root show={isLoading} as={Fragment}>
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
  }

  return (
    <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
      <div className='flex flex-col items-center w-full '>
        <div className="bg-white p-4 rounded-xl mb-4 flex flex-col items-center w-2/4">
          <Image className="h-2/6 w-auto rounded-full border-white" src={xSuperhackNFT} alt="xSuperhackNFT" />
          <p className="text-md mb-2 text-center">NAVH celebrates web3 developers, NFT artists, students, community builders, product specialists, and futurists, among others, empowering them to make a meaningful impact through innovation, blockchain, and collaboration. </p>
          <p className="text-md mb-2 text-center">{`Whether you're a developer, a designer, an entrepreneur, or a visionary with an idea that's ready to shake things up, this hackathon is for you.`}</p>
          {wallet.accounts.length === 0 && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 flex space-x-1" role="alert">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" /> 
            <span>Connect account signer to mint .</span>
          </div>}
          
          {wallet.accounts.length > 0 && <div className="mb-4 flex flex-col items-center space-y-4">
            <div className="flex  flex-col items-center  space-y-4 ">
              <div>
                <h3 className='my-2 font-semibold'>Choose account type : </h3>
              </div>
              <div className="flex flex-col items-start  space-y-4 ">
                {/* EOA Radio Button */}
                <div>
                  <label  key={"1"}  className="flex items-center justify-center cursor-pointer text-md" >
                    <input
                      type="radio"
                      value={`EOA`}
                      checked={selectedWalletType === 'EOA'}
                      onChange={() => setSelectedWalletType('EOA')}
                      className="form-radio text-indigo-600 h-4 w-4 mr-1 "
                    />
                    <span>{`EOA `}</span>
                    <span className="ml-2  text-xs text-gray-700 lowercase">{`(${wallet.address})`}</span>
                  </label>
                  <div className="ml-5 text-xs text-gray-700">{'Pay gas fee from your account.'}</div>
                </div>
                {/* SCW Radio Button */}
                <div>
                  <label
                    key={"2"}
                    className="inline-flex items-center cursor-pointer text-md"
                  >
                    <input
                      type="radio"
                      value={`SCW`}
                      checked={selectedWalletType === 'SCW'}
                      onChange={() => setSelectedWalletType('SCW')}
                      className="form-radio text-indigo-600 h-4 w-4 mr-1 "
                    />
                     <span>{`SCW `}</span>
                    <span className="ml-2  text-xs text-gray-700 lowercase">{`(${scwAddress})`}</span>
                    
                  </label>
                  {paymasterList.length >0 
                  ?<div className="ml-5 text-xs text-gray-700">
                    <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Click `}</span>
                    <span>{`to choose from ${paymasterList.length} sponsors`}</span>
                  </div>
                  :<div className="ml-5 text-xs text-gray-700">
                    <span>{`${paymasterList.length} sponsors available`}</span>
                  </div>
                  }
                  <div className="ml-5 text-xs text-gray-700">
                    {selectedPaymaster && <span>{` (${selectedPaymaster?.name} selected ) `}</span>}
                  </div>
                </div>
              </div>
              
            </div>
            {(selectedPaymaster ) && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleMint}
              >
                MINT
              </button>
            )}
          </div>}
        
          <p className="text-xs mb-4">{`Supported networks:  Linea`}</p>
        </div>
        {transactionReceipt != '' && <TransactionReceiptModal isOpen={transactionReceipt != '' ?true:false} 
				setOpen={async (arg) => {
					setTransactionReceipt('')
				}} 
				receiptLink={transactionReceipt} />}

         
      </div>
      <PaymasterModal isOpen={paymasterModalIsOpen} setOpen={setPaymasterModalIsOpen} selectedPaymaster={selectedPaymaster} setSelectPaymaster={setSelectedPaymaster}  paymasterList={paymasterList}/>
    </div>

  );
}



