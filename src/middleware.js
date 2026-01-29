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

    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
        // Redirect to login for page requests
        if (!pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // Return 401 for API requests
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Verify token
        const { payload } = await jwtVerify(token, secret);

        // Check if user is admin
        if (payload.role !== 'Admin') {
            if (!pathname.startsWith('/api')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Add user info to request headers for API routes
        const response = NextResponse.next();
        response.headers.set('x-user-id', payload.userId);
        response.headers.set('x-user-email', payload.email);
        response.headers.set('x-user-role', payload.role);

        return response;
    } catch (error) {
        // Invalid token
        if (!pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
