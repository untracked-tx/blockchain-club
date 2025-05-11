"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAccount, useWriteContract, useReadContract, useConnect } from "wagmi"
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { toBytes32, safeHasRoleQuery, getRoleHash } from "@/lib/utils"
import { NETWORK } from "@/lib/config"
import { encodeFunctionData } from "viem";

// List of all main roles for display (move to top of file)
const ALL_ROLES = [
  "Officer",
  "Member",
  "Supporter",
  "Observer",
  "Alumni",
  "Collector",
  "Recovery",
  "Founder Series",
  "Scholarship",
  "The Graduate",
  "Secret Sauce Token",
  "Loyalty Token",
  "Gold Star Award",
  "Art Drop"
];

// Replace ALL_ROLES with only the main permissioned roles for display
const MAIN_ROLES = [
  "Officer",
  "Member",
  "Supporter",
  "Observer"
];

// Helper function to encode a string as bytes32
// Removed local toBytes32 definition

// Patch: Use a helper to safely encode role only if not already a 32-byte hex string
function safeRoleBytes(role: string) {
  // If already a 32-byte hex string, return as is
  if (/^0x[a-fA-F0-9]{64}$/.test(role)) return role;
  return toBytes32(role);
}

// Patch: Helper to safely get error message
function getErrorMessage(err: any): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.reason) return err.reason;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export default function WhitelistPage() {
  const { address, isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const { data: isWhitelisted, refetch } = useReadContract(
    isValidAddress(address || "")
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "whitelist",
          args: [address],
        }
      : undefined
  );
  const { connect, connectors, status: connectStatus } = useConnect()
  const [input, setInput] = useState("")
  const [status, setStatus] = useState("")
  const { toast } = useToast()
  const [hasMounted, setHasMounted] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0)
  // New: split input and checked address for manual trigger
  const [checkAddressInput, setCheckAddressInput] = useState("")
  const [checkAddress, setCheckAddress] = useState("")
  const { data: isCheckedWhitelisted, isLoading: isChecking } = useReadContract(
    isValidAddress(checkAddress)
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "whitelist",
          args: [checkAddress],
        }
      : undefined
  );
  // Set a default role (e.g., 'observer') for better UX and safety
  const [role, setRole] = useState("observer");
  const encodedRole = role && role.length > 0 ? toBytes32(role) : undefined;
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [roleChecks, setRoleChecks] = useState<Record<string, boolean | undefined>>({});

  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");

  // Helper: check if user is a member (has any token)
  // This is a placeholder; you may want to use a contract call to check balanceOf(address)
  const { data: memberBalance } = useReadContract(
    isValidAddress(address || "")
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "balanceOf",
          args: [address],
        }
      : undefined
  );
  const isMember = memberBalance && Number(memberBalance) > 0;

  // Helper: is the user a member (has any main role)?
  const isMainRoleMember = MAIN_ROLES.some(role => roleChecks[role]);

  // Mint Membership NFT handler
  const handleMintMembership = async () => {
    setMinting(true);
    setMintError("");
    try {
      // You may need to adjust the function name and args to match your contract's mint function
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "mintToken", // or "mintMembership" if that's the function
        args: ["Member", 0, false], // role, price, requireWhitelist (adjust as needed)
        // value: ethers.parseEther("0.01") // if minting requires payment
      });
      toast({ title: "Success", description: "Membership NFT minted!" });
      setTimeout(() => setRefreshFlag(f => f + 1), 1500);
    } catch (err: any) {
      setMintError(err?.message || "Mint failed");
      toast({ title: "Error", description: err?.message || "Mint failed", variant: "destructive" });
    } finally {
      setMinting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const checkNetwork = async () => {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setWrongNetwork(parseInt(chainId, 16) !== NETWORK.chainId);
      };
      checkNetwork();
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  useEffect(() => {
    console.log("[DEBUG] encodedRole:", encodedRole);
  }, [encodedRole]);

  const { data: roleStatus, isLoading: isRoleLoading, error: roleError } = useReadContract(
    isConnected && address && encodedRole
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "hasRole",
          args: [encodedRole, address],
        }
      : undefined
  );

  useEffect(() => {
    if (isConnected && address && encodedRole) {
      console.log("[DEBUG] Fetching role status for:", role, address);
    } else {
      console.log("[DEBUG] Skipping role fetch: role or address invalid");
    }
  }, [role, address, encodedRole]);

  useEffect(() => {
    console.log("[DEBUG] role:", role);
    console.log("[DEBUG] toBytes32(role):", toBytes32(role));
  }, [role]);

  useEffect(() => { setHasMounted(true) }, [])

  // Refetch whitelist status when address or refreshFlag changes
  useEffect(() => {
    if (isConnected && address) {
      refetch()
    }
  }, [address, refreshFlag])

  // Debug: log whitelist status for connected wallet
  useEffect(() => {
    if (isConnected && address) {
      console.log("[DEBUG] isWhitelisted for", address, ":", isWhitelisted)
    }
  }, [isWhitelisted, address, isConnected])

  // Debug: log contract address, ABI, and network
  useEffect(() => {
    console.log("[DEBUG] CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
    console.log("[DEBUG] ABI:", CONTRACT_ABI);

    const setWhitelistFunction = CONTRACT_ABI?.find((f: { name?: string }) => f.name === "setWhitelist");
    const whitelistFunction = CONTRACT_ABI?.find((f: { name?: string }) => f.name === "whitelist");

    if (!setWhitelistFunction) {
      console.error("[ERROR] ABI does not contain 'setWhitelist' function. Check ABI and contract deployment.");
    }

    if (!whitelistFunction) {
      console.error("[ERROR] ABI does not contain 'whitelist' function. Check ABI and contract deployment.");
    }

    console.log("[DEBUG] ABI setWhitelist:", setWhitelistFunction);
    console.log("[DEBUG] ABI whitelist:", whitelistFunction);
  }, []);

  // Move client-only logic into useEffect to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("[DEBUG] Network:", window.ethereum?.networkVersion || window.ethereum?.chainId);
    }
  }, []);

  // Add error handling for whitelist read
  const [readError, setReadError] = useState("")
  useEffect(() => {
    if (isConnected && address) {
      try {
        if (typeof isWhitelisted === "undefined") {
          setReadError("Could not fetch whitelist status. Check contract, ABI, and network.")
        } else {
          setReadError("")
        }
      } catch (e: any) {
        setReadError(e.message || "Unknown error")
      }
    }
  }, [isWhitelisted, address, isConnected])

  // Helper: check if address is valid
  function isValidAddress(addr: string) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  // Helper: check if user is officer or owner (from contract, or just allow if transaction fails)
  // For now, we just check if connected, but you could add a contract call to check role.
  const canManage = isConnected; // Optionally add officer/owner check here

  // Ensure default values for dynamic variables to prevent undefined values during rendering
  const safeIsWhitelisted = !!isWhitelisted;
  const safeAddress = address ?? "Not connected";

  // Debug rendered output to identify mismatches
  useEffect(() => {
    console.log("[DEBUG] Rendered output:", {
      isConnected,
      address: safeAddress,
      isWhitelisted: safeIsWhitelisted,
    });
  }, [isConnected, safeAddress, safeIsWhitelisted]);

  // Fixed missing closing tag for <p> and added detailed error logging
  const handleAdd = async () => {
    setStatus("")
    try {
      console.log("[DEBUG] Calling setWhitelist for", input)
      console.log("[DEBUG] Contract Address:", CONTRACT_ADDRESS)
      console.log("[DEBUG] ABI Function:", CONTRACT_ABI.find(f => f.name === "setWhitelist"))
      console.log("[DEBUG] Input Address:", input)
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "setWhitelist",
        args: [input, true],
      })
      toast({ title: "Success", description: `Added ${input} to whitelist.` })
      setInput("")
      setRefreshFlag(f => f + 1) // trigger whitelist status refresh
      // Extra: refetch after a short delay to allow for chain update
      setTimeout(() => refetch(), 1500)
    } catch (err: any) {
      console.error("[DEBUG] Whitelist add error:", err)
      console.error("[DEBUG] Error Code:", err?.code)
      console.error("[DEBUG] Error Data:", err?.data)
      console.error("[DEBUG] Error Message:", err?.message)
      toast({
        title: "Error",
        description: `Failed to add ${input} to whitelist.\nError: ${err?.message || "Unknown error"}`,
        variant: "destructive"
      })
    }
  }

  const handleRemove = async () => {
    setStatus("")
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "setWhitelist",
        args: [input, false],
      })
      toast({ title: "Success", description: `Removed ${input} from whitelist.` })
      setInput("")
      setRefreshFlag(f => f + 1) // trigger whitelist status refresh
    } catch (err: any) {
      console.error("Whitelist remove error:", err)
      toast({
        title: "Error",
        description: err?.message + (err?.code ? ` (code: ${err.code})` : "") + (err?.data ? `\n${JSON.stringify(err.data)}` : ""),
        variant: "destructive"
      })
    }
  }

  // Default role selection for UI
  const [selectedRole, setSelectedRole] = useState("OFFICER_ROLE"); // Default role
  const selectedRoleHash = getRoleHash(selectedRole);

  // Add state to trigger role check and show toast
  const [pendingRoleCheck, setPendingRoleCheck] = useState(false);
  const [lastCheckedAddress, setLastCheckedAddress] = useState<string | null>(null);

  // For the "Check Role" feature, use the selected role and check address
  const {
    data: hasCheckedRole,
    refetch: refetchCheckedRole,
    isLoading: isCheckingRole
  } = useReadContract(
    isValidAddress(checkAddressInput) && selectedRoleHash
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "hasRole",
          args: [selectedRoleHash, checkAddressInput],
        }
      : undefined
  );

  // For the connected wallet's role status (if needed elsewhere)
  const { data: hasRole } = useReadContract(
    isValidAddress(address || "") && selectedRoleHash
      ? {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "hasRole",
          args: [selectedRoleHash, address],
        }
      : undefined
  );

  // --- Patch: Add debug output for role hashes ---
  useEffect(() => {
    if (selectedRole) {
      console.log(`[DEBUG] Selected role: ${selectedRole}`);
      console.log(`[DEBUG] Role hash (keccak256): ${selectedRoleHash}`);
    }
  }, [selectedRole, selectedRoleHash]);

  // --- Patch: Grant Role uses correct hash ---
  const handleGrantRole = async () => {
    if (!isValidAddress(input)) {
      toast({
        title: "Invalid Address",
        description: `The address ${input} is not valid.`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedRoleHash) {
      toast({
        title: "Role Hash Not Ready",
        description: `The on-chain role hash for ${selectedRole} is not loaded yet. Please try again in a moment.`,
        variant: "destructive",
      });
      return;
    }
    setStatus("");
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "grantRole",
        args: [selectedRoleHash, input],
      });
      toast({ title: "Success", description: `Granted ${selectedRole} to ${input}.` });
      setInput("");
      // 1. Force re-check role for newly granted address
      setTimeout(() => {
        setCheckAddressInput(input); // triggers role check UI
      }, 1500);
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to grant role to ${input}.\nError: ${err?.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  // Patch: Button now triggers refetch and sets pending state
  const handleCheckRole = async () => {
    if (!isValidAddress(checkAddressInput)) {
      toast({
        title: "Invalid Address",
        description: `The address ${checkAddressInput} is not valid.`,
        variant: "destructive",
      });
      return;
    }
    if (!selectedRoleHash) {
      toast({
        title: "Role Hash Not Ready",
        description: `The on-chain role hash for ${selectedRole} is not loaded yet. Please try again in a moment.`,
        variant: "destructive",
      });
      return;
    }
    setPendingRoleCheck(true);
    setLastCheckedAddress(checkAddressInput);
    await refetchCheckedRole();
    // 5. Toast on failure/success
    toast({
      title: "Check Result",
      description: hasCheckedRole
        ? `${checkAddressInput} has the role.`
        : `${checkAddressInput} does NOT have the role.`,
      variant: hasCheckedRole ? "default" : "destructive"
    });
  };

  // Patch: Show toast when result is available after button click
  useEffect(() => {
    if (pendingRoleCheck && lastCheckedAddress) {
      if (typeof hasCheckedRole !== "undefined") {
        toast({
          title: "Role Check",
          description: hasCheckedRole
            ? `${lastCheckedAddress} has the role.`
            : `${lastCheckedAddress} does NOT have the role.`,
        });
        setPendingRoleCheck(false);
      }
    }
  }, [hasCheckedRole, pendingRoleCheck, lastCheckedAddress, toast]);

  // Add admin check for grantRole
  // Use correct OpenZeppelin DEFAULT_ADMIN_ROLE hash
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const { data: isAdmin } = useReadContract(
    safeHasRoleQuery(
      CONTRACT_ABI,
      CONTRACT_ADDRESS,
      DEFAULT_ADMIN_ROLE, // already a 32-byte hex string
      address as `0x${string}`
    )
  );

  const [adminGrantInput, setAdminGrantInput] = useState("");
  const [adminGrantStatus, setAdminGrantStatus] = useState("");

  const handleGrantAdminRole = async () => {
    setAdminGrantStatus("");
    if (!isValidAddress(adminGrantInput)) {
      setAdminGrantStatus("Invalid address");
      toast({ title: "Invalid Address", description: adminGrantInput, variant: "destructive" });
      return;
    }
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "grantRole",
        args: [DEFAULT_ADMIN_ROLE, adminGrantInput],
      });
      setAdminGrantStatus("Success! Admin role granted.");
      toast({ title: "Success", description: `Granted admin role to ${adminGrantInput}` });
      setAdminGrantInput("");
    } catch (err: any) {
      setAdminGrantStatus(err?.message || "Grant failed");
      toast({ title: "Error", description: err?.message || "Grant failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (roleError) {
      console.error("Error fetching role:", roleError)
    }
  }, [roleError])

  useEffect(() => {
    console.log("Address:", address)
    console.log("Check Address:", checkAddress)
    console.log("Whitelist Status:", isWhitelisted)
    console.log("Role Status:", roleStatus)
  }, [address, checkAddress, isWhitelisted, roleStatus])

  // Debugging logs for `hasRole` function
  useEffect(() => {
    if (isConnected && address) {
      console.log("[DEBUG] Encoded Role:", toBytes32(role));
      console.log("[DEBUG] Address for Role Check:", address);
      console.log("[DEBUG] Calling `hasRole` with arguments:", {
        role: toBytes32(role),
        address,
      });
    }
  }, [isConnected, address, role]);

  // Refactor to ensure hooks are called unconditionally
  const renderContent = hasMounted ? (
    <div className="container mx-auto px-4 py-16">
      {wrongNetwork && (
        <div className="mb-8 p-4 bg-red-100 text-red-800 rounded text-center">
          You are connected to the wrong network. Please switch to Polygon Amoy (chainId 80002) in your wallet.
        </div>
      )}
      {!isConnected && (
        <div className="mb-8 p-4 bg-yellow-100 text-yellow-800 rounded text-center">
          Connect your wallet to check roles and manage whitelist.
        </div>
      )}
      <div className="mb-8 p-4 bg-blue-50 rounded">
        <h2 className="text-xl font-bold mb-2">Onboarding Steps</h2>
        <ol className="list-decimal ml-6">
          {!safeIsWhitelisted && (
            <li className="mb-2">
              <Button
                onClick={async () => {
                  setInput(address || "");
                  await handleAdd();
                }}
                disabled={!isConnected || !!safeIsWhitelisted || !!isPending}
              >Add Myself to Whitelist</Button>
              <span className="ml-2">(Step 1: Add your address to the whitelist)</span>
            </li>
          )}
          {safeIsWhitelisted && !isMainRoleMember && (
            <li className="mb-2">
              <Button
                onClick={handleMintMembership}
                disabled={minting || !isConnected || !safeIsWhitelisted}
              >Mint Membership NFT</Button>
              <span className="ml-2">(Step 2: Mint your membership NFT)</span>
              {mintError && <div className="text-red-600 mt-1">{mintError}</div>}
            </li>
          )}
          {isMainRoleMember && (
            <li>
              <span className="text-green-700">You are a member! (Step 3: View your roles and permissions below.)</span>
            </li>
          )}
        </ol>
      </div>
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Whitelist and Role Management</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Manage whitelist and roles for the Blockchain Club. Check, add, or remove addresses from the whitelist, and assign roles.
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Section: Check Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle>Check Whitelist</CardTitle>
            <CardDescription>Check if an address is whitelisted</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="check-address"
              name="check-address"
              placeholder="0x... address"
              value={checkAddressInput}
              onChange={(e) => setCheckAddressInput(e.target.value)}
              className="mb-2"
              autoComplete="off"
            />
            <Button
              onClick={() => setCheckAddress(checkAddressInput)}
              disabled={!isValidAddress(checkAddressInput)}
              className="mb-2"
              size="sm"
            >Check</Button>
            {checkAddress && isValidAddress(checkAddress) && (
              <div className="text-sm">
                {isChecking
                  ? "Checking..."
                  : isCheckedWhitelisted === undefined
                    ? "Enter an address and click Check."
                    : isCheckedWhitelisted
                      ? <span className="text-green-600">This address is whitelisted!</span>
                      : <span className="text-red-600">This address is NOT whitelisted.</span>
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Manage Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Whitelist</CardTitle>
            <CardDescription>Add or remove an address</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter address"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!canManage || !input || !isValidAddress(input) || !!isPending}>Add</Button>
              <Button onClick={handleRemove} disabled={!canManage || !input || !isValidAddress(input) || !!isPending} variant="destructive">Remove</Button>
            </div>
          </CardContent>
        </Card>

        {/* Section: Check Role */}
        <Card>
          <CardHeader>
            <CardTitle>Check Role</CardTitle>
            <CardDescription>Check the role of an address</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter address"
              value={checkAddressInput}
              onChange={(e) => setCheckAddressInput(e.target.value)}
              className="mb-4"
            />
            <Button
              onClick={handleCheckRole}
              disabled={!isValidAddress(checkAddressInput)}
            >Check Role</Button>
            {checkAddressInput && isValidAddress(checkAddressInput) && (
              <div className="text-sm mt-2">
                <div>Roles for {checkAddressInput}:</div>
                <ul className="list-disc ml-4">
                  {MAIN_ROLES.map(role => (
                    <li key={role}>
                      {roleChecks[role] === undefined
                        ? <span>Checking...</span>
                        : roleChecks[role]
                          ? <span className="text-green-600">✅ {role}</span>
                          : <span className="text-gray-400">— {role}</span>
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Grant Role */}
        <Card>
          <CardHeader>
            <CardTitle>Grant Role</CardTitle>
            <CardDescription>Assign a role to an address</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter address"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mb-4"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mb-4 p-2 border rounded"
            >
              <option value="OFFICER_ROLE">Officer</option>
              <option value="MEMBER_ROLE">Member</option>
              <option value="SUPPORTER_ROLE">Supporter</option>
              <option value="OBSERVER_ROLE">Observer</option>
            </select>
            {isAdmin === false && (
              <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-center">
                You do not have permission to grant roles. Only contract admins can grant roles.
              </div>
            )}
            <Button onClick={handleGrantRole} disabled={!canManage || !input || !isValidAddress(input) || !!isPending || isAdmin === false}>Grant Role</Button>
          </CardContent>
        </Card>

        {/* Section: Grant Admin Role */}
        {isAdmin && (
          <div className="mb-8 p-4 bg-purple-50 rounded">
            <h2 className="text-lg font-bold mb-2">Grant Admin Role</h2>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <Input
                placeholder="Enter address to grant admin"
                value={adminGrantInput}
                onChange={e => setAdminGrantInput(e.target.value)}
                className="w-full md:w-96"
              />
              <Button
                onClick={handleGrantAdminRole}
                disabled={!isValidAddress(adminGrantInput)}
              >Grant Admin Role</Button>
            </div>
            {adminGrantStatus && <div className="mt-2 text-sm text-gray-700">{adminGrantStatus}</div>}
            <div className="text-xs text-gray-500 mt-1">Only contract admins can grant admin access to others.</div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );

  useEffect(() => {
    console.log("[DEBUG] Contract Address:", CONTRACT_ADDRESS);
    console.log("[DEBUG] ABI:", CONTRACT_ABI);

    if (isConnected && address) {
      console.log("[DEBUG] Connected Address:", address);
      console.log("[DEBUG] Checking whitelist and role status...");
    }
  }, [isConnected, address]);

  useEffect(() => {
    console.log("[DEBUG] CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
    console.log("[DEBUG] CONTRACT_ABI:", CONTRACT_ABI?.map(f => f.name));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("[DEBUG] Using chainId:", window.ethereum?.networkVersion || window.ethereum?.chainId);
      console.log("[DEBUG] Using CONTRACT_ADDRESS:", CONTRACT_ADDRESS);
      console.log("[DEBUG] ABI keys:", CONTRACT_ABI?.map((f: any) => f.name));
    }
  }, []);

  // 3. Clear status after input/role changes
  useEffect(() => {
    setStatus("");
  }, [input, checkAddressInput, selectedRole]);

  // Helper to check if an address has a given role (calls contract for each role)
  useEffect(() => {
    async function checkAllRoles() {
      if (!isValidAddress(checkAddressInput)) {
        setRoleChecks({});
        return;
      }
      const results: Record<string, boolean> = {};
      for (const role of ALL_ROLES) {
        // Use the contract's hasRole function for each role
        const roleHash = getRoleHash(role.toUpperCase() + "_ROLE");
        try {
          // Use viem's encodeFunctionData for hasRole
          const data = encodeFunctionData({
            abi: CONTRACT_ABI,
            functionName: "hasRole",
            args: [roleHash, checkAddressInput],
          });
          // Use wagmi's publicClient for eth_call
          const res = await (window as any).ethereum.request({
            method: "eth_call",
            params: [{
              to: CONTRACT_ADDRESS,
              data
            }, "latest"]
          });
          // Result is 32 bytes, 0x...01 means true
          results[role] = res && res !== "0x" && res !== "0x0" && res !== "0x0000000000000000000000000000000000000000000000000000000000000000";
        } catch {
          results[role] = false;
        }
      }
      setRoleChecks(results);
    }
    if (checkAddressInput && isValidAddress(checkAddressInput)) {
      checkAllRoles();
    } else {
      setRoleChecks({});
    }
    // eslint-disable-next-line
  }, [checkAddressInput]);

  return renderContent;
}
