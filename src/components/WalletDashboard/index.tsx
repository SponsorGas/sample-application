import { useMetaMask } from '@/hooks/useMetaMask';
import React, { useEffect, useState } from 'react';
import { config, isSupportedNetwork } from '@/lib/config';
import { formatAddress, formatBalance, formatChainAsNum } from '@/utils';
import Dropdown, { DropdownOption } from '../Dropdown';
import Image from 'next/image';
import { ethers } from 'ethers';
import { SimpleAccount } from '@/utils/simpleAccount';
import { parseEther } from 'ethers/lib/utils';

interface TabProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }
  
  const Tab: React.FC<TabProps> = ({ active, onClick, children }) => (
  
  <button
    className={`flex px-4 py-2 font-medium ${
      active ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-200'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const accountTypes:DropdownOption[] = [{
	id:'EOA',name:'EOA',value:'EOA'
},{
	id:'SCW',name:'SCW',value:'SCW'
}] 

const WalletDashboard = () => {
  const [activeTab, setActiveTab] = useState('Assets');
  const { wallet, sdk, sdkConnected } = useMetaMask()

  const [nativeTokenSymbol,setNativeTokenSymbol] = useState("ETH")
	const [selectedAccountType,setSelectedAccountType] = useState(accountTypes[0])
  const [scwAddress,setSCWAddress] = useState('')
	const [scwBalance,setSCWBalance] = useState('')
  

  useEffect(() => {
		const fetchData = async () => {
			if (selectedAccountType.id === 'SCW') {
				const provider = new ethers.providers.Web3Provider(
					window.ethereum as unknown as ethers.providers.ExternalProvider
				);
				const signer = provider.getSigner();
				const simpleAccount = new SimpleAccount(signer);
				const [simpleAccountAddress] = await simpleAccount.getUserSimpleAccountAddress();
				setSCWAddress(simpleAccountAddress);
				setSCWBalance(formatBalance((await provider.getBalance(simpleAccountAddress)).toString()));
			}
	
			if (wallet && wallet.accounts.length > 0 && wallet.chainId !== '') {
				const cc = Object.entries(config).find(([chainId, chainConfig]) => chainId === wallet.chainId);
				if (cc) {
						setNativeTokenSymbol(cc[1].symbol);
				}
			}
		};
		if(wallet.accounts.length > 0){
			fetchData();
		}
	}, [selectedAccountType.id, wallet]);
	
  
	

  return (
    <article className="relative w-screen max-w-lg pb-10  flex flex-col space-y-2 overflow-y-scroll h-full">
			<div className='flex items-center px-4 py-1 border-b'>
					<div className="bg-green-600 justify-center flex  text-white items-center h-10 w-10 rounded-full ring-2 ring-white" >
					U
					</div> 
					<header className="p-4 flex font-bold text-lg">User</header> 
					<label className="px-2">Account Type:</label>
					<Dropdown options={accountTypes} setSelected={setSelectedAccountType} selected={selectedAccountType} />
			</div>
			<div className='flex items-center px-4 py-1 border-b'>
				<p className='text-sm font-semibold'>Address: {selectedAccountType.id === 'EOA'?wallet.address:scwAddress}</p>
				
			</div>
			<div className="flex flex-col items-center w-full">
					<div className="flex w-full border-b border-r">
							<Tab active={activeTab === 'Assets'} onClick={() => setActiveTab('Assets')}>
							Assets
							</Tab>
							<Tab active={activeTab === 'NFT'} onClick={() => setActiveTab('NFT')}>
							NFT
							</Tab>
					</div>
					<div className="mt-1 w-full">
							{activeTab === 'Assets' && 
									<div>
										<TokenItem tokenImgPath={nativeTokenSymbol === 'TestMATIC'?'/matic-token-icon.svg':'/eth-token-icon.png'} tokenName={nativeTokenSymbol === 'TestMATIC'?'MATIC':'ETH'} tokenAmount={selectedAccountType.id === 'SCW'?scwBalance:wallet.balance} tokenSymbol={nativeTokenSymbol} />
									</div>}
							{activeTab === 'NFT' && <p>Coming soon</p>}
					</div>
			</div>
		</article>
    
  );
};

export default WalletDashboard;

interface TokenItemProps{
	tokenImgPath:string
	tokenName:string
	tokenAmount:string
	tokenSymbol:string
}
function TokenItem({tokenImgPath,tokenName,tokenAmount,tokenSymbol}:TokenItemProps){
	return (
		<div className="border-b p-4 w-full mx-auto">
      <div className="flex space-x-4 items-center justify-center">
				<div className="rounded-full bg-gray-400 ">
					<Image height={32} width={32} src={`${tokenImgPath}`} alt={'TOKEN ICON'} />
				</div>
				<div className="flex-1 ">
				<p >{`${tokenName}`}</p>
				</div>
				<div className="flex-1 ">
						<p >{`${tokenAmount} ${tokenSymbol}`}</p>
					</div>
      </div>
    </div>
	)
}
