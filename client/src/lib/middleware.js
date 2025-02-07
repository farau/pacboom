// middleware.js - Vérification des JWT pour sécuriser les routes API
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req) {
    const token = req.cookies.get('jwt');
    const verified = token ? verifyToken(token) : null;

    if (!verified) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/*'],
};
