'use client'
import { useMetaMask } from "@/hooks/useMetaMask";
import { getBlockExplorerURLByChainId, getEntryPointContractAddressByChainId, getPimlicoChainNameByChainId } from "@/lib/config";
import { SimpleAccount } from "@/utils/simpleAccount";
import { Contract, ethers } from "ethers";
import { hexlify } from "ethers/lib/utils";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import WalletConnect from "@/components/WalletConnect";
import {  ArrowRightIcon } from "@heroicons/react/24/outline";
import PaymasterModal from "@/components/PaymasterModal";
import { formatAddress, formatBalance } from "@/utils";
import LoadingOverlay from "@/components/LoadingOverlay";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useToast } from "@/providers/ToastProvider";
import { Dialog, Transition } from "@headlessui/react";
import { Paymaster, useSponsorGas, getPaymasters } from 'sponsor-gas-sdk';
import { SimpleAccount__factory } from "@/typechain-types";



export default function Pay() {
	const { wallet } = useMetaMask()
	const [currentStep,setCurrentStep] = useState<number>(1)
  const [paymasterList, setPaymasterList] = useState<Paymaster[]>([]);
  const [selectedPaymaster,setSelectedPaymaster] = useState<Paymaster>()
	const [loadingPaymasters, setLoadingPaymasters] = useState(false);
  const [paymasterModalIsOpen,setPaymasterModalIsOpen] = useState(false)

	const fetchRegisteredPaymaster = async (chainId:string,applicationIdentifier:string) => {
		try {
			if(chainId != '' && chainId){
				console.log('fetching paymasters')
					const paymasters = await getPaymasters(chainId,applicationIdentifier);
					return paymasters
				}
		} catch (error) {
			console.error("Error fetching paymasters:", error);
		} finally {

		}
		return []
	};

	const handlePaymasterSelection = async () =>{
		if(wallet.accounts.length > 0){
			setLoadingPaymasters(true)
			const paymasters = await fetchRegisteredPaymaster(wallet.chainId,'native_asset_transfer')
			setPaymasterList(paymasters!)
			setPaymasterModalIsOpen(true)
			setLoadingPaymasters(false)
		}
	} 

	return (
  <div className="min-h-screen flex flex-col gap-3 mx-auto max-w-xl p-4 items-center">
		{loadingPaymasters && <LoadingOverlay />}
		<div className="bg-white p-6 rounded-lg shadow-md w-full">
			<ol className="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0">
					<li className={`flex items-center ${currentStep === 1 ?  'text-blue-600 dark:text-blue-500': (wallet.accounts.length > 0 ?'text-green-800 dark:text-green-800':' text-gray-500 dark:text-gray-400')} space-x-2.5`}>
							<span className={`flex items-center justify-center w-8 h-8 border ${currentStep === 1 ?  'border-blue-600  dark:border-blue-500':  (wallet.accounts.length > 0 ?'border-green-800 dark:border-green-800':'')} rounded-full shrink-0 `}>
									1
							</span>
							<span>
									<h3 className="font-medium leading-tight">Wallet</h3>
									<p className="text-sm">Connect Wallet</p>
							</span>
					</li>
					<li className={`flex items-center ${currentStep === 2 ?  'text-blue-600 dark:text-blue-500': (selectedPaymaster ?'text-green-800 dark:text-green-800':' text-gray-500 dark:text-gray-400')} space-x-2.5`}>
					<span className={`flex items-center justify-center w-8 h-8 border ${currentStep === 2 ?  'border-blue-600  dark:border-blue-500':  (selectedPaymaster ?'border-green-800 dark:border-green-800':'')} rounded-full shrink-0 `}>
									2
							</span>
							<span>
									<h3 className="font-medium leading-tight">Sponsor</h3>
									<p className="text-sm">Select Sponsor</p>
							</span>
					</li>
					<li className={`flex items-center ${currentStep === 3 ?  'text-blue-600 dark:text-blue-500': ''} space-x-2.5`}>
					<span className={`flex items-center justify-center w-8 h-8 border ${currentStep === 3 ?  'border-blue-600  dark:border-blue-500':''} rounded-full shrink-0 `}>
									3
							</span>
							<span>
									<h3 className="font-medium leading-tight">Transfer</h3>
									<p className="text-sm">Do Transfer</p>
							</span>
					</li>
			</ol>
		</div>
			{(currentStep === 1 ) && (
				<div className="bg-white p-6 rounded-lg shadow-md w-full ">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-2xl font-semibold">Welcome to Sponsor Pay</h2>
					</div>
					<p className="text-gray-700 mb-6">
						Sponsor Pay represents an innovative application tailored for effortless ETH transfers within the Linea network. Through the integration of SponsorGas capabilities, Sponsor Pay extends a gas-free experience to its users, effectively addressing any apprehensions related to gas fees during transactions.
					</p>
					<p className="text-gray-700 mb-6">
						To initiate your journey, pick the network that aligns with your Smart Contract Wallet.
						<span className="block text-blue-600  text-sm bg-blue-100 px-2 py-1 rounded-md mt-2">
							{`If you haven't deployed a wallet yet, fear not—connecting your Metamask signer, we will deploy a Simple Account (courtesy of eth-infinitism) on your first transfer.`}
						</span>
					</p>
					<div className="flex items-center gap-4 justify-center mb-4">
						<WalletConnect />
						{wallet.accounts.length > 0 && <button onClick={()=> setCurrentStep(2)} className="border rounded-md  py-2 bg-green-500 hover:bg-green-600 text-white px-4 mr-2 flex items-center" >
							<span>Next</span>
							<ArrowRightIcon width={24} height={24} />
						</button>}
					</div>
				</div>
			)}
			{(currentStep === 2 ) &&  (
        <PayXSponsorGasCard 
					setCurrentStep={setCurrentStep}
          handlePaymasterSelection={handlePaymasterSelection}
					selectedPaymaster={selectedPaymaster!}
        />
      )}
      {(currentStep === 3 )  &&  (
        <SponsorPayForm setCurrentStep={setCurrentStep} selectedPaymaster={selectedPaymaster!}  />
      ) }
			<PaymasterModal isOpen={paymasterModalIsOpen} setOpen={setPaymasterModalIsOpen} selectedPaymaster={selectedPaymaster} setSelectPaymaster={setSelectedPaymaster}  paymasterList={paymasterList}/>
	</div>
  );
}

