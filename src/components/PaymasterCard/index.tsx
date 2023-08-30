import { useState } from "react";
import { formatAddress } from "@/utils";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { StarIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Paymaster } from "sponsor-gas-sdk/dist/model";

interface PaymasterCardProps {
  paymaster: Paymaster;
  setSelectPaymaster(arg0: Paymaster): void;
  isSelected: boolean;
}

export function PaymasterCard({ paymaster, setSelectPaymaster, isSelected }: PaymasterCardProps) {
	const [isFlipped, setIsFlipped] = useState(false);
  
	return (
	  <div
		className={`w-full m-3 relative max-w-sm hover:cursor-pointer hover:scale-105 transition-transform transform ${isFlipped ? "rotate-y-180" : ""}`}
		onClick={() => setSelectPaymaster(paymaster)}
		onMouseEnter={() => setIsFlipped(true)}
		onMouseLeave={() => setIsFlipped(false)}
	  >
		<div className="absolute top-0 left-0 px-4 pt-4">
		  {isSelected && (
			<button className="inline-block text-gray-500 dark:text-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
			  <CheckBadgeIcon className="-ml-0.5 h-6 w-6 text-green-500" />
			</button>
		  )}
		</div>
		<div className="absolute top-0 right-0 px-4 pt-4">
		  <button className="inline-block text-gray-500 dark:text-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5" type="button">
			<StarIcon className="-ml-0.5 h-5 w-5" />
		  </button>
		</div>
		<div className={`aspect-h-1 aspect-w-1 w-full border overflow-hidden rounded-2xl bg-white lg:aspect-none group-hover:opacity-75 lg:h-80 ${isFlipped ? "rotate-y-180" : ""}`}>
		  <Image src={paymaster.image ?? '/sponsor_gas_defaultcover.png'} alt={`Sponsor Image`} width={500} height={400} className="h-full w-full object-cover object-center lg:h-full lg:w-full" unoptimized/>
		</div>
  
		<div className={`absolute inset-x-0 bottom-0 flex flex-col mx-2 -my-6 items-center rounded-2xl text-white bg-gray-800 ${isFlipped ? "rotate-y-180" : ""}`}>
		  {isFlipped ? (
			<div className="p-4">
			  <p className="text-sm text-gray-200 dark:text-gray-400">{paymaster.description}</p>
			</div>
		  ) : (
			<div className="p-4 w-full h-full">
			  <h5 className="mb-1 text-md font-medium overflow-hidden h-10">{paymaster.name}</h5>
			  <span className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(paymaster.paymasterAddress)}</span>
			</div>
		  )}
		</div>
	  </div>
	);
  }
  
