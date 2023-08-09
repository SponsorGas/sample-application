'use client'
import Image from 'next/image'
import {  ethers } from "ethers";
import application_accepted from './application_accepted.png'
import React, { useEffect, useRef, useState } from "react";
import { useMetaMask } from '@/hooks/useMetaMask';
import { SimpleAccount } from '@/utils/simple_account';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

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

  const { wallet} = useMetaMask()
  const [selectedWalletType,setSelectedWalletType] = useState<string>('EOA')
  const [stakingAmount, setStakingAmount] = useState<string>("0");
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [hasStaked, setHasStaked] = useState<boolean>(false); // New state variable
  const [scwAddress,setSCWAddress] = useState('')
  const [stakedAmount,setStakedAmount] = useState<string>("0");

  useEffect(() => {
    
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


			
		};
    if(wallet.accounts.length > 0){
      fetchData();
    }
		
  }, [selectedWalletType,wallet,scwAddress]);

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
                    <span  className='text-blue-700 cursor-pointer'>{`Click `}</span>
                    <span>to choose from 2 sponsors</span>
                  </div>
                </div>
              </div>
              
            </div>
            {!hasStaked && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
                disabled={remainingTime > 0}
              >
                Stake
              </button>
            )}
            {hasStaked && (
              <button
                className="bg-blue-500 text-white  py-2 px-4 rounded-md mr-2"
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
    </div>

  );
}

