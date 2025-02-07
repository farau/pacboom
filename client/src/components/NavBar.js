import React from "react";
import Image from "next/image";
import Link from "next/link";
import WalletButton from "@/components/WalletButton";
import "../styles/style.css";
import { useAppKitAccount } from "@reown/appkit/react";
import Twitter from './Twitter';

const NavBar = () => {
  const { isConnected } = useAppKitAccount(); // Récupère l'adresse du wallet
  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top bg-black">
      <div className="container d-flex justify-content-center">
        {/* Logo centré */}
        <Link className="navbar-brand d-flex align-items-center" href="/">
          <Image
            src="/img/logo.png"
            height={70}
            width={250}
            className="d-inline-block align-top"
            alt="Logo"
          />
        </Link>

        {/* Bouton de toggler pour mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu centré */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav text-center">
            <li className="nav-item">
              <Link href="/" className="nav-link">Play</Link>
            </li>
            <li className="nav-item">
              <Link href="/arena" className="nav-link">Arena</Link>
            </li>
            <li className="nav-item">
              <Link href="/myaccount" className="nav-link">My Account</Link>
            </li>
            <li className="nav-item">
              <Link href="/myboost" className="nav-link">My Boosts</Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className="nav-link">About</Link>
            </li>
            <li className="nav-item">
              <Link href="/pfpgenerator" className="nav-link">PFP Generator</Link>
            </li>
            <li className="nav-item">
              <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
                      </li>
            {isConnected ? <li className="nav-item">
                <Twitter />
            </li> : null}
            <li className="nav-item">
                <WalletButton />
            </li>      
          </ul>
        </div>

        {/* Bouton Wallet et Twitter à droite */}
        <div className="d-flex align-items-center">
          
          
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
