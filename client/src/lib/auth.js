import { cookies } from 'next/headers';
import crypto from 'crypto';

// Clé secrète pour signer le token
const SECRET_KEY = process.env.SECRET_EXPRESS_SESSION || crypto.randomBytes(32).toString('hex');

export function setAuthCookie(response, userAddress) {
    // ✅ Création du JWT-like token
    const tokenPayload = JSON.stringify({ address: userAddress, exp: Date.now() + 3600 * 1000 });
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(tokenPayload).digest('hex');
    const token = Buffer.from(`${tokenPayload}.${signature}`).toString('base64');
    // ✅ Stocker le token dans un cookie sécurisé via `cookies()`
    response.cookies.set('jwt', token, {
        httpOnly: true, // Sécurise contre XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS en production
        sameSite: 'Strict', // Protection CSRF
        maxAge: 3600, // Expiration en 1 heure
        path: '/', // Accessible sur tout le site
    });
}

export async function getAuthCookie() {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;
    if (!token) return null;

    try {
        const [payload, signature] = Buffer.from(token, 'base64').toString().split('.');
        const validSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
        if (validSignature !== signature) return null; // Signature invalide
        const data = JSON.parse(payload);
        if (Date.now() > data.exp) return null; // Token expiré
        return data.address;
    } catch (error) {
        return null;
    }
}


// Ajouter la fonction verifyToken pour valider un token
export function verifyToken(token) {
    try {
        const [payload, signature] = Buffer.from(token, 'base64').toString().split('.');
        const validSignature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
        if (validSignature !== signature) return null;
        const data = JSON.parse(payload);
        if (Date.now() > data.exp) return null;
        return data.address;
    } catch (error) {
        return null;
    }
}