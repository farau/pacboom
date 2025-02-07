import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';

// Authentification Discord (app/api/auth/discord/route.js)
export async function GET() {
    try {
        const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_CALLBACK_URL}&response_type=code&scope=identify`; 
        return NextResponse.json({ url: discordAuthUrl }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate Discord auth URL' }, { status: 500 });
    }
}