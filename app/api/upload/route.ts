import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        // Enforce organizer role (only organizers can upload images)
        const { errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        // Generate a unique file name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileName = `${uniqueSuffix}-${file.name.replace(/\s+/g, '_')}`;

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadsDir, fileName);

        // Ensure the uploads directory exists
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (dirError) {
            // Ignore if directory already exists
        }

        // Save the file
        await writeFile(filePath, Buffer.from(buffer));

        // Return the public URL
        const imageUrl = `/uploads/${fileName}`;

        return NextResponse.json(
            { message: 'File uploaded successfully', imageUrl },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('[Upload API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while uploading file.' },
            { status: 500 }
        );
    }
}
