import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Plan from '@/lib/models/plan';

export async function GET() {
    try {
        await dbConnect();

        const adminEmail = "javiersierrac@gmail.com";

        // 1. Promote User to Admin
        const user = await User.findOneAndUpdate(
            { email: adminEmail },
            { role: 'admin' },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: `User ${adminEmail} not found. Please register first.` }, { status: 404 });
        }

        // 2. Seed Plans if empty
        const count = await Plan.countDocuments();
        if (count === 0) {
            const initialPlans = [
                {
                    name: "Básico",
                    price: "Gratis",
                    description: "Para empezar a explorar",
                    features: ["Búsqueda ilimitada", "Filtros básicos", "Notificaciones diarias"],
                    color: "bg-gray-100 text-gray-900",
                    buttonVariant: "outline",
                    order: 1,
                },
                {
                    name: "Emprendedor",
                    price: "$90.000",
                    description: "Para independientes",
                    features: ["Alertas en tiempo real", "Filtros I.A.", "1 Usuario"],
                    color: "bg-blue-50 text-blue-900 border-blue-200",
                    buttonVariant: "default",
                    order: 2,
                },
                {
                    name: "Pyme",
                    price: "$180.000",
                    description: "Equipos en crecimiento",
                    features: ["Todo lo anterior", "3 Usuarios", "Análisis de Pliegos"],
                    color: "bg-blue-600 text-white shadow-xl scale-105 z-10",
                    buttonVariant: "secondary",
                    order: 3,
                },
                {
                    name: "Empresarial",
                    price: "$350.000",
                    description: "Licitadores frecuentes",
                    features: ["Todo lo anterior", "10 Usuarios", "Asesoría Jurídica (2h)"],
                    color: "bg-indigo-50 text-indigo-900 border-indigo-200",
                    buttonVariant: "default",
                    order: 4,
                },
                {
                    name: "Corporativo",
                    price: "Personalizado",
                    description: "Soluciones a medida",
                    features: ["Usuarios Ilimitados", "API Access", "Gestor Dedicado"],
                    color: "bg-gray-900 text-white",
                    buttonVariant: "secondary",
                    order: 5,
                },
            ];

            await Plan.insertMany(initialPlans);
            return NextResponse.json({
                message: `Success! ${adminEmail} is now Admin. 5 Plans created.`,
                userRole: user.role,
                plansCreated: 5
            });
        }

        return NextResponse.json({
            message: `Success! ${adminEmail} is now Admin. Plans already existed.`,
            userRole: user.role
        });

    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
