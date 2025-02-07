// Connexion utilisateur (app/api/user/login/route.js)
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Récupération des dégâts des joueurs (app/api/fetchDamagePlayers/route.js)
import { fetchSubgraphData, aggregateDamageBySerial } from '@/lib/subgraph';

export async function POST(req) {
    try {
        const { serial } = await req.json();
        const damageData = await fetchSubgraphData(serial);
        const aggregatedDamage = aggregateDamageBySerial(damageData, serial);
        return NextResponse.json({ aggregatedDamage }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching damage per player' }, { status: 500 });
    }
}