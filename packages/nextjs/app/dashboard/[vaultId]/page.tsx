// app/dashboard/[vaultId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useVaultContext } from "../../_firebase/VaultContext"; // Adjust path if needed
import VaultDetailSection from "../_components/VaultDetailSection"; // Adjust path if needed
import { useParams } from "next/navigation";

interface Vault {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: string[];
  totalValueLocked: number;
  yieldStrategies: string[];
  recentActivity: { type: string; amount: number; token: string; timestamp: string }[];
  assetBalance: number;
  shareBalance: number;
  isActive: boolean;
}

const VaultDetailsPage: React.FC = () => {
  const router = useRouter();
  const { vaultId } = useParams(); // Get vaultId from the URL params
  const { db, userId, isAuthReady, appId } = useVaultContext();

  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "" }>({ message: "", type: "" });


  const showTempNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000); // Hide after 3 seconds
  };

  useEffect(() => {
    if (!isAuthReady || !db || !vaultId) {
      console.log("Waiting for Firebase/Auth or vaultId to be ready...");
      return;
    }

    const fetchVault = async () => {
      try {
        setLoading(true);
        const vaultDocRef = doc(db, `artifacts/${appId}/public/data/vaults`, vaultId as string);
        const docSnap = await getDoc(vaultDocRef);

        if (docSnap.exists()) {
          const fetchedVault = { id: docSnap.id, ...docSnap.data() } as Vault;
          setVault(fetchedVault);
          if (userId) {
            setIsCurrentUserAdmin(fetchedVault.adminId === userId);
          }
        } else {
          setError("Vault not found.");
          router.push("/dashboard"); // Redirect to dashboard if vault not found
        }
      } catch (err) {
        console.error("Error fetching vault details:", err);
        setError("Failed to load vault details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [db, vaultId, userId, isAuthReady, router, appId]);

  const handleApprove = () => {
    showTempNotification("Approve functionality not implemented yet.", "success");
    // In a real app, this would interact with a smart contract
  };

  const handleDeposit = async () => {
    if (!vault || !db || !userId) {
      showTempNotification("Vault or user not ready.", "error");
      return;
    }
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showTempNotification("Please enter a valid deposit amount.", "error");
      return;
    }

    try {
      // Simulate on-chain deposit and update Firestore
      const updatedActivity = [...vault.recentActivity, { type: "deposit", amount: amount, token: "USDC", timestamp: new Date().toISOString() }];
      await updateDoc(doc(db, `artifacts/${appId}/public/data/vaults`, vault.id), {
        totalValueLocked: vault.totalValueLocked + amount,
        assetBalance: vault.assetBalance + amount, // For simplicity, update asset balance directly
        recentActivity: updatedActivity,
      });
      setDepositAmount(""); // Clear input
      showTempNotification(`Successfully deposited ${amount} USDC!`, "success");
    } catch (e) {
      console.error("Error depositing:", e);
      showTempNotification("Deposit failed. Please try again.", "error");
    }
  };

  const handleAdminAction = async (action: string) => {
    if (!vault || !db || !isCurrentUserAdmin) {
      showTempNotification("Unauthorized action or vault not ready.", "error");
      return;
    }
    try {
      // Simulate admin action, update vault status or add members
      let message = "";
      if (action === "pause") {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/vaults`, vault.id), { isActive: false });
        message = "Vault paused successfully!";
      } else if (action === "disable") {
        await updateDoc(doc(db, `artifacts/${appId}/public/data/vaults`, vault.id), { isActive: false });
        message = "Vault disabled successfully!";
      } else if (action === "add-member") {
        const newMemberId = prompt("Enter new member User ID:");
        if (newMemberId && !vault.members.includes(newMemberId)) {
          await updateDoc(doc(db, `artifacts/${appId}/public/data/vaults`, vault.id), { members: [...vault.members, newMemberId] });
          message = `Member ${newMemberId} added!`;
        } else if (newMemberId) {
          showTempNotification("Member already exists or invalid ID.", "error");
          return;
        }
      }
      showTempNotification(message, "success");
    } catch (e) {
      console.error(`Error performing ${action} action:`, e);
      showTempNotification(`${action} failed.`, "error");
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-400 text-lg">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-2">Loading vault details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-500 text-lg">
        <p>Error: {error}</p>
        <button className="btn btn-primary bg-red-600 hover:bg-red-700 text-white mt-4" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 text-lg">
        <p>Vault details could not be loaded.</p>
        <button className="btn btn-primary bg-red-600 hover:bg-red-700 text-white mt-4" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center flex-grow pt-10 px-4 md:px-8">
      {notification.message && (
        <div className={`toast toast-end toast-middle`}>
          <div className={`alert ${notification.type === "success" ? "alert-success" : "alert-error"} text-white bg-${notification.type === "success" ? "green" : "red"}-500`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-red-400 text-center sm:text-left break-words">
            {vault.name}
          </h1>
          {isCurrentUserAdmin && (
            <span className="text-red-400 font-semibold text-lg mt-2 sm:mt-0">Your the Admin</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <VaultDetailSection label="Vault Address">
            <span className="break-all">{vault.id}</span>
          </VaultDetailSection>

          <VaultDetailSection label="Status | Total Value Locked">
            <p>{vault.isActive ? "Active" : "Inactive"} | {vault.totalValueLocked} USDC</p>
          </VaultDetailSection>

          {!isCurrentUserAdmin && (
            <VaultDetailSection label="Your Balances">
              <p>Your Asset Balance: {vault.assetBalance} USDC</p>
              <p>Your Share Balance: {vault.shareBalance} vUSDC</p>
            </VaultDetailSection>
          )}

          <VaultDetailSection label="Yield Strategies">
            {vault.yieldStrategies.map((strategy, index) => (
              <p key={index}>{strategy}</p>
            ))}
            {vault.yieldStrategies.length === 0 && <p>No strategies defined.</p>}
          </VaultDetailSection>

          <VaultDetailSection label="Recent Activity">
            {vault.recentActivity.length > 0 ? (
              <ul className="list-disc list-inside">
                {vault.recentActivity.map((activity, index) => (
                  <li key={index}>{activity.type}: {activity.amount} {activity.token}</li>
                ))}
              </ul>
            ) : (
              <p>No recent activity.</p>
            )}
          </VaultDetailSection>

          <VaultDetailSection label="Members">
            {vault.members.length > 0 ? (
              <ul className="list-decimal list-inside">
                {vault.members.map((memberId, index) => (
                  <li key={index} className="break-all">{memberId}</li>
                ))}
              </ul>
            ) : (
              <p>No members yet.</p>
            )}
            <button className="btn btn-ghost btn-xs text-red-400 hover:underline mt-2">More</button>
          </VaultDetailSection>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <VaultDetailSection label="Deposit">
            <input
              type="number"
              placeholder="Amount (USDC)"
              className="input input-bordered w-full bg-white/20 border-red-500 text-gray-200 placeholder-gray-400 mb-3"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <div className="flex space-x-2">
              <button
                className="btn btn-primary bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-6 py-2"
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                className="btn btn-primary bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-6 py-2"
                onClick={handleDeposit}
              >
                Deposit
              </button>
            </div>
          </VaultDetailSection>

          {isCurrentUserAdmin && (
            <VaultDetailSection label="Admin Controls">
              <div className="flex flex-col space-y-3">
                <div className="flex space-x-2">
                  <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none rounded-full" onClick={() => handleAdminAction("pause")}>Pause Vault</button>
                  <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-full" onClick={() => handleAdminAction("disable")}>Disable Vault</button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300">Address:</span>
                  <input type="text" placeholder="Member ID" className="input input-bordered input-sm w-full bg-white/20 border-red-500 text-gray-200 placeholder-gray-400" />
                  <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-full" onClick={() => handleAdminAction("add-member")}>Add Members</button>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="number" placeholder="Withdraw Cap" className="input input-bordered input-sm w-full bg-white/20 border-red-500 text-gray-200 placeholder-gray-400" />
                  <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-full">Withdraw Cap</button>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="number" placeholder="Min Deposit" className="input input-bordered input-sm w-full bg-white/20 border-red-500 text-gray-200 placeholder-gray-400" />
                  <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border-none rounded-full">Set Min Deposit</button>
                </div>
              </div>
            </VaultDetailSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultDetailsPage;
