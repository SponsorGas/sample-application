import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"

interface TransactionReceiptModalProps{
	isOpen:boolean
	setOpen(arg0:boolean):void
	receiptLink:string
}
export default function TransactionReceiptModal({isOpen,setOpen,receiptLink}:TransactionReceiptModalProps) {
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