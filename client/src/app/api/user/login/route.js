// Connexion utilisateur (app/api/user/login/route.js)
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { setAuthCookie } from '@/lib/auth';

export async function POST(req) {
    const client = await pool.connect();
    try {
        let response;
        // ✅ Récupérer le wallet depuis la requête
        const { userAddress } = await req.json();
        if (!userAddress) {
            return NextResponse.json({ error: 'Adresse manquante' }, { status: 400 });
        }

        // ✅ Récupérer le dernier ID inséré dans la table users
        const lastUserIdQuery = 'SELECT MAX(id) AS max_id FROM users';
        const { rows } = await client.query(lastUserIdQuery);
        let nextUserId = 1; // Valeur par défaut pour le premier utilisateur
        if (rows.length > 0 && rows[0].max_id !== null) {
            nextUserId = parseInt(rows[0].max_id) + 1; // Incrémente l'ID
        }

        // ✅ Insérer l'utilisateur en s'assurant que `userAddress` est bien défini
        const insertUserQuery = `
            INSERT INTO users (id, wallet_address) VALUES ($1, LOWER($2)) 
            ON CONFLICT (wallet_address) DO NOTHING 
            RETURNING *`;
        const result = await client.query(insertUserQuery, [nextUserId, userAddress]);


        // ✅ Vérifier si l'utilisateur existait déjà
        if (result.rows.length === 0) {
            // ✅ Stocker le JWT dans le cookie avec `cookies()`
            setAuthCookie(req, userAddress);
            response = NextResponse.json({ error: 'User already registered' }, { status: 201 });
        }

        response = NextResponse.json({ message: 'User logged in successfully' }, { status: 200 });
        // ✅ Stocker le JWT dans le cookie avec `cookies()`
        setAuthCookie(response, userAddress);
        return response;
    } catch (error) {
        console.error("❌ Erreur lors de la connexion de l'utilisateur :", error);
        return NextResponse.json({ error: 'Erreur lors de la connexion de l\'utilisateur' }, { status: 500 });
    } finally {
        client.release();
    }
}
