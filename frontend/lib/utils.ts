import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { keccak256, toUtf8Bytes } from "ethers"

// Helper function to encode a string as bytes32
export function toBytes32(str: string): string {
  const bytes = new TextEncoder().encode(str);
  if (bytes.length > 32) {
    throw new Error("String exceeds 32 bytes");
  }
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return `0x${Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility: get the keccak256 hash of a role name (OpenZeppelin style)
export function getRoleHash(role: string): string {
  // If already a 32-byte hex string, return as is
  if (/^0x[a-fA-F0-9]{64}$/.test(role)) return role;
  // OpenZeppelin uses keccak256(utf8(roleName)) for role identifiers
  return keccak256(toUtf8Bytes(role));
}

// Helper: encode role as bytes32 only if not already a 32-byte hex string, and hash known role names
export function safeRoleBytes(role: string) {
  // If already a 32-byte hex string, return as is
  if (/^0x[a-fA-F0-9]{64}$/.test(role)) return role;
  // If role is a known OpenZeppelin role name, hash it
  if (role.endsWith("_ROLE")) return getRoleHash(role);
  // Otherwise, fallback to bytes32 encoding
  return toBytes32(role);
}

// Centralized safe hasRole query helper
export function safeHasRoleQuery(
  abi: any,
  contract: `0x${string}`,
  role: string,
  address?: `0x${string}`
) {
  return address && role
    ? {
        address: contract,
        abi,
        functionName: "hasRole",
        args: [safeRoleBytes(role), address],
      }
    : undefined;
}
