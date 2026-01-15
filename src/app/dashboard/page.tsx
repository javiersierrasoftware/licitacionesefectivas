import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Search } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Hola, {session?.user?.name}</h1>
                <p className="text-muted-foreground">
                    Bienvenido a tu panel de control. Aquí tienes un resumen de tu actividad.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Oportunidades Nuevas
                        </CardTitle>
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0 desde la última visita
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Licitaciones Guardadas
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Procesos en seguimiento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Perfil de Empresa
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Incompleto</div>
                        <p className="text-xs text-muted-foreground">
                            Configura tus áreas de interés
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action / CTA */}
            <div className="rounded-lg border bg-blue-50 p-6 text-blue-900">
                <h3 className="text-lg font-semibold mb-2">Comienza configurando tu perfil</h3>
                <p className="mb-4 text-sm">Para que podamos encontrar las licitaciones perfectas para ti, necesitamos saber qué códigos UNSPSC te interesan.</p>
                <a href="/dashboard/profile" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                    Completar Perfil
                </a>
            </div>
        </div>
    );
}
