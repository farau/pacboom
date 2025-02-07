import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Sauvegarde du score utilisateur (app/api/user/score/route.js)
export async function POST(req) {
    try {
        const { userAddress, score } = await req.json();

        const client = await pool.connect();
        await client.query(`UPDATE users SET score = GREATEST($1, score) WHERE wallet_address = $2`, [score, userAddress]);
        client.release();

        return NextResponse.json({ message: 'Score successfully saved' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}