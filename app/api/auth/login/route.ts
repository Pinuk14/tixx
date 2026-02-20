import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, phone, password } = body;

        // 1. Validate required fields
        if ((!email && !phone) || !password) {
            return NextResponse.json(
                { error: 'Missing credentials. Please provide password and either email or phone.' },
                { status: 400 }
            );
        }

        // 2. Look up the user by email or phone
        let userQuery = 'SELECT * FROM users WHERE ';
        const params: any[] = [];

        if (email && phone) {
            userQuery += 'email = $1 OR phone = $2';
            params.push(email, phone);
        } else if (email) {
            userQuery += 'email = $1';
            params.push(email);
        } else if (phone) {
            userQuery += 'phone = $1';
            params.push(phone);
        }

        const { rows, rowCount } = await query(userQuery, params);

        if (!rowCount || rowCount === 0) {
            return NextResponse.json(
                { error: 'Invalid login credentials.' },
                { status: 401 } // Unauthorized
            );
        }

        const user = rows[0];

        // 3. Validate the payload password against the stored bcrypt hash
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid login credentials.' },
                { status: 401 } // Unauthorized
            );
        }

        // 4. Clean sensitive data before returning to client
        delete user.password_hash;

        // 5. Generate signed JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 6. Return structured JSON response
        return NextResponse.json(
            {
                message: 'Login successful',
                user,
                token
            },
            { status: 200 } // OK
        );

    } catch (error: any) {
        console.error('[Login API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error during login.' },
            { status: 500 }
        );
    }
}
