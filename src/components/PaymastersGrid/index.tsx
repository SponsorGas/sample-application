"use client"
import { PaymasterCard } from "../PaymasterCard";
import { Paymaster} from "sponsor-gas-sdk/dist/model";

interface PraymasterGridProps{
  paymasterList:Paymaster[],
  setSelectPaymaster(arg0:Paymaster):void
  selectedPaymaster:Paymaster|undefined
}
export default function PaymastersGrid({paymasterList,setSelectPaymaster,selectedPaymaster}:PraymasterGridProps) {
  
 

  return (
    <div className="mt-6 w-full grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 place-items-center xl:gap-x-8">
      {paymasterList.length > 0 && paymasterList.map((paymaster) => (
        <PaymasterCard key={paymaster.id}  paymaster={paymaster} setSelectPaymaster={setSelectPaymaster} isSelected={selectedPaymaster != undefined && selectedPaymaster.id === paymaster.id}/>
      ))}
    </div>
  );
}





