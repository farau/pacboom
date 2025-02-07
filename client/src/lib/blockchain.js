// lib/blockchain.js - Gestion des interactions avec Ethereum
import { ethers } from 'ethers';
import config from '@/config';

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractPacNub = new ethers.Contract(config.pacNubAddress, config.pacNubABI, provider);
const contractPacBoom = new ethers.Contract(config.pacBoomAddress, config.pacBoomABI, provider);

export { provider, signer, contractPacNub, contractPacBoom };
