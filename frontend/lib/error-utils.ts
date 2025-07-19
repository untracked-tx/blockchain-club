/**
 * Utility functions for handling blockchain and RPC errors
 */

export function getBlockchainErrorMessage(err: any): string {
  // Parse common blockchain error types for user-friendly messages
  let errorMessage = "An error occurred.";
  
  if (err.code === 4001 || err.message?.includes("User denied")) {
    errorMessage = "Transaction was cancelled by user.";
  } else if (
    err.reason === "Wallet already owns a token of this type" || 
    err.message?.includes("Wallet already owns a token of this type")
  ) {
    errorMessage = "You already own a token of this type! Each wallet can only have one token per type. 🎫";
  } else if (
    err.code === -32603 || 
    err.message?.includes("Internal JSON-RPC error") || 
    err.message?.includes("could not coalesce error") ||
    err.message?.includes("Internal server error") ||
    err.message?.includes("network error") ||
    err.message?.includes("timeout")
  ) {
    errorMessage = "🌐 Testnets can be a bit moody sometimes! Please wait 30 seconds and try again. ☕";
  } else if (err.message?.includes("Max supply reached") || err.reason?.includes("Max supply reached")) {
    errorMessage = "Maximum supply for this token has been reached.";
  } else if (err.message?.includes("Token type not active") || err.reason?.includes("Token type not active")) {
    errorMessage = "This token type is not currently available for minting.";
  } else if (err.message?.includes("insufficient funds")) {
    errorMessage = "Insufficient funds to complete the transaction.";
  } else if (err.message?.includes("execution reverted")) {
    if (err.message?.includes("Officers only") || err.reason?.includes("Officers only")) {
      return "OFFICER_REQUIRED"; // Special case for permission errors
    } else if (err.message?.includes("Not whitelisted") || err.reason?.includes("Not whitelisted")) {
      return "WHITELIST_REQUIRED"; // Special case for permission errors
    } else {
      errorMessage = "Transaction failed. Please check your permissions and try again.";
    }
  } else if (err.reason && !err.reason.includes("0x")) {
    errorMessage = err.reason;
  } else if (err.message && !err.message.includes("0x") && !err.message.includes("execution reverted")) {
    errorMessage = err.message;
  }
  
  return errorMessage;
}

export function isRpcError(err: any): boolean {
  return (
    err.code === -32603 || 
    err.message?.includes("Internal JSON-RPC error") || 
    err.message?.includes("could not coalesce error") ||
    err.message?.includes("Internal server error") ||
    err.message?.includes("network error") ||
    err.message?.includes("timeout")
  );
}

export function isPermissionError(err: any): "OFFICER_REQUIRED" | "WHITELIST_REQUIRED" | null {
  // Don't treat "already owns" errors as permission errors
  if (err.reason === "Wallet already owns a token of this type" || 
      err.message?.includes("Wallet already owns a token of this type")) {
    return null;
  }
  
  if (err.message?.includes("execution reverted")) {
    if (err.message?.includes("Officers only") || err.reason?.includes("Officers only")) {
      return "OFFICER_REQUIRED";
    } else if (err.message?.includes("Not whitelisted") || err.reason?.includes("Not whitelisted")) {
      return "WHITELIST_REQUIRED";
    }
  }
  return null;
}
