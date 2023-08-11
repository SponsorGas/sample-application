import { formatAddress } from "@/utils"
import { Paymaster } from "@/utils/sponsor_gas"
import { CheckBadgeIcon } from "@heroicons/react/20/solid"
import { StarIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"

interface PaymasterCardProps{
	paymaster:Paymaster
	setSelectPaymaster(arg0:Paymaster):void
	isSelected:boolean
}

export function PaymasterCard({paymaster,setSelectPaymaster,isSelected}:PaymasterCardProps){
    const router = useRouter()
	return(
		<div className="w-full relative max-w-sm hover:cursor-pointer hover:scale-105" onClick={() => setSelectPaymaster(paymaster)}>
			<div className="absolute top-0 left-0 px-4 pt-4">
				{isSelected && <button  className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
							<CheckBadgeIcon className="-ml-0.5 h-6 w-6 text-green-500" />
						</button>}
			</div>
			<div className="absolute top-0 right-0 px-4 pt-4">
				<button  className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
						<StarIcon className="-ml-0.5 h-5 w-5"/>
				</button>
			</div>
			<div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-2xl bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
				{/* <Image
					src={'/Ethglobal-sponsorPay.png'}
					alt={`product.imageAlt`}
					width={500}
					height={400}
					className="h-full w-full object-cover object-center lg:h-full lg:w-full"
				/> */}
			</div>
				
			<div className="absolute inset-x-0 bottom-0 flex flex-col mx-2 -my-6  items-center rounded-2xl text-white bg-gray-800 ">
					<h5 className="mb-1 text-xl font-medium">{paymaster.name}</h5>
					<span className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(paymaster.paymasterAddress)}</span>
					{/* <div className="flex mt-4 space-x-3 md:mt-6">
							<a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add friend</a>
							<a href="#" className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-700">Message</a>
					</div> */}
			</div>
		</div>
		)
}