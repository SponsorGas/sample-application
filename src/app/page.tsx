'use client'
import Image from 'next/image'
import {  Contract, ethers } from "ethers";
import application_accepted from './application_accepted.png'
import React, { useEffect, useMemo, useState } from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import { SimpleAccount } from '@/utils/simple_account';
import { SimpleAccount__factory } from '@account-abstraction/contracts';
import { StakingContract__factory } from '@/staking-typechain';
import { hexlify } from 'ethers/lib/utils';
import PaymasterModal from '@/components/PaymasterModal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {  getContractAddressByChainId,getEntryPointContractAddressByChainId,getPimlicoChainNameByChainId } from "@/lib/config";
import { Paymaster, SponsorGas } from '@/utils/sponsor_gas';
import useSponsorGas from '@/hooks/useSponsorGas';


export interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

export default function Home() {

  const { wallet } = useMetaMask()
  const {getPaymasterAndData,isChallengePending} = useSponsorGas()
  const [selectedWalletType,setSelectedWalletType] = useState<string>('EOA')
  const [stakingAmount, setStakingAmount] = useState<string>("___");
  const [hasStaked, setHasStaked] = useState<boolean>(false); // New state variable
  const [scwAddress,setSCWAddress] = useState('')
  const [stakedAmount,setStakedAmount] = useState<string>("0");

  const [loadingPaymasters, setLoadingPaymaster] = useState(true);
  const [paymasterList, setPaymasterList] = useState<Paymaster[]>([]);
  const [selectedPaymaster,setSelectedPaymaster] = useState<Paymaster>()
  const [paymasterModalIsOpen,setPaymasterModalIsOpen] = useState(false)
  
  
  const stakingContractAddress = useMemo(() => {
    if (wallet.chainId) {
      return getContractAddressByChainId(wallet.chainId);
    }
    return '';
  }, [wallet.chainId]);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
      
    const getStakingDetails = async () => {
      const contract = StakingContract__factory.connect( stakingContractAddress!, provider )
      const stakingAmount = await contract.stakingAmount();
      setStakingAmount(ethers.utils.formatEther(stakingAmount));
    };
    
		if(stakingContractAddress && stakingContractAddress != ''){
      getStakingDetails();
    }
  }, [stakingContractAddress]);

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

		const fetchStakedData = async () => {
      const contract = StakingContract__factory.connect( stakingContractAddress!, provider )
      let address=''
      try{
        if(selectedWalletType === 'EOA'){
          address = wallet.address
        }else if(selectedWalletType === 'SCW'){
          address = scwAddress
        }
        const stakedAmount = await contract.stakedAmounts(address);
        setHasStaked(stakedAmount > 0); // Check if staked amount is greater than 0
        setStakedAmount(ethers.utils.formatEther(stakedAmount))
      }catch(e){
        console.log(e)
      }
      
			
		};

    if(wallet.accounts.length > 0 && stakingContractAddress  && stakingContractAddress != ''){
      fetchStakedData();
    }
		
  }, [selectedWalletType, wallet, stakingContractAddress, scwAddress]);


  useEffect(() => {
    const fetchRegisteredPaymaster = async () => {
      try {
        setLoadingPaymaster(true);
        if(wallet.chainId != ''){
          const chainId = wallet.chainId;
          // const applicationContractAddress = getContractAddressByChainId(chainId);
          // console.log(applicationContractAddress)
          if (chainId && stakingContractAddress) {
            const paymasters = await SponsorGas.getPaymasters(chainId, stakingContractAddress);
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
    console.log(wallet.chainId)
    if(wallet.accounts.length > 0 && stakingContractAddress  && stakingContractAddress != ''){
      fetchRegisteredPaymaster();
    }else{
      setLoadingPaymaster(false)
    }
    
  }, [stakingContractAddress, wallet]);

  const handleSelectPaymaster = () =>{
    setPaymasterModalIsOpen(true);
  }
  const handleStake = async () => {
    // Implement stake functionality using ethers.js
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider,
    )
    const signer = provider.getSigner()
    if(selectedWalletType === 'SCW'){
      const simpleAccount = new SimpleAccount(signer)
      const [simpleAccountAddress,initCode] = await simpleAccount.getUserSimpleAccountAddress()
      const to =  stakingContractAddress!;
      const value = ethers.utils.parseEther(stakingAmount)
      const stakingCall = StakingContract__factory.connect( stakingContractAddress!,
                                signer
                              ).interface.encodeFunctionData("stake")
      // const data = "0x68656c6c6f" // "hello" encoded to utf-8 bytes
      const data = stakingCall
      const simpleAccountContract = SimpleAccount__factory.connect(
        simpleAccountAddress!,
        signer,
      )

      const callData = simpleAccountContract.interface.encodeFunctionData("execute", [to, value, data])
      console.log("Generated callData:", callData)
      // FILL OUT REMAINING USER OPERATION VALUES
      const gasPrice = await signer.getGasPrice()
      console.log(`Checking Nonce of: ${simpleAccountAddress}`)

      if (provider == null) throw new Error('must have entryPoint to autofill nonce')
      const c = new Contract(simpleAccountAddress!, [`function getNonce() view returns(uint256)`], provider)
      const nonceValue = await getNonceValue(c)
      console.log(nonceValue)
      const userOperation = {
          sender: simpleAccountAddress,
          nonce:hexlify(nonceValue),
          initCode:nonceValue === 0?initCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(100_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(50_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
      }
        const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
        const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
        const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        const paymasterAndData = await getPaymasterAndData(selectedPaymaster!,userOperation,wallet.chainId,entryPointContractAddress)
        console.log(`PaymasterAndData: ${paymasterAndData}`)
        
        if (paymasterAndData){
          userOperation.paymasterAndData = paymasterAndData
          const userOpHash = await simpleAccount._entryPoint.getUserOpHash(userOperation)
          const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          console.log(ethers.utils.verifyMessage(ethers.utils.arrayify(userOpHash),signature))
          console.log(await signer.getAddress())
          userOperation.signature = signature
          
          console.log("UserOperation signature:", signature)
          console.log(userOperation)
          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
          const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
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

          console.log(`UserOperation included: https://goerli.lineascan.build/tx/${txHash}`)
          } else {
          console.log('Window was closed without data.');
        }
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


  const handleWithdraw = async () => {
    // Implement stake functionality using ethers.js
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider,
    )
    const signer = provider.getSigner()
    if(selectedWalletType === 'SCW'){
      const simpleAccount = new SimpleAccount(signer)
      const [simpleAccountAddress,initCode] = await simpleAccount.getUserSimpleAccountAddress()
      const to =  stakingContractAddress!;
      const value = ethers.utils.parseEther('0')
      const stakingCall = StakingContract__factory.connect( stakingContractAddress!,
                                signer
                              ).interface.encodeFunctionData("withdraw")
      // const data = "0x68656c6c6f" // "hello" encoded to utf-8 bytes
      const data = stakingCall
      const simpleAccountContract = SimpleAccount__factory.connect(
        simpleAccountAddress!,
        signer,
      )

      const callData = simpleAccountContract.interface.encodeFunctionData("execute", [to, value, data])
      console.log("Generated callData:", callData)
      // FILL OUT REMAINING USER OPERATION VALUES
      const gasPrice = await signer.getGasPrice()
      console.log(`Checking Nonce of: ${simpleAccountAddress}`)

      if (provider == null) throw new Error('must have entryPoint to autofill nonce')
      const c = new Contract(simpleAccountAddress!, [`function getNonce() view returns(uint256)`], provider)
      const nonceValue = await getNonceValue(c)
      const userOperation = {
          sender: simpleAccountAddress,
          nonce:hexlify(nonceValue),
          initCode:nonceValue === 0?initCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(100_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(50_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
      }
      const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
      const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
      const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
      const paymasterAndData = await getPaymasterAndData(selectedPaymaster!,userOperation,wallet.chainId,entryPointContractAddress)
      console.log(`PaymasterAndData: ${paymasterAndData}`)
        
        if (paymasterAndData){
          userOperation.paymasterAndData = paymasterAndData
          const userOpHash = await simpleAccount._entryPoint.getUserOpHash(userOperation)
          const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          console.log(ethers.utils.verifyMessage(ethers.utils.arrayify(userOpHash),signature))
          console.log(await signer.getAddress())
          userOperation.signature = signature
          
          console.log("UserOperation signature:", signature)
          console.log(userOperation)
          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
          const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
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

          console.log(`UserOperation included: https://goerli.lineascan.build/tx/${txHash}`)
          } else {
          console.log('Window was closed without data.');
        }
      }
  };


  

  if (loadingPaymasters) {
    return <HorizontalLoading />;
  }

  if(isChallengePending){
    return <div className='flex flex-col items-center w-full '>
         <HorizontalLoading />
        <p>Waiting for challenge Completion</p>
    </div>
   
  }
  return (
    <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
      <div className='flex flex-col items-center w-full '>
        <div className="bg-white p-4 rounded-xl mb-4 flex flex-col items-center w-2/4">
          <Image className="h-2/6 w-auto rounded-full border-white" src={application_accepted} alt="Application Accepted" />
          <p className="text-md mb-2">Your hacker application for Superhack has been accepted!</p>
          <p className="text-lg font-semibold mb-2">Please note that you need to stake {stakingAmount || '__'} ETH to confirm your spot.</p>
          
          {wallet.accounts.length === 0 && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 flex space-x-1" role="alert">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" /> 
            <span>Connect account signer to start.</span>
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
                  <div className="ml-5 text-xs text-gray-700">
                    <span onClick={handleSelectPaymaster} className='text-blue-700 cursor-pointer'>{`Click `}</span>
                    <span>{`to choose from ${paymasterList.length} sponsors`}</span>
                  </div>
                  <div className="ml-5 text-xs text-gray-700">
                    {selectedPaymaster && <span>{` (${selectedPaymaster?.name} selected ) `}</span>}
                  </div>
                </div>
              </div>
              
            </div>
            {!hasStaked && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleStake}
              >
                Stake
              </button>
            )}
            {(hasStaked && selectedPaymaster) && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleWithdraw}
              >
                Withdraw {stakedAmount!='0' && stakedAmount} ETH
              </button>
            )}         
          </div>}
        
          <p className="text-xs mb-4">{`Supported networks:  Optimism, Base`}</p>
          <p className="text-sm mb-2">{`Any questions? Don't hesitate to contact us on Discord or email.`}</p>
        </div>

         
      </div>
      <PaymasterModal isOpen={paymasterModalIsOpen} setOpen={setPaymasterModalIsOpen} selectedPaymaster={selectedPaymaster} setSelectPaymaster={setSelectedPaymaster}  paymasterList={paymasterList}/>
    </div>

  );
}
const HorizontalLoading = () => {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="animate-bounce flex items-center space-x-2">
        <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
        <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
        <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
};


