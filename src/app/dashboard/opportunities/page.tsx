import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import InterestProfile from "@/lib/models/InterestProfile";
import Tender from "@/lib/models/Tender";
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
    // Fetch both CompanyProfile (legacy/main) AND InterestProfiles (new multi-profile system)
    const [profile, interestProfiles] = await Promise.all([
        CompanyProfile.findOne({ userId: session.user.id }),
        InterestProfile.find({ userId: session.user.id, isActive: true }) // Only active profiles
    ]);

    // Aggregate UNSPSC codes from ALL sources
    let allUnspscCodes: string[] = [];

    // 1. From Legacy/Main Profile
    if (profile?.unspscCodes?.length > 0) {
        allUnspscCodes.push(...profile.unspscCodes);
    }

    // 2. From new Interest Profiles
    if (interestProfiles && interestProfiles.length > 0) {
        interestProfiles.forEach((ip: any) => {
            if (ip.unspscCodes && ip.unspscCodes.length > 0) {
                allUnspscCodes.push(...ip.unspscCodes);
            }
        });
    }

    // Deduplicate
    allUnspscCodes = [...new Set(allUnspscCodes)];

    // Safe parallel fetch
    let opportunities: SecopTender[] = [];
    let savedIds = new Set<string>();

    try {
        // --- SYNC START ---
        // Automatically sync fresh data from SECOP on page load
        // This ensures "today's" processes appear immediately
        // Uses the aggregated list of codes
        const freshTenders = await fetchSecopOpportunities(allUnspscCodes);

        if (freshTenders.length > 0) {
            // Helper to prevent "Invalid Date" crash
            const safeDate = (d: string | undefined) => {
                if (!d) return new Date(); // Default to now if missing
                const parsed = new Date(d);
                return isNaN(parsed.getTime()) ? new Date() : parsed;
            };

            const operations = freshTenders.map(st => {
                // Handle URL weirdness
                let url = "";
                if (typeof st.urlproceso === 'string') url = st.urlproceso;
                else if (st.urlproceso && typeof st.urlproceso === 'object') url = (st.urlproceso as any).url;

                return {
                    updateOne: {
                        filter: { referencia_proceso: st.referencia_del_proceso },
                        update: {
                            $set: {
                                referencia_proceso: st.referencia_del_proceso,
                                entidad: st.entidad,
                                descripcion: st.descripci_n_del_procedimiento,
                                objeto: st.descripci_n_del_procedimiento,
                                modalidad: st.modalidad_de_contratacion,
                                precio_base: Number(st.precio_base),
                                fecha_publicacion: safeDate(st.fecha_de_publicacion_del),
                                fecha_recepcion_ofertas: st.fecha_de_recepcion_de_ofertas ? safeDate(st.fecha_de_recepcion_de_ofertas) : null,
                                departamento: st.departamento_entidad,
                                ciudad: st.ciudad_entidad,
                                codigos_unspsc: st.codigo_principal_de_categoria ? [st.codigo_principal_de_categoria] : [],
                                url_proceso: url,
                                fase: st.fase,
                                // raw_data: st // Optional: save raw data if needed
                            }
                        },
                        upsert: true
                    }
                };
            });
            await Tender.bulkWrite(operations);
            console.log(`Synced ${freshTenders.length} tenders from SECOP.`);
        }
        // --- SYNC END ---

        // Query Logic: Filter by UNSPSC codes if they exist in ANY profile
        const tenderQuery: any = {};
        if (allUnspscCodes.length > 0) {
            tenderQuery.codigos_unspsc = { $in: allUnspscCodes };
        }

        const [tendersResults, savedResult] = await Promise.allSettled([
            Tender.find(tenderQuery).sort({ fecha_publicacion: -1 }).limit(100).lean(),
            SavedOpportunity.find({ userId: session.user.id, isFavorite: true }).select('tenderId').lean(),
        ]);

        if (tendersResults.status === 'fulfilled') {
            // Map DB Tender -> SecopTender (UI Interface)
            opportunities = tendersResults.value.map((t: any) => {
                // Debug log for FIRST item only to avoid spam
                // console.log("Mapping Tender:", t.referencia_proceso); 

                return {
                    referencia_del_proceso: t.referencia_proceso || "UNKNOWN_REF",
                    entidad: t.entidad,
                    nit_entidad: "N/A", // Not always present in our schema unless in raw_data
                    departamento_entidad: t.departamento,
                    ciudad_entidad: t.ciudad,
                    descripci_n_del_procedimiento: t.descripcion,
                    precio_base: t.precio_base?.toString(),
                    fase: t.fase,
                    fecha_de_publicacion_del: t.fecha_publicacion?.toISOString(),
                    modalidad_de_contratacion: t.modalidad,
                    urlproceso: t.url_proceso,
                    codigo_principal_de_categoria: t.codigos_unspsc?.[0] || "",
                    fecha_de_recepcion_de_ofertas: t.fecha_recepcion_ofertas?.toISOString()
                };
            });
        } else {
            console.error("Failed to fetch opportunities from DB:", tendersResults.reason);
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Oportunidades de Negocio</h1>
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
