// Connexion utilisateur (app/api/user/login/route.js)
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Récupération du leaderboard (app/api/leaderboard/route.js)
export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM leaderboard ORDER BY score DESC LIMIT 10');
        client.release();

        return NextResponse.json({ leaderboard: result.rows }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}