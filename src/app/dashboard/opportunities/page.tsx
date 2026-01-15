import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { fetchSecopOpportunities, SecopTender } from "@/lib/services/secop";
import { getUnspscName } from "@/lib/data/unspsc-codes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Need badge
import { Calendar, DollarSign, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OpportunitiesPage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();
    const profile = await CompanyProfile.findOne({ userId: session.user.id });

    const opportunities = await fetchSecopOpportunities(profile?.unspscCodes || []);

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
                <div className="grid gap-6">
                    {opportunities.map((tender) => {
                        // Handle urlproceso which might be an object or string
                        const processUrl = typeof tender.urlproceso === 'object' && tender.urlproceso !== null
                            ? (tender.urlproceso as any).url
                            : tender.urlproceso;

                        // Clean code (remove V1. prefix)
                        const rawCode = tender.codigo_principal_de_categoria || "";
                        const cleanCode = rawCode.startsWith("V1.") ? rawCode.substring(3) : rawCode;
                        const codeName = getUnspscName(cleanCode);

                        return (
                            <Card key={tender.referencia_del_proceso} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex gap-2 mb-2">
                                                <Badge variant={tender.fase === 'Presentación de oferta' ? 'default' : 'secondary'}>
                                                    {tender.fase}
                                                </Badge>
                                                <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                                                    {cleanCode} - {codeName}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-lg font-bold text-primary max-w-3xl line-clamp-2">
                                                {tender.descripci_n_del_procedimiento}
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <span className="font-semibold mr-2">{tender.entidad}</span>
                                                <span>• Ref: {tender.referencia_del_proceso}</span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-xl font-bold text-green-700">
                                                {tender.precio_base ? formatCurrency(tender.precio_base) : 'N/A'}
                                            </div>
                                            <span className="text-xs text-gray-400 uppercase">Cuantía</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 grid md:grid-cols-3 gap-4 text-sm mt-2">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                        {tender.ciudad_entidad}, {tender.departamento_entidad}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        Publicado: {tender.fecha_de_publicacion_del ? new Date(tender.fecha_de_publicacion_del).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="font-semibold mr-2">Modalidad:</span>
                                        {tender.modalidad_de_contratacion}
                                    </div>

                                    <div className="md:col-span-3 flex justify-end mt-4 pt-4 border-t border-gray-100">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={processUrl} target="_blank" rel="noopener noreferrer">
                                                Ver en SECOP II <ExternalLink className="ml-2 h-3 w-3" />
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
