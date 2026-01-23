import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Search, DollarSign, Briefcase } from "lucide-react";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import BiddingProcess from "@/lib/models/BiddingProcess";
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
    let opportunities: any[] = [];
    let savedCount = 0;
    let activeProcessesCount = 0;
    let recentProcesses: any[] = [];

    try {
        const [oppsResult, savedCountResult, activeCountResult, recentProcessesResult] = await Promise.allSettled([
            fetchSecopOpportunities(profile?.unspscCodes || []),
            SavedOpportunity.countDocuments({ userId: session.user.id, isFavorite: true }),
            BiddingProcess.countDocuments({ userId: session.user.id, status: { $ne: 'CLOSED' } }), // Count all non-closed
            BiddingProcess.find({ userId: session.user.id, status: { $ne: 'CLOSED' } })
                .sort({ updatedAt: -1 })
                .limit(5)
                .populate('tenderId')
                .lean(),
        ]);

        if (oppsResult.status === 'fulfilled') {
            opportunities = oppsResult.value;
        }
        if (savedCountResult.status === 'fulfilled') {
            savedCount = savedCountResult.value;
        }
        if (activeCountResult.status === 'fulfilled') {
            activeProcessesCount = activeCountResult.value;
        }
        if (recentProcessesResult.status === 'fulfilled') {
            recentProcesses = recentProcessesResult.value;
        }
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
    }

    // 3. Calculate Aggregations
    const totalCount = opportunities.length;

    // Formatting
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
                    Aquí tienes el estado de tus licitaciones en curso.
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Oportunidades SECOP */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-primary">
                                <Search className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Mercado</p>
                                <h3 className="text-2xl font-bold text-gray-900">{totalCount}</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-2/3 rounded-full" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Oportunidades activas</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Procesos Activos (Updated) */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Mis Procesos</p>
                                <h3 className="text-2xl font-bold text-gray-900">{activeProcessesCount}</h3>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (activeProcessesCount / 10) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Licitaciones en curso</p>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Guardadas */}
                <Card className="shadow-premium border-0 bg-white hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-accent">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-muted-foreground">Interés</p>
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

                {/* 4. Perfil Status */}
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
                                    ? `${profile.unspscCodes.length} filtros activos`
                                    : "Sin filtros"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Active Bids List (Replaces Top Entities) */}
                <Card className="md:col-span-2 shadow-premium border-0 bg-white">
                    <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold text-gray-800">Licitaciones en Curso</CardTitle>
                        <a href="/dashboard/bidding" className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
                            Ver todas
                        </a>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {recentProcesses.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No tienes procesos activos.</p>
                                    <a href="/dashboard/opportunities" className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                        Buscar oportunidades
                                    </a>
                                </div>
                            ) : (
                                recentProcesses.map((proc) => (
                                    <div key={proc._id} className="group border rounded-xl p-4 hover:shadow-md transition-all duration-300 bg-white hover:border-blue-200">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {proc.tenderRef}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        Actualizado: {proc.updatedAt ? new Date(proc.updatedAt).toLocaleDateString() : 'Reciente'}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                    {proc.tenderId?.descripcion || "Sin descripción"}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate mt-1">
                                                    {proc.tenderId?.entidad}
                                                </p>

                                                {/* Progress Bar */}
                                                <div className="mt-3 flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${proc.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                                            style={{ width: `${proc.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700 w-8 text-right">
                                                        {proc.progress || 0}%
                                                    </span>
                                                </div>
                                            </div>

                                            <a
                                                href={`/dashboard/bidding/${proc._id}`}
                                                className="hidden sm:inline-flex items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-blue-600 hover:text-white transition-colors"
                                            >
                                                Gestionar
                                            </a>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action or Tips */}
                <div className="md:col-span-1 rounded-2xl bg-gradient-to-br from-[#0090DF] to-[#005c8f] p-8 shadow-xl shadow-blue-200 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>

                    <div>
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Expediente Digital</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-6">
                            Recuerda que puedes generar tus <strong>Cartas de Presentación</strong> y descargar todo tu expediente documental en un solo ZIP desde el gestor.
                        </p>
                    </div>

                    <a
                        href="/dashboard/profile"
                        className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white bg-white text-[#0090DF] hover:bg-blue-50 h-11 px-6 shadow-sm hover:shadow-md w-full"
                    >
                        Actualizar mi Perfil
                    </a>
                </div>
            </div>
        </div>
    );
}
