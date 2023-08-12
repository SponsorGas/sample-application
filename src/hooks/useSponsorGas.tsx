import { UserOperation } from '@/app/page';
import { Paymaster } from '@/utils/sponsor_gas';
import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';
import React, { useState } from 'react';

const useSponsorGas = () => {
  const [challengeWindow, setChallengeWindow] = useState<Window | null>(null);
  const [isChallengePending, setIsChallengePending] = useState<boolean>(false);

  const getPaymasterAndData = async (paymaster: Paymaster, _userOperation:Partial<UserOperation>, _chain: string, _entryPointContractAddress: string) => {
    setIsChallengePending(true);

    const enc = defaultAbiCoder.encode(['address','bytes','bytes','uint','address'],[_userOperation.sender,_userOperation.initCode,_userOperation.callData,_chain,_entryPointContractAddress])
    const scopeId = keccak256(enc)
    const redirect_url = `http://localhost:3001`
    const paymasterId = paymaster.id
    // Step 1: Call the API
    // const response = await fetch(`http://localhost:8001/api/paymasters/0x1234?scope=1&redirect_url=http://localhost:3001`); // Use the provided URL parameter
    // const data = await response.json();

    // Step 2: Open the redirect URL in a new window
    // const newWindow = window.open(data.redirectUrl, '_blank');
    console.log(paymaster)
		const newChallengeWindow = window.open(`${paymaster.paymasterOffchainService}?paymasterId=${paymasterId}&scope=${scopeId}&redirect_url=${redirect_url}`,'_blank')
    setChallengeWindow(newChallengeWindow);

    // Create a promise that resolves when data is received
    const paymasterAndDataPromise = new Promise<string | null>((resolve) => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin === 'http://localhost:8001' && event.data.target === 'sponsor-gas') {
          const newData = event.data;
          try {
            const response = await fetch("http://localhost:8001/api/paymasters/0x1234/access_token", {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({ auth_code:newData.data.AuthCode }),
								credentials: 'include', // Include cookies in the request
            	});
    
            // Check if the API call was successful
            if (response.ok) {
              console.log('Got Access Code.');
              console.log(_userOperation)
              const paymasterAndDataResponse = await fetch("http://localhost:8001/api/paymasters/0x1234/paymasterAndData",{
											method:'POST',
											headers:{
												'Content-Type':'application/json',
											},
											body:JSON.stringify({_userOperation,
														'entryPoint': _entryPointContractAddress,
														'chainId': _chain
													}),
											credentials: 'include', 
										});
    
              // Check if the API call was successful
              if (paymasterAndDataResponse.ok) {
                const responseData= await paymasterAndDataResponse.json();
								setIsChallengePending(false);
								console.log(responseData.userOperation)
								resolve(responseData.userOperation.paymasterAndData);
							}
            } else {
              // Handle the case when the API call fails
              console.error('Failed Getting Access Code');
              // You can show an error message to the user or handle the error in any other way
            }
    
    
          } catch (error) {
            // Handle any other errors that may occur during the API call
            console.error('An error occurred:', error);
						resolve(null)
          }finally{
						setIsChallengePending(false);
					}
         
        }
      };

      window.addEventListener('message', handleMessage);

      const checkWindowClosed = setInterval(() => {
        if (newChallengeWindow && newChallengeWindow.closed) {
          clearInterval(checkWindowClosed);
          window.removeEventListener('message', handleMessage);
          resolve(null); // Resolve with null if window was closed without data
        }
      }, 10000);
    });

    // setDataPromise(newDataPromise);
		return paymasterAndDataPromise
  };

  return { getPaymasterAndData, challengeWindow, isChallengePending };
};


export default useSponsorGas;
