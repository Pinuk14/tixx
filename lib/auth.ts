import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export interface DecodedToken {
    userId: string;
    role: 'user' | 'organizer';
    [key: string]: any;
}

/**
 * Validates that all required fields are present in the provided body object.
 * Returns an error Response if any are missing or empty strings, otherwise null.
 */
export function validateFields(body: any, requiredFields: string[]): NextResponse | null {
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid request body format.' }, { status: 400 });
    }

    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            return NextResponse.json(
                { error: 'Missing required field: ' + field },
                { status: 400 }
            );
        }
    }

    return null;
}

/**
 * Extracts and cryptographically verifies the Bearer token from the Authorization header.
 * Returns the decoded token if successful, or an error Response if invalid/missing.
 */
export function verifyToken(req: Request): { decoded?: DecodedToken; errorResponse?: NextResponse } {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
            errorResponse: NextResponse.json(
                { error: 'Unauthorized. Missing or invalid Bearer token.' },
                { status: 401 }
            )
        };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        return { decoded };
    } catch (err) {
        return {
            errorResponse: NextResponse.json(
                { error: 'Unauthorized. Token expired or invalid.' },
                { status: 401 }
            )
        };
    }
}

/**
 * Wrapper helper that forces token verification AND asserts the required role.
 */
export function requireRole(req: Request, requiredRole: 'user' | 'organizer'): { decoded?: DecodedToken; errorResponse?: NextResponse } {
    const verifyResult = verifyToken(req);

    // 1. Check if token itself failed
    if (verifyResult.errorResponse) {
        return verifyResult;
    }

    // 2. Safely cast the decoded token
    const decoded = verifyResult.decoded as DecodedToken;

    // 3. Confirm exact role match
    if (decoded.role !== requiredRole) {
        return {
            errorResponse: NextResponse.json(
                { error: 'Forbidden. Endpoint requires ' + requiredRole + ' privileges.' },
                { status: 403 }
            )
        };
    }

    // Success
    return { decoded };
}