interface SponsorPayFormProps{
	setCurrentStep:(step:number) => void
	selectedPaymaster:Paymaster
}

const SponsorPayForm = ({setCurrentStep,selectedPaymaster}:SponsorPayFormProps) =>{
	const { wallet } = useMetaMask()
  const {getPaymasterAndData} = useSponsorGas()
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
	const [isLoading,setLoading] = useState(false)
	const [transactionReceipt,setTransactionReceipt] = useState('')
  const [scwAddress,setSCWAddress] = useState('')
	const [scwBalance,setSCWBalance] = useState('')
	const [isSCWDeployed, setSCWDeployed] = useState(false)
  const { addToast } = useToast();
	useEffect(() => {
    const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
    const fetchSCWAddress = async() =>{
      const signer = provider.getSigner();
      const simpleAccount = new SimpleAccount(signer);
      const [simpleAccountAddress] = await simpleAccount.getUserSimpleAccountAddress();
			setSCWBalance(formatBalance((await provider.getBalance(simpleAccountAddress)).toString()));
      setSCWAddress(simpleAccountAddress);
			setSCWDeployed(await provider.getCode(simpleAccountAddress) !== '0x')
			console.log(await provider.getTransactionCount(simpleAccountAddress))
    }
    if(wallet.accounts.length > 0)
      fetchSCWAddress()
  }, [wallet]);

	const updateBalance = async () => {
		const provider = new ethers.providers.Web3Provider(
      window.ethereum as unknown as ethers.providers.ExternalProvider
    );
		const balance = formatBalance((await provider.getBalance(scwAddress)).toString())
		console.log('balance: ',balance)
		setSCWBalance(balance);
	}
	const handleSubmit =  async (e:FormEvent) => {
    e.preventDefault();
		try{
			
			 const provider = new ethers.providers.Web3Provider(
				 window.ethereum as unknown as ethers.providers.ExternalProvider,
			 )
			 const signer = provider.getSigner()
				const simpleAccount = new SimpleAccount(signer)
				const [simpleAccountAddress,initCode] = await simpleAccount.getUserSimpleAccountAddress()
				const to =  recipient!;
				const value = ethers.utils.parseEther(amount)
				const data = "0x"//"0x68656c6c6f" // "hello" encoded to utf-8 bytes
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
						callGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
						verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
						preVerificationGas: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
						maxFeePerGas: ethers.utils.hexlify(gasPrice),
						maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
						paymasterAndData: "0x",
						signature: "0x"
				}
					const chain = getPimlicoChainNameByChainId(wallet.chainId) // find the list of chain names on the Pimlico verifying paymaster reference page
					const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY
					const entryPointContractAddress = getEntryPointContractAddressByChainId(wallet.chainId)!// '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
					const paymasterAndData = await getPaymasterAndData(userOperation,wallet.chainId,selectedPaymaster!,entryPointContractAddress)
					console.log(`PaymasterAndData: ${paymasterAndData}`)
					
					if (paymasterAndData){
						setLoading(true)
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
						const blockExplorer = getBlockExplorerURLByChainId(wallet.chainId)
						console.log(wallet.chainId, blockExplorer)
						console.log(`UserOperation included: ${blockExplorer}/tx/${txHash}`)
						setTransactionReceipt(`${blockExplorer}/tx/${txHash}`)
						addToast("Successfully Submitted User Operation",'success')
						} else {
						console.log('Window was closed without data.');
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


	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white p-6 rounded-lg shadow-md w-full"
		>
			{isLoading && <LoadingOverlay/>}
			<div className="flex items-center mb-4">
				<h2 className="text-2xl font-semibold">Sponsor Pay: Gasless ETH Transfer</h2>
			</div>
			{/* <h3 className="text-xl font-semibold mb-4">Details</h3> */}
			<div className="mb-4">
				<p className="text-gray-600 mb-1">Paymaster: <span className="text-blue-600 font-semibold">{selectedPaymaster && selectedPaymaster.name}</span></p>
			</div>
			<div className="mb-4">
				<p className="text-gray-600 mb-1">Smart Contract Wallet: 
					<span className="text-blue-600 ml-2 font-semibold">${formatAddress(scwAddress).toLowerCase()}</span>
					<span className={`inline-flex items-center ml-2 rounded-md px-2 py-1 text-xs font-medium 	${isSCWDeployed ? ' bg-green-50 text-green-700 ring-green-600/10':' bg-red-50 text-red-700 ring-red-600/10'}  ring-1 ring-inset `}>
						{isSCWDeployed ? 'Already Deployed':'Not Deployed'}
					</span>
				</p>
			</div>
			<div className="mb-4">
				<p className="text-gray-600 mb-1">Your Wallet Balance: <span className="text-blue-600 font-semibold">{scwBalance} ETH</span></p>
			</div>
			<div className="mb-4">
				<label htmlFor="amount" className="block text-gray-600 mb-2">
					Amount:
				</label>
				<input
					type="number"
					id="amount"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
				/>
			</div>
			<div className="mb-4">
				<label htmlFor="recipient" className="block text-gray-600 mb-2">
					Recipient:
				</label>
				<input
					type="text"
					id="recipient"
					value={recipient}
					onChange={(e) => setRecipient(e.target.value)}
					className="w-full border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-300"
				/>
			</div>
			<div className="flex items-center gap-4 justify-center mb-4">
				<button onClick={()=> setCurrentStep(2)} className="border rounded-md  py-2 bg-green-500 hover:bg-green-600 text-white px-4 mr-2 flex items-center" >
					<ArrowLeftIcon width={24} height={24} />
					<span>Back</span>
				</button>
				<button
					disabled={amount === '' || recipient === ''}
					type="submit"
					className={`bg-blue-500 ${(amount === '' || recipient === '') ?'': 'hover:bg-blue-600'}  text-white py-2 px-4 rounded-md`}
				>
					Transfer
				</button>
				{transactionReceipt != '' && <TransactionReceiptModal isOpen={transactionReceipt != '' ?true:false} 
				setOpen={async (arg) => {
					setAmount('')
					setRecipient('')
					await updateBalance()
					setTransactionReceipt('')

				}} 
				sender={scwAddress} recipient={recipient} amount={amount} receiptLink={transactionReceipt} />}
			</div>
			
		</form>
	)
}

interface PayXSponsorGasCardProps{
	handlePaymasterSelection:() => void
	setCurrentStep:(step:number) => void
	selectedPaymaster:Paymaster
}

const PayXSponsorGasCard = ({handlePaymasterSelection,setCurrentStep,selectedPaymaster}:PayXSponsorGasCardProps) => {

	return (
			<div className="bg-white p-6 rounded-lg shadow-md">
				<div className="flex items-center mb-4">
					<h2 className="text-2xl font-semibold">Sponsor Pay: Select & Verify Sponsor</h2>
				</div>
				<p className="text-gray-700 mb-4">
					Sponsor Pay is a cutting-edge application designed to facilitate seamless ETH transfers on the Linea network.
					Leveraging the power of SponsorGas integration, Sponsor Pay delivers a gasless experience to its users,
					eliminating concerns about gas fees during transactions.
				</p>
				<p className="text-gray-700 mb-4">
					With SponsorGas integration, users are empowered to choose the most suitable gas fee sponsor that aligns
					with their individual preferences and needs. Each gas fee sponsor defines specific conditions for sponsorship,
					and when users meet these requirements, they can leverage Sponsor Pay without any worries about gas fees on the Linea Network.
				</p>
				<p className="text-gray-700 mb-6">
					Explore the future of gasless transactions with Sponsor Pay. Choose your ideal gas fee sponsor and enjoy a
					hassle-free ETH transfer experience today!
				</p>
				<div className="flex items-center gap-4 justify-center mb-4">
					<button onClick={()=> setCurrentStep(1)} className="border rounded-md  py-2 bg-green-500 hover:bg-green-600 text-white px-4 mr-2 flex items-center" >
						<ArrowLeftIcon width={24} height={24} />
						<span>Back</span>
					</button>
					<button onClick={handlePaymasterSelection} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
						Select Gas Fee Sponsor
					</button>
					{selectedPaymaster && <button onClick={()=> setCurrentStep(3)} className="border rounded-md  py-2 bg-green-500 hover:bg-green-600 text-white px-4 mr-2 flex items-center" >
						<span>Next</span>
						<ArrowRightIcon width={24} height={24} />
					</button>}
				</div>
			</div>
  );
};

interface TransactionReceiptModalProps{
	isOpen:boolean
	setOpen(arg0:boolean):void
	sender:string
	recipient:string
	amount:string
	receiptLink:string
}

function TransactionReceiptModal({isOpen,setOpen,sender,recipient,amount,receiptLink}:TransactionReceiptModalProps) {
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
										<p className="text-gray-600 mb-1">Sender: <span className=" font-semibold">{formatAddress(sender).toLowerCase()}</span></p>
										<p className="text-gray-600 mb-1">Recipient: 
											<span className="ml-2 font-semibold">{formatAddress(recipient).toLowerCase()}</span>
										</p>
										<p className="text-gray-600 mb-1">Amount: <span className=" font-semibold">{amount} ETH</span></p>
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


