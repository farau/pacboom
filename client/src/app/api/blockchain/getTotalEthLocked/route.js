// Connexion utilisateur (app/api/user/login/route.js)
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Récupération des ETH verrouillés dans la blockchain (app/api/blockchain/getTotalEthLocked/route.js)
import { contractPacBoom } from '@/lib/blockchain';

export async function GET() {
    try {
        const totalLockedEth = await contractPacBoom.getTotalLockedEtherAllPlayers();
        return NextResponse.json({ totalLockedEth: totalLockedEth.toString() }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch total ETH locked' }, { status: 500 });
    }
}
