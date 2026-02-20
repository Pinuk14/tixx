import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, password, role } = body;

        // 1. Validate required fields
        if (!name || (!email && !phone) || !password || !role) {
            return NextResponse.json(
                { error: 'Missing required fields. Name, password, role, and either email or phone are required.' },
                { status: 400 }
            );
        }

        if (role !== 'user' && role !== 'organizer') {
            return NextResponse.json(
                { error: 'Invalid role. Must be either "user" or "organizer".' },
                { status: 400 }
            );
        }

        // 2. Check for duplicate users (email or phone)
        let duplicateCheckQuery = 'SELECT id FROM users WHERE ';
        const params: any[] = [];

        if (email && phone) {
            duplicateCheckQuery += 'email = $1 OR phone = $2';
            params.push(email, phone);
        } else if (email) {
            duplicateCheckQuery += 'email = $1';
            params.push(email);
        } else if (phone) {
            duplicateCheckQuery += 'phone = $1';
            params.push(phone);
        }

        const { rowCount } = await query(duplicateCheckQuery, params);

        if (rowCount && rowCount > 0) {
            return NextResponse.json(
                { error: 'A user with this email or phone already exists.' },
                { status: 409 } // Conflict
            );
        }

        // 3. Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Insert into PostgreSQL
        const insertResult = await query(
            `INSERT INTO users (name, email, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, created_at`,
            [name, email || null, phone || null, passwordHash, role]
        );

        const newUser = insertResult.rows[0];

        // 5. Generate signed JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                role: newUser.role
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Secure token expiry
        );

        // 6. Return structured JSON response
        return NextResponse.json(
            {
                message: 'Registration successful',
                user: newUser,
                token
            },
            { status: 201 } // Created
        );

    } catch (error: any) {
        console.error('[Register API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error during registration.' },
            { status: 500 }
        );
    }
}
