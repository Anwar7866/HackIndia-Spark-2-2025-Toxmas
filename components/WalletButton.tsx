import React, { useState, useEffect } from "react";

declare global {
  interface Window {
    ethereum: any;
  }
}
import { ethers } from "ethers";
import { IconLoader, IconWallet, IconX } from "@tabler/icons-react";

interface WalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  onConnect,
  onDisconnect,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts: string[] = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            onConnect?.(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkWalletConnection();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect?.(accounts[0]);
      } else {
        setAccount(null);
        onDisconnect?.();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [onConnect, onDisconnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install it to connect.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        onConnect?.(accounts[0]);
      }
    } catch (err: any) {
      setError(
        err.code === 4001
          ? "User denied access to accounts."
          : "Failed to connect to wallet."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    onDisconnect?.();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px",
        backgroundColor: "#2d2f33",
        color: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {account ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px", fontWeight: "bold" }}>
            {account.substring(0, 6)}...{account.substring(38)}
          </span>
          <button
            onClick={disconnectWallet}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 15px",
              backgroundColor: "#ea1",
              color: "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              transition: "0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#c0392b")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#e74c3c")
            }
          >
            <IconX size={20} style={{ marginRight: "5px" }} /> Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 15px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            opacity: isLoading ? 0.7 : 1,
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "0.3s",
            whiteSpace: "nowrap",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2980b9")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#3498db")
          }
        >
          {isLoading ? (
            <IconLoader
              size={20}
              style={{
                marginRight: "5px",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <IconWallet size={20} style={{ marginRight: "5px" }} />
          )}
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
};

export default WalletButton;
