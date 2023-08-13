/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export interface PaymasterApplicationsRegistryInterface
  extends utils.Interface {
  functions: {
    "addApplicationToPaymaster(address,address)": FunctionFragment;
    "isApplicationSupported(address,address)": FunctionFragment;
    "paymastersMap(address)": FunctionFragment;
    "registerPaymaster(address,bytes)": FunctionFragment;
    "removeApplicationFromPaymaster(address,address)": FunctionFragment;
    "unregisterPaymaster(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "addApplicationToPaymaster"
      | "isApplicationSupported"
      | "paymastersMap"
      | "registerPaymaster"
      | "removeApplicationFromPaymaster"
      | "unregisterPaymaster"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addApplicationToPaymaster",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isApplicationSupported",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "paymastersMap",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "registerPaymaster",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "removeApplicationFromPaymaster",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "unregisterPaymaster",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "addApplicationToPaymaster",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isApplicationSupported",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "paymastersMap",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerPaymaster",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "removeApplicationFromPaymaster",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "unregisterPaymaster",
    data: BytesLike
  ): Result;

  events: {
    "ApplicationAdded(address,address)": EventFragment;
    "ApplicationRemoved(address,address)": EventFragment;
    "PaymasterRegistered(address,bytes)": EventFragment;
    "PaymasterUnregistered(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ApplicationAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "ApplicationRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PaymasterRegistered"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "PaymasterUnregistered"): EventFragment;
}

export interface ApplicationAddedEventObject {
  paymasterAddress: string;
  applicationAddress: string;
}
export type ApplicationAddedEvent = TypedEvent<
  [string, string],
  ApplicationAddedEventObject
>;

export type ApplicationAddedEventFilter =
  TypedEventFilter<ApplicationAddedEvent>;

export interface ApplicationRemovedEventObject {
  paymasterAddress: string;
  applicationAddress: string;
}
export type ApplicationRemovedEvent = TypedEvent<
  [string, string],
  ApplicationRemovedEventObject
>;

export type ApplicationRemovedEventFilter =
  TypedEventFilter<ApplicationRemovedEvent>;

export interface PaymasterRegisteredEventObject {
  paymasterAddress: string;
  paymasterMetadataCID: string;
}
export type PaymasterRegisteredEvent = TypedEvent<
  [string, string],
  PaymasterRegisteredEventObject
>;

export type PaymasterRegisteredEventFilter =
  TypedEventFilter<PaymasterRegisteredEvent>;

export interface PaymasterUnregisteredEventObject {
  paymasterAddress: string;
}
export type PaymasterUnregisteredEvent = TypedEvent<
  [string],
  PaymasterUnregisteredEventObject
>;

export type PaymasterUnregisteredEventFilter =
  TypedEventFilter<PaymasterUnregisteredEvent>;

export interface PaymasterApplicationsRegistry extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: PaymasterApplicationsRegistryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addApplicationToPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isApplicationSupported(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    paymastersMap(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [boolean, string, string] & {
        isActive: boolean;
        paymasterMetadataCID: string;
        owner: string;
      }
    >;

    registerPaymaster(
      _paymasterAddress: PromiseOrValue<string>,
      _paymasterMetadataCID: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    removeApplicationFromPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    unregisterPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  addApplicationToPaymaster(
    paymasterAddress: PromiseOrValue<string>,
    applicationAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isApplicationSupported(
    paymasterAddress: PromiseOrValue<string>,
    applicationAddress: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  paymastersMap(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [boolean, string, string] & {
      isActive: boolean;
      paymasterMetadataCID: string;
      owner: string;
    }
  >;

  registerPaymaster(
    _paymasterAddress: PromiseOrValue<string>,
    _paymasterMetadataCID: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  removeApplicationFromPaymaster(
    paymasterAddress: PromiseOrValue<string>,
    applicationAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  unregisterPaymaster(
    paymasterAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addApplicationToPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    isApplicationSupported(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    paymastersMap(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [boolean, string, string] & {
        isActive: boolean;
        paymasterMetadataCID: string;
        owner: string;
      }
    >;

    registerPaymaster(
      _paymasterAddress: PromiseOrValue<string>,
      _paymasterMetadataCID: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    removeApplicationFromPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    unregisterPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ApplicationAdded(address,address)"(
      paymasterAddress?: PromiseOrValue<string> | null,
      applicationAddress?: PromiseOrValue<string> | null
    ): ApplicationAddedEventFilter;
    ApplicationAdded(
      paymasterAddress?: PromiseOrValue<string> | null,
      applicationAddress?: PromiseOrValue<string> | null
    ): ApplicationAddedEventFilter;

    "ApplicationRemoved(address,address)"(
      paymasterAddress?: PromiseOrValue<string> | null,
      applicationAddress?: PromiseOrValue<string> | null
    ): ApplicationRemovedEventFilter;
    ApplicationRemoved(
      paymasterAddress?: PromiseOrValue<string> | null,
      applicationAddress?: PromiseOrValue<string> | null
    ): ApplicationRemovedEventFilter;

    "PaymasterRegistered(address,bytes)"(
      paymasterAddress?: PromiseOrValue<string> | null,
      paymasterMetadataCID?: null
    ): PaymasterRegisteredEventFilter;
    PaymasterRegistered(
      paymasterAddress?: PromiseOrValue<string> | null,
      paymasterMetadataCID?: null
    ): PaymasterRegisteredEventFilter;

    "PaymasterUnregistered(address)"(
      paymasterAddress?: PromiseOrValue<string> | null
    ): PaymasterUnregisteredEventFilter;
    PaymasterUnregistered(
      paymasterAddress?: PromiseOrValue<string> | null
    ): PaymasterUnregisteredEventFilter;
  };

  estimateGas: {
    addApplicationToPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isApplicationSupported(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    paymastersMap(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    registerPaymaster(
      _paymasterAddress: PromiseOrValue<string>,
      _paymasterMetadataCID: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    removeApplicationFromPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    unregisterPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addApplicationToPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isApplicationSupported(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    paymastersMap(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    registerPaymaster(
      _paymasterAddress: PromiseOrValue<string>,
      _paymasterMetadataCID: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    removeApplicationFromPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      applicationAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    unregisterPaymaster(
      paymasterAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
