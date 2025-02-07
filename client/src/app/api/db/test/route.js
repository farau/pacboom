import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const client = await pool.connect();
        const result = await client.query(`INSERT INTO users (id, wallet_address) VALUES (666, LOWER('0x3b5de2ad56d4957100993529ed282b3d645a1692'))`); // Teste une requête simple
        client.release();

        return NextResponse.json({ success: true, currentTime: result.rows[0] }, { status: 200 });
    } catch (error) {
        console.error('❌ Erreur de connexion PostgreSQL:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
