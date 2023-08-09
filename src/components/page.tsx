'use client'
import Image from 'next/image'
import { BigNumber, ethers } from "ethers";
import ethglobal_logo from './ethglobal.png'
import application_accepted from './application_accepted.png'
import React, { useEffect, useRef, useState } from "react";
import { config, isSupportedNetwork } from '@/lib/config';
import { useMetaMask } from '@/hooks/useMetaMask';
import SwitchNetwork from '@/components/SwitchNetwork/SwitchNetwork';
import { formatAddress, formatChainAsNum } from '@/utils';
import { SimpleAccount } from '@/utils/simple_account';
import { SimpleAccount__factory } from '@account-abstraction/contracts';
import { StakingContract__factory } from '@/staking-typechain';
import { defaultAbiCoder, hexlify, keccak256 } from 'ethers/lib/utils';
import Drawer from '@/components/AccountDrawer';
import Dropdown, { DropdownOption } from '@/components//Dropdown';
import TabsLayout from '@/components/TabLayout';
import WalletConnect from '@/components/WalletConnect';
import WalletDashboard from '@/components/WalletDashboard';
import PaymasterModal from '@/components/PaymasterModal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);


function clns(...classes: string[]) {
  console.log(classes)
  return classes.filter(Boolean).join(' ');
}
interface UserOperation {
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

  const { wallet, isConnecting, connectMetaMask, sdk, sdkConnected } = useMetaMask()
  const networkId = process.env.NEXT_PUBLIC_NETWORK_ID
  const walletChainSupported = isSupportedNetwork(wallet.chainId)
  // now chainInfo is strongly typed or fallback to linea if not a valid chain
  const chainInfo = isSupportedNetwork(networkId) ? config[networkId] : config['0xe704']
  const [selectedWalletType,setSelectedWalletType] = useState<string>('EOA')
  
  const chains:DropdownOption[] = Object.entries(config).map(([_chainId,_chainConfig]) => {return {'id':_chainId,'name':_chainConfig.name,"value":_chainId}})
  const [selected, setSelected] = useState(chains[1])

  const popupWindowRef = useRef(null);
  const [userOperation,setUserOperation] = useState<Partial<UserOperation>>({})

  const [stakingAmount, setStakingAmount] = useState<string>("0");
  const [withdrawalTime, setWithdrawalTime] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [hasStaked, setHasStaked] = useState<boolean>(false); // New state variable
  const [isOpen, setIsOpen] = React.useState(false);
  const [scwAddress,setSCWAddress] = useState('')
  const [stakedAmount,setStakedAmount] = useState<string>("0");

