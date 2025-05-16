// lib/deployment.ts
import deployment from './deployment.json'

type ContractName = keyof typeof deployment

export function getContractAddress(name: ContractName): `0x${string}` {
  return deployment[name].address as `0x${string}`
}

export function getContractAbi(name: ContractName): any[] {
  return deployment[name].abi
}
