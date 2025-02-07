// Connexion utilisateur (app/api/user/login/route.js)
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Déconnexion utilisateur (app/api/user/logout/route.js)
export async function POST(req) {
    try {
        return NextResponse.json({ message: 'Successfully logged out' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}