/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../common";
import type {
  StakingContract,
  StakingContractInterface,
} from "../StakingContract";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Stake",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "staker",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "setStakingAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stake",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "stakedAmounts",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stakingAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawalTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052666a94d74f43000060015534801561001b57600080fd5b50600080546001600160a01b0319163317905561003b4262093a80610043565b60025561006a565b8082018082111561006457634e487b7160e01b600052601160045260246000fd5b92915050565b610511806100796000396000f3fe6080604052600436106100705760003560e01c80633ccfd60b1161004e5780633ccfd60b146100d55780633f230872146100ea578063739a3e021461010a578063f851a4401461012057600080fd5b806310c1c10314610075578063389eb9f9146100b55780633a4b66f1146100cb575b600080fd5b34801561008157600080fd5b506100a2610090366004610445565b60036020526000908152604090205481565b6040519081526020015b60405180910390f35b3480156100c157600080fd5b506100a260025481565b6100d3610172565b005b3480156100e157600080fd5b506100d361023d565b3480156100f657600080fd5b506100d3610105366004610482565b610399565b34801561011657600080fd5b506100a260015481565b34801561012c57600080fd5b5060005461014d9073ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016100ac565b60015434146101e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f496e636f7272656374207374616b696e6720616d6f756e74000000000000000060448201526064015b60405180910390fd5b336000908152600360205260408120805434929061020190849061049b565b909155505060405134815233907febedb8b3c678666e7f36970bc8f57abf6d8fa2e828c0da91ea5b75bf68ed101a9060200160405180910390a2565b336000908152600360205260409020546102b3576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601260248201527f4e6f207374616b6520617661696c61626c65000000000000000000000000000060448201526064016101d9565b60025442101561031f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f5769746864726177616c2074696d6520686173206e6f7420706173736564000060448201526064016101d9565b33600081815260036020526040808220805490839055905190929183156108fc02918491818181858888f19350505050158015610360573d6000803e3d6000fd5b5060405181815233907f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b659060200160405180910390a250565b60005473ffffffffffffffffffffffffffffffffffffffff163314610440576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f4f6e6c792061646d696e2063616e2063616c6c20746869732066756e6374696f60448201527f6e0000000000000000000000000000000000000000000000000000000000000060648201526084016101d9565b600155565b60006020828403121561045757600080fd5b813573ffffffffffffffffffffffffffffffffffffffff8116811461047b57600080fd5b9392505050565b60006020828403121561049457600080fd5b5035919050565b808201808211156104d5577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b9291505056fea2646970667358221220a57a44f33a2384f9c310512836c55b2866836ed6a10fbe908328993dc2f684d564736f6c63430008130033";

type StakingContractConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StakingContractConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StakingContract__factory extends ContractFactory {
  constructor(...args: StakingContractConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      StakingContract & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): StakingContract__factory {
    return super.connect(runner) as StakingContract__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StakingContractInterface {
    return new Interface(_abi) as StakingContractInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): StakingContract {
    return new Contract(address, _abi, runner) as unknown as StakingContract;
  }
}
