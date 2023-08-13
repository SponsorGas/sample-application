import { Web3Storage } from "web3.storage";

export interface Chain {
	id: number;
	chainId: string;
	name: string;
	rpcUrl?: string;
	paymasters?: Paymaster[];
	applications?: Application[];
}

export interface Paymaster {
	id: string;
	name: string;
	description: string;
	image?: string;
	type: string;
	published: boolean;
	applications?: Application[];
	createdAt: Date;
	PaymasterCriteria?: PaymasterCriteria[];
	owner?: User | null;
	ownerId: string | null;
	chain?: Chain;
	chainId: string;
	paymasterAddress:string;
	paymasterOffchainService:string;
}

export interface PaymasterCriteria {
	id: string;
	isMandatory: boolean;
	type: string;
	video: string | null;
	questionBook: any | null; // You can replace 'any' with a more specific type if needed
	nftCollection: string | null;
	identityProvider: string | null;
	paymaster?: Paymaster;
	paymasterId: string;
	createdAt: Date;
}

export interface Application {
	id: string;
	value: string;
	name: string;
	paymasters?: Paymaster[];
	registerer?: User | null;
	registererId: string | null;
	chain?: Chain;
	chainId: string;
}

interface Account {
	id: string;
	userId: string;
	type: string;
	provider: string;
	providerAccountId: string;
	refresh_token: string | null;
	access_token: string | null;
	expires_at: number | null;
	token_type: string | null;
	scope: string | null;
	id_token: string | null;
	session_state: string | null;
	oauth_token_secret: string | null;
	oauth_token: string | null;
	user: User;
}

interface Session {
	id: string;
	sessionToken: string;
	userId: string;
	expires: Date;
	user: User;
}

interface User {
	id: string;
	name: string | null;
	email: string | null;
	emailVerified?: Date | null;
	image?: string | null;
	paymasters?: Paymaster[];
	accounts?: Account[];
	sessions?: Session[];
	applications?: Application[];
}



  
	export class SponsorGas {

		static getPaymasters = async (chainId:string,applicationContractAddress:string) => {
			const response = await fetch(`http://localhost:8001/api/chains/${chainId}/applications/${applicationContractAddress}/paymasters`)
			if(response.ok){
				const responseJson  =  await response.json()
				let paymasters : Paymaster[] = responseJson.paymasters
				const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_API_KEY! })
				paymasters = await Promise.all(paymasters.map(async p => {
					if(p.image){
						try{
							const imageFileResponse = await client.get(p.image as string)
							if(imageFileResponse){
								const files = await imageFileResponse.files();
								const imageFile = await files[0];
								const imageURL = `https://${imageFile.cid}.ipfs.w3s.link`
								p.image = imageURL
							}
						}
						catch(e){
							console.log('catught error')
							console.error(e)
							p.image = undefined
						}
						
					}
					return p
				}))
				return paymasters
			}
			return []
		}
}
 


  
  