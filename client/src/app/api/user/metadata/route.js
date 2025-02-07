import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Récupération des métadonnées utilisateur (app/api/user/metadata/route.js)
export async function POST(req) {
    try {
        const { username } = await req.json();

        const client = await pool.connect();
        const result = await client.query('SELECT * FROM metadata WHERE username = $1', [username]);
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ message: 'Metadata not found' }, { status: 404 });
        }
        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error retrieving metadata' }, { status: 500 });
    }
}