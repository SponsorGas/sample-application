import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, ReactElement } from "react";
import Image from "next/image";

export interface ApplicationDropdownOption{
    id:string
    name:string
    value:ReactElement
    url?:string
}


interface ApplicationDropdownProps{
    options:ApplicationDropdownOption[]
    setSelected(option:ApplicationDropdownOption|undefined):void
    selected:ApplicationDropdownOption | undefined
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
export default function ApplicationDropdown({options,setSelected,selected}:ApplicationDropdownProps) {
    return (
      <Listbox value={selected} onChange={setSelected} >
        {({ open }) => (
          <>
            {/* <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Listbox.Label> */}
            <div className="relative flex-auto  text-black flex rounded-md  ">
              <Listbox.Button className="relative w-max cursor-default rounded-md  py-1.5 pl-3 pr-10 text-left shadow-sm focus:outline-none  sm:text-sm sm:leading-6">
                <span className="flex items-center ">
                  {/* <img src={selected.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" /> */}
                  {selected? selected.value : "Select an application"}
                  {/* <span className=" block truncate text-white">{`${(selected)?selected.name:'Select an application'}`}</span> */}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
  
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-max overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options && options.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      className={({ active }) =>
                        classNames(
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                          'relative cursor-default select-none py-2 pl-3 pr-9'
                        )
                      }
                      value={option}
                    >
                      {({ selected:isSelected, active }) => (
                        <>
                          <div className="flex items-center">
                            {/* <img src={person.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" /> */}
                            <span
                              className={classNames(isSelected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                            >
                              {option.name}
                            </span>
                          </div>
  
                          {isSelected ? (
                            <span
                              className={classNames(
                                active ? 'text-white' : 'text-indigo-600',
                                'absolute inset-y-0 right-0 flex items-center pr-4'
                              )}
                            >
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    )
  }

  interface ApplicationLogoProps{
    image?:string,
    name?:string,
    sponsor?:string
  }
  export function ApplicationLogo ({image,name,sponsor}:ApplicationLogoProps){
    return (
        <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              {image && <Image width={40} height={40} className="rounded-full border-yellow-200" src={`${image}`} alt="Logo" />}
              {name && <span className='font-semibold text-xl'>{`${name}`}</span>}
              { sponsor && <span className='font-bold text-3xl px-2'>X</span>}
              { sponsor &&<span className='font-semibold text-xl bg-gradient-to-r from-violet-600  to-blue-700 bg-clip-text text-transparent'>{`${sponsor}`}</span>}
            </a>
          </div>
    )
  }