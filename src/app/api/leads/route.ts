import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

// Define a simple Schema for leads if not already defined elsewhere
const LeadSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    company: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
});

// Prevent overwriting model if already compiled
const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.email || !body.name) {
            return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
        }

        const lead = await Lead.create(body);

        return NextResponse.json({ success: true, data: lead }, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
    }
}
