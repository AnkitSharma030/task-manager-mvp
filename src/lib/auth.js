import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
    return token;
}

export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function hashPassword(password) {
    return bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(request) {
    // Check cookie first
    const cookieToken = request.cookies.get('auth-token')?.value;
    if (cookieToken) return cookieToken;

    // Then check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
}
