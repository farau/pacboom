import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthCookie } from '@/lib/auth';

export async function GET(req) {
    const client = await pool.connect();
    try {
        const address = await getAuthCookie(); // ✅ Attendre la récupération du cookie
        if (!address) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const checkUserQuery = `
            SELECT user_access_tokens.username, avatarUrl FROM user_access_tokens 
            JOIN users ON users.id = user_access_tokens.user_wallet_id 
            WHERE users.wallet_address = LOWER($1);
        `;
        const result = await client.query(checkUserQuery, [address]);

        if (result.rows.length > 0) {
            return NextResponse.json(result.rows, { status: 200 }); // ✅ Retourne les données avec 200 OK
        } else {
            return new NextResponse(null, { status: 204 }); // ✅ Retourne 204 SANS corps
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des infos Twitter :', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    } finally {
        client.release();
    }
}