import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import { fetchSecopOpportunities, SecopTender } from "@/lib/services/secop";
import { getUnspscName } from "@/lib/data/unspsc-codes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Need badge
import { Calendar, DollarSign, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OpportunitiesTable } from "@/components/dashboard/opportunities/OpportunitiesTable";

export default async function OpportunitiesPage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();
    const profile = await CompanyProfile.findOne({ userId: session.user.id });

    // Safe parallel fetch
    let opportunities: SecopTender[] = [];
    let savedIds = new Set<string>();

    try {
        const [oppsResult, savedResult] = await Promise.allSettled([
            fetchSecopOpportunities(profile?.unspscCodes || []),
            SavedOpportunity.find({ userId: session.user.id, isFavorite: true }).select('tenderId').lean(),
        ]);

        if (oppsResult.status === 'fulfilled') {
            opportunities = oppsResult.value;
        } else {
            console.error("Failed to fetch opportunities:", oppsResult.reason);
        }

        if (savedResult.status === 'fulfilled') {
            savedIds = new Set(savedResult.value.map((item: any) => item.tenderId));
        } else {
            console.error("Failed to fetch saved items:", savedResult.reason);
        }
    } catch (error) {
        console.error("Critical error loading dashboard data:", error);
    }

    // Format currency
    const formatCurrency = (val: string) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(val));
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Oportunidades de Negocio</h1>
                <p className="text-muted-foreground">
                    {profile?.unspscCodes?.length
                        ? "Licitaciones activas en SECOP II que coinciden con tus áreas de interés."
                        : "Mostrando todos los procesos recientes (Modo General). Configura tu perfil para filtrar."}
                </p>
            </div>

            {opportunities.length === 0 ? (
                <div className="p-12 border rounded-lg bg-gray-50 text-center">
                    <p className="text-gray-500">No encontramos procesos activos.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Intenta ampliar tus criterios de búsqueda (elimina algunos filtros).
                    </p>
                </div>
            ) : (
                <OpportunitiesTable opportunities={opportunities} initialSavedIds={savedIds} />
            )}
        </div>
    );
}
