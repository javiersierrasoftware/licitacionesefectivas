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

            {/* Statistics Cards - Modernized */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Oportunidades Totales */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-primary">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Activas</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-2/3 rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Disponibles ahora</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Valor Total */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-secondary">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Valor Mercado</p>
                                <h3 className="text-xl font-bold text-gray-900 truncate" title={formatCurrency(totalValuation)}>{formatCurrency(totalValuation)}</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-secondary w-full rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Suma de cuantías</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Guardadas */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-accent">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">De Interés</p>
                                <h3 className="text-2xl font-bold text-gray-900">{savedCount}</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-accent w-1/2 rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Marcadas favoritas</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Perfil Status */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Perfil</p>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {profile?.unspscCodes?.length ? "Activo" : "General"}
                                </h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${profile?.unspscCodes?.length ? "bg-purple-600 w-full" : "bg-gray-300 w-1/3"}`} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {profile?.unspscCodes?.length
                                    ? `${profile.unspscCodes.length} códigos`
                                    : "Sin filtros"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Top Entidades */}
                <Card className="md:col-span-2 shadow-premium border-0 bg-white">
                    <CardHeader className="border-b border-gray-50 pb-4">
                        <CardTitle className="text-lg font-bold text-gray-800">Top Entidades Contratantes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-5">
                            {topEntities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay datos suficientes.</p>
                            ) : (
                                topEntities.map(([name, count], index) => (
                                    <div key={index} className="flex items-center group">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mr-4 transition-colors ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary transition-colors">
                                                {name}
                                            </p>
                                            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary/60 rounded-full"
                                                    style={{ width: `${Math.min(100, (Number(count) / Number(topEntities[0][1])) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-gray-700 ml-4 bg-gray-50 px-3 py-1 rounded-lg">
                                            {count as number}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action or Tips - Premium Gradient Card */}
                <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-[#0090DF] to-[#005c8f] p-8 shadow-xl shadow-blue-200 text-white flex flex-col justify-between relative overflow-hidden group">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>

                    <div>
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Consejo Pro</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-6">
                            Las licitaciones de <span className="font-semibold text-white">menor cuantía</span> suelen tener menos competencia. Revisa los pliegos inmediatamente, los tiempos de respuesta son cortos (2-3 días).
                        </p>
                    </div>

                    <a
                        href="/dashboard/opportunities"
                        className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white bg-white text-[#0090DF] hover:bg-blue-50 h-11 px-6 shadow-sm hover:shadow-md w-full"
                    >
                        Explorar Oportunidades
                    </a>
                </div>
            </div>
        </div>
    );
}
