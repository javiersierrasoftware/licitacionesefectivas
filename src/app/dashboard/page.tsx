import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Search } from "lucide-react";

import { redirect } from "next/navigation";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ payment?: string; message?: string }> }) {
    const session = await auth();
    const { payment, message } = await searchParams;

    // Fetch User Subscription Status
    let subscriptionStatus = 'inactive';
    if (session?.user?.email) {
        const User = require("@/lib/models/User").default;
        const dbUser = await User.findOne({ email: session.user.email }).lean();
        subscriptionStatus = dbUser?.subscriptionStatus || 'inactive';
    }

    const showSuccess = payment === 'success';
    const showAlreadySubscribed = message === 'already_subscribed';

    // STRICT FLOW: If not active and not just finished payment, redirect to Plans
    // We allow access if payment=success (just in case webhook races with redirect)
    // But strictly speaking, webhook should have set it to active.
    // Let's rely on status.
    if (subscriptionStatus !== 'active' && !showSuccess) {
        redirect("/planes?alert=payment_required");
    }

    return (
        <div className="space-y-6">
            {/* Payment Success Banner */}
            {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-in slide-in-from-top-2" role="alert">
                    <strong className="font-bold">¡Pago Exitoso! </strong>
                    <span className="block sm:inline">Tu plan ha sido activado correctamente. Bienvenido a bordo.</span>
                </div>
            )}

            {/* Already Subscribed Banner */}
            {showAlreadySubscribed && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative animate-in slide-in-from-top-2" role="alert">
                    <strong className="font-bold">¡Ya tienes un plan activo! </strong>
                    <span className="block sm:inline">No necesitas suscribirte de nuevo.</span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Hola, {session?.user?.name}</h1>
                    {subscriptionStatus === 'active' && (
                        <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full border border-green-200">
                            Plan Activo
                        </span>
                    )}
                </div>
                <p className="text-muted-foreground">
                    Bienvenido a tu panel de control. Aquí tienes un resumen de tu actividad.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Oportunidades Nuevas
                        </CardTitle>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Search className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +0 desde la última visita
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Licitaciones Guardadas
                        </CardTitle>
                        <div className="p-2 bg-green-100 rounded-full">
                            <Clock className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Procesos en seguimiento
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Perfil de Empresa
                        </CardTitle>
                        <div className="p-2 bg-purple-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">Incompleto</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Configura tus áreas de interés
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action / CTA */}
            {/* Quick Action / CTA */}
            <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-blue-900 mb-1">Comienza configurando tu perfil</h3>
                        <p className="text-blue-700/80 text-sm max-w-2xl">
                            Para encontrar licitaciones perfectas para ti, necesitamos saber qué códigos UNSPSC te interesan.
                        </p>
                    </div>
                    <a href="/dashboard/profile" className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg h-10 px-6 py-2">
                        Completar Perfil
                    </a>
                </div>
            </div>
        </div>
    );
}
