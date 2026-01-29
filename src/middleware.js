import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/seed'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // For API routes, check Bearer token in Authorization header
    if (pathname.startsWith('/api')) {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        try {
            const { payload } = await jwtVerify(token, secret);

            if (payload.role !== 'Admin') {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
            }

            // Add user info to request headers
            const response = NextResponse.next();
            response.headers.set('x-user-id', payload.userId);
            response.headers.set('x-user-email', payload.email);
            response.headers.set('x-user-role', payload.role);

            return response;
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
