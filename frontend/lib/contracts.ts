// lib/contracts.ts
import { getContractAddress, getContractAbi } from "@/lib/deployment"

export const contracts = {
  membership: {
    address: getContractAddress("BlockchainClubMembership"),
    abi: getContractAbi("BlockchainClubMembership"),
  },
  roles: {
    address: getContractAddress("Roles"),
    abi: getContractAbi("Roles"),
  },
  treasury: {
    address: getContractAddress("TreasuryRouter"),
    abi: getContractAbi("TreasuryRouter"),
  },
  voting: {
    address: getContractAddress("VotingPowerStrategy"),
    abi: getContractAbi("VotingPowerStrategy"),
  },
}
