"use client";
import { useState, useEffect } from "react";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import "../styles/style.css";

const WalletButton = () => {
    const { open } = useAppKit(); // Ouvre la popup de connexion
    const { address, isConnected } = useAppKitAccount(); // Récupère l'adresse du wallet
    const { disconnect } = useDisconnect(); // Gère la déconnexion

    const [walletAddress, setWalletAddress] = useState(null);

    useEffect(() => {
        if (isConnected && address) {
            setWalletAddress(address);
    
            fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Permet d'envoyer et recevoir les cookies
                body: JSON.stringify({ userAddress: address }) // Envoie l'adresse du wallet
            })
            .then(response => {
                if (response.status === 204) return null;
                if (!response.ok) throw new Error('Error API');
                return response.json();
            })
            .catch(error => console.error('Error during login process:', error));
        }
    }, [isConnected, address]);
    

    const connectWallet = async () => {
        try {
            await open(); // Ouvre la popup de connexion
        } catch (error) {
            console.error("Error during login :", error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await open();
            if (!isConnected) {
                setWalletAddress(null) // Réinitialise l'adresse après déconnexion
            }  
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    return (
        <div>
            <div className="wallet-container">
            {isConnected ? (
                        <button className="wallet-button" onClick={handleDisconnect} id="connectWallet">
                            {walletAddress
                                ? `${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`
                                : "Connect Wallet"}
                        </button>
                    
            ) : (
                <button id="connectWallet" onClick={connectWallet} className="connect-btn">
                    Connect Wallet
                </button>
            )}
            </div>
        </div>
    );
};

export default WalletButton;
