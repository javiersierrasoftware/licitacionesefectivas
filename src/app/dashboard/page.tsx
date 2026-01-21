import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Search, DollarSign, Briefcase } from "lucide-react";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import { fetchSecopOpportunities } from "@/lib/services/secop";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ payment?: string; message?: string }> }) {
    const session = await auth();
    const { payment, message } = await searchParams;

    // 1. Fetch User Data & Validation
    let subscriptionStatus = 'inactive';
    let profile = null;

    if (session?.user?.email) {
        await dbConnect();
        const User = require("@/lib/models/User").default;
        const dbUser = await User.findOne({ email: session.user.email }).lean();
        subscriptionStatus = dbUser?.subscriptionStatus || 'inactive';

        // Fetch Profile for UNSPSC codes
        profile = await CompanyProfile.findOne({ userId: session.user.id }).lean();
    }

    const showSuccess = payment === 'success';
    const showAlreadySubscribed = message === 'already_subscribed';

    if (subscriptionStatus !== 'active' && !showSuccess) {
        redirect("/planes?alert=payment_required");
    }

    // 2. Fetch Data for Statistics
    // We use the same service as the Opportunities page to ensure consistency
    let opportunities: any[] = [];
    let savedCount = 0;

    try {
        const [oppsResult, savedCountResult] = await Promise.allSettled([
            fetchSecopOpportunities(profile?.unspscCodes || []),
            SavedOpportunity.countDocuments({ userId: session.user.id, isFavorite: true }),
        ]);

        if (oppsResult.status === 'fulfilled') {
            opportunities = oppsResult.value;
        }
        if (savedCountResult.status === 'fulfilled') {
            savedCount = savedCountResult.value;
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
    }

    // 3. Calculate Aggregations
    const totalCount = opportunities.length;

    // Calculate Total Valuation (sum of precio_base)
    const totalValuation = opportunities.reduce((acc, curr) => {
        const val = parseFloat(curr.precio_base || "0");
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    // Calculate Top Entities
    const entityMore = opportunities.reduce((acc: { [key: string]: number }, curr) => {
        const name = curr.entidad || "Desconocida";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
    }, {});

    const topEntities = Object.entries(entityMore)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5);

    // Formatters
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
            notation: val > 1_000_000_000 ? "compact" : "standard"
        }).format(val);
    };

    return (
        <div className="space-y-6">
            {/* Headers & Banners */}
            {showSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-in slide-in-from-top-2">
                    <strong className="font-bold">¡Pago Exitoso! </strong>
                    <span className="block sm:inline">Tu plan ha sido activado.</span>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">Hola, {session?.user?.name}</h1>
                </div>
                <p className="text-muted-foreground">
                    Resumen de actividad basado en tus filtros.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Oportunidades Totales */}
                <Card className="border-l-4 border-l-[#00B4D8] shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Oportunidades Activas
                        </CardTitle>
                        <Search className="h-4 w-4 text-[#00B4D8]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Disponibles ahora
                        </p>
                    </CardContent>
                </Card>

                {/* Valor Total */}
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Valor Total Mercado
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValuation)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Suma de cuantías
                        </p>
                    </CardContent>
                </Card>

                {/* Guardadas */}
                <Card className="border-l-4 border-l-amber-400 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            De Tu Interés
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{savedCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Marcadas como favoritas
                        </p>
                    </CardContent>
                </Card>

                {/* Perfil Status */}
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Perfil de Filtrado
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {profile?.unspscCodes?.length ? "Activo" : "General"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {profile?.unspscCodes?.length
                                ? `${profile.unspscCodes.length} códigos configurados`
                                : "Sin filtros aplicados"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Entidades */}
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Entidades Contratantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topEntities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay datos suficientes.</p>
                            ) : (
                                topEntities.map(([name, count], index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {name}
                                            </p>
                                        </div>
                                        <div className="text-sm font-bold text-gray-600">
                                            {count as number}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action or Tips */}
                <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-sm flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Consejo para ganar</h3>
                    <p className="text-blue-700/80 text-sm mb-6">
                        Revisa los pliegos de condiciones inmediatamente. Las licitaciones con cuantías menores suelen tener tiempos de respuesta muy cortos (2-3 días).
                    </p>
                    <a
                        href="/dashboard/opportunities"
                        className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-[#00B4D8] text-white hover:bg-[#009bb8] h-10 px-6 py-2 self-start"
                    >
                        Ver Oportunidades Ahora
                    </a>
                </div>
            </div>
        </div>
    );
}