  const [paymasterModalIsOpen,setPaymasterModalIsOpen] = useState(false)
  useEffect(() => {
    const getStakingDetails = async () => {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum as unknown as ethers.providers.ExternalProvider
      );
      const stakingContractAddress = '0xEA68b3eFbBf63BB837F36A90AA97Df27bBF9B864'
      const contract = StakingContract__factory.connect( stakingContractAddress, provider )
      const stakingAmount = await contract.stakingAmount();
      setStakingAmount(ethers.utils.formatEther(stakingAmount));
    };

    let isMounted = true; // Flag to track component mount status
	
		const fetchData = async () => {
			
				const provider = new ethers.providers.Web3Provider(
					window.ethereum as unknown as ethers.providers.ExternalProvider
				);
				const signer = provider.getSigner();
				const simpleAccount = new SimpleAccount(signer);
				const [simpleAccountAddress] = await simpleAccount.getUserSimpleAccountAddress();
				
				if (isMounted) {
					setSCWAddress(simpleAccountAddress);
				}

      const contract = StakingContract__factory.connect( "0xEA68b3eFbBf63BB837F36A90AA97Df27bBF9B864", provider )

      const stakedAmount = await contract.stakedAmounts(selectedWalletType === 'EOA'? wallet.address:scwAddress);

      setHasStaked(stakedAmount > 0); // Check if staked amount is greater than 0
      setStakedAmount(ethers.utils.formatEther(stakedAmount))
			
		};
    if(wallet.accounts.length > 0){
      fetchData();
    }
		
    getStakingDetails();
  }, [selectedWalletType,wallet,scwAddress]);

  const handleSelectPaymaster = () =>{
    setPaymasterModalIsOpen(true);
  }
  const handleStake = async () => {
    // Implement stake functionality using ethers.js
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider,
    )
    // In ethers.js, providers allow you to query data from the blockchain. 
    // They represent the way you connect to the blockchain. 
    // With them you can only call view methods on contracts and get data from those contract.
    // Signers are authenticated providers connected to the current address in MetaMask.
    const signer = provider.getSigner()
    if(selectedWalletType === 'SCW'){
      const simpleAccount = new SimpleAccount(signer)
      const [simpleAccountAddress,initCode] = await simpleAccount.getUserSimpleAccountAddress()
      const to = "0xEA68b3eFbBf63BB837F36A90AA97Df27bBF9B864" // staking contract
      const value = ethers.utils.parseEther('0.03')
      const stakingCall = StakingContract__factory.connect( "0xEA68b3eFbBf63BB837F36A90AA97Df27bBF9B864",
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
      
      const userOperation = {
          sender: simpleAccountAddress,
          nonce:'0x3',
          initCode:'0x',
          callData,
          callGasLimit: ethers.utils.hexlify(100_000), // hardcode it for now at a high value
          verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
          preVerificationGas: ethers.utils.hexlify(50_000), // hardcode it for now at a high value
          maxFeePerGas: ethers.utils.hexlify(gasPrice),
          maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
          paymasterAndData: "0x",
          signature: "0x"
      }
          const chain = "linea-testnet" // find the list of chain names on the Pimlico verifying paymaster reference page
          const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
          const entryPointContractAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
          setUserOperation((prevUserOperation)=> userOperation )
          console.log('Setting UserOperations: ',userOperation)

         handlePaymasterThing(userOperation,'0xe704',entryPointContractAddress)
          
          // const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
          
          // const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
          // const sponsorUserOperationResult = await pimlicoProvider.send("pm_sponsorUserOperation", [
          //   userOperation,
          //   {
          //     entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
          //   },
          // ])
          
          // const paymasterAndData = sponsorUserOperationResult.paymasterAndData
          
          // userOperation.paymasterAndData = paymasterAndData
          
          // console.log("Pimlico paymasterAndData:", paymasterAndData)

          // // // SIGN THE USER OPERATION
          // const userOpHash = await simpleAccount._entryPoint.getUserOpHash(userOperation)
          // const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          // console.log(ethers.utils.verifyMessage(ethers.utils.arrayify(userOpHash),signature))
          // console.log(await signer.getAddress())
          
          
          // userOperation.signature = signature
          
          // console.log("UserOperation signature:", signature)
          // // SUBMIT THE USER OPERATION TO BE BUNDLED
          // const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
          //   userOperation,
          //   '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // ENTRY_POINT_ADDRESS
          // ])

          // console.log("UserOperation hash:", userOperationHash)

          // // let's also wait for the userOperation to be included, by continually querying for the receipts
          // console.log("Querying for receipts...")
          // let receipt = null
          // while (receipt === null) {
          //   await new Promise((resolve) => setTimeout(resolve, 1000))
          //   receipt = await pimlicoProvider.send("eth_getUserOperationReceipt", [
          //   userOperationHash,
          // ]);
          //   console.log(receipt === null ? "Still waiting..." : receipt)
          // }

          // const txHash = receipt.receipt.transactionHash

          // console.log(`UserOperation included: https://goerli.lineascan.build/tx/${txHash}`)
      }
  };

  const handlePaymasterThing = (_userOperation:Partial<UserOperation>,_chain: string,_entryPointContractAddress: string) =>{
    const enc = defaultAbiCoder.encode(['address','bytes','bytes','uint','address'],[_userOperation.sender,_userOperation.initCode,_userOperation.callData,_chain,_entryPointContractAddress])
    const id = keccak256(enc)
    console.log(id)
    const redirect_url = `http://localhost:3001`
    const paymasterOffchainServiceURL = `http://localhost:8001/paymaster?scope=${id}&redirect_url=${redirect_url}`

    // Open the popup window
    const popupWindow =  window.open(paymasterOffchainServiceURL);
    popupWindowRef.current = popupWindow
  }


  const handlePopupMessage = async (event) => {
    
    if(event.data.target === 'sponsor-pay'){
      // Update the state with the data received from the popup window
      console.log(event.data);
      // Call the API to submit the challenge response
      try {
        const response = await fetch("http://localhost:8001/paymaster/access_token", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code:event.data.data.code }),
          credentials: 'include', // Include cookies in the request
        });

        console.log(response)
        // Check if the API call was successful
        if (response.ok) {
          console.log('Got Access Code.');
          console.log(userOperation)
          const paymasterAndDataResponse = await fetch("http://localhost:8001/paymaster/paymasterAndData",{
            method:'POST',
            headers:{
              'Content-Type':'application/json',
            },
            body:JSON.stringify({userOperation,
                  'entryPoint': '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
                  'chainId':'0xe704'
                }),
            credentials: 'include', 
          });

          // Check if the API call was successful
          if (paymasterAndDataResponse.ok) {
            const responseData= await paymasterAndDataResponse.json();
            console.log(responseData)

            const uOp:UserOperation = responseData.userOperation
            const nonce = typeof uOp.nonce === 'object'? BigNumber.from(uOp.nonce)._hex : uOp.nonce
            uOp.nonce = nonce
            const provider = new ethers.providers.Web3Provider(
              window.ethereum as unknown as ethers.providers.ExternalProvider,
            )
            // In ethers.js, providers allow you to query data from the blockchain. 
            // They represent the way you connect to the blockchain. 
            // With them you can only call view methods on contracts and get data from those contract.
            // Signers are authenticated providers connected to the current address in MetaMask.
            const signer = provider.getSigner()
            const simpleAccount = new SimpleAccount(signer)
            console.log(`User Ops Hash: ${await simpleAccount._entryPoint.getUserOpHash(uOp)}`)
          //  SIGN THE USER OPERATION
          const userOpHash = await simpleAccount._entryPoint.getUserOpHash(uOp)
          const signature = await signer.signMessage( ethers.utils.arrayify(userOpHash))
          console.log(ethers.utils.verifyMessage(ethers.utils.arrayify(userOpHash),signature))
          
          uOp.signature = signature
          
          console.log("UserOperation signature:", signature)
          console.log(`UserOperation :  ${JSON.stringify(uOp)}`)
          
          const chain = "linea-testnet" // find the list of chain names on the Pimlico verifying paymaster reference page
          const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
          const entryPointContractAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

          const pimlicoEndpoint = `https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`
          
          const pimlicoProvider = new ethers.providers.StaticJsonRpcProvider(pimlicoEndpoint)
          
          // SUBMIT THE USER OPERATION TO BE BUNDLED
          const userOperationHash = await pimlicoProvider.send("eth_sendUserOperation", [
            uOp,
            '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' // ENTRY_POINT_ADDRESS
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
            console.log('Got PaymasterAndData.');
          }
        } else {
          // Handle the case when the API call fails
          console.error('Failed Getting Access Code');
          // You can show an error message to the user or handle the error in any other way
        }


      } catch (error) {
        // Handle any other errors that may occur during the API call
        console.error('An error occurred:', error);
      }
    }
  };

  useEffect(() => {
    // Add an event listener for the "message" event to listen for data from the popup
    window.addEventListener('message', handlePopupMessage);

    return () => {
      // Clean up the event listener when the component unmounts
      window.removeEventListener('message', handlePopupMessage);
    };
  }, []);

  const handleWithdraw = async () => {
    // Implement withdraw functionality using ethers.js
  };

  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 60 * 60));
    const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = time % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };
  return (
    <div className="bg-white min-h-screen mx-auto p-4 bg-gradient-to-r from-yellow-50 from-20% via-purple-50 via-50% to-green-50">
      <div className='flex flex-col items-center w-full '>
        <div className="bg-white p-4 rounded-xl mb-4 flex flex-col items-center w-2/4">
          <Image className="h-2/6 w-auto rounded-full border-white" src={application_accepted} alt="Application Accepted" />
          <p className="text-md mb-2">Your hacker application for Superhack has been accepted!</p>
          <p className="text-lg font-semibold mb-2">Please note that you need to stake {stakingAmount} ETH to confirm your spot.</p>
          
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
                    <span>to choose from 2 sponsors</span>
                  </div>
                </div>
              </div>
              
            </div>
            {!hasStaked && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleStake}
                disabled={remainingTime > 0}
              >
                Stake
              </button>
            )}
            {hasStaked && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                onClick={handleWithdraw}
                disabled={remainingTime <= 0}
              >
                Withdraw {stakedAmount!='0' && stakedAmount} ETH
              </button>
            )}         
          </div>}
        
          <p className="text-xs mb-4">{`Supported networks: Ethereum, Optimism, Polygon, Arbitrum, Base`}</p>
          <p className="text-sm mb-2">{`Any questions? Don't hesitate to contact us on Discord or email.`}</p>
        </div>

         
      </div>
      <PaymasterModal isOpen={paymasterModalIsOpen} setOpen={setPaymasterModalIsOpen}/>
    </div>

  );
}

