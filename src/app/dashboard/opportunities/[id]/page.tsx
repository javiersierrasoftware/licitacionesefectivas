import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Tender from "@/lib/models/Tender";
import { getSecopProcesoByRef } from "@/lib/services/secop";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Building2, FileText, ExternalLink, ArrowLeft, Share2, Printer, Info } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProcessActions } from "@/components/dashboard/opportunities/ProcessActions";
import { checkInterestStatus } from "@/lib/actions/process-actions";
import { AIAnalysisCard } from "@/components/dashboard/opportunities/AIAnalysisCard";

interface PageProps {
    params: Promise<{
        id: string; // This is the 'referencia_del_proceso' (e.g., SMG-CD-6873-2025)
    }>;
}

export default async function ProcessDetailPage({ params }: PageProps) {
    const session = await auth();
    if (!session) redirect("/");

    const resolvedParams = await params;
    const processId = decodeURIComponent(resolvedParams.id);

    await dbConnect();

    // 1. Try to find in Local DB
    let tender = await Tender.findOne({ referencia_proceso: processId }).lean();
    let source = "DATABASE";

    // 2. If not found, fetch from SECOP and Save
    if (!tender) {
        console.log(`Process ${processId} not found locally. Fetching from SECOP...`);
        const secopData = await getSecopProcesoByRef(processId);

        if (secopData) {
            source = "SECOP_API";
            // Map SECOP data to our Schema
            // Handle URL object/string weirdness
            const rawUrl = secopData.urlproceso;
            let url = "";
            if (typeof rawUrl === 'string') url = rawUrl;
            else if (rawUrl && typeof rawUrl === 'object') url = (rawUrl as any).url;

            const newTender = {
                referencia_proceso: secopData.referencia_del_proceso,
                entidad: secopData.entidad,
                descripcion: secopData.descripci_n_del_procedimiento,
                objeto: secopData.descripci_n_del_procedimiento, // often same
                modalidad: secopData.modalidad_de_contratacion,
                precio_base: Number(secopData.precio_base),
                fecha_publicacion: new Date(secopData.fecha_de_publicacion_del),
                fecha_recepcion_ofertas: secopData.fecha_de_recepcion_de_ofertas ? new Date(secopData.fecha_de_recepcion_de_ofertas) : null,
                departamento: secopData.departamento_entidad,
                ciudad: secopData.ciudad_entidad,
                codigos_unspsc: secopData.codigo_principal_de_categoria ? [secopData.codigo_principal_de_categoria] : [],
                url_proceso: url,
                fase: secopData.fase,
                raw_data: secopData
            };

            // Save to DB
            try {
                const created = await Tender.create(newTender);
                tender = created.toObject(); // use the DB object now
                console.log("Saved new tender to DB:", created.referencia_proceso);
            } catch (err) {
                console.error("Error saving tender to DB:", err);
                // Fallback: use the object we just built for display, even if save failed
                tender = newTender;
            }
        }
    }

    if (!tender) {
        return (
            <div className="p-12 text-center text-gray-500">
                <h2 className="text-xl font-bold mb-2">Proceso no encontrado</h2>
                <p>No pudimos encontrar información para el proceso: {processId}</p>
                <div className="mt-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard/opportunities">Volver a Oportunidades</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Formatting
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    const formatDate = (date: Date | string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("es-CO", { dateStyle: 'long' });
    };

    // Calculate days remaining
    let daysRemaining = null;
    if (tender.fecha_recepcion_ofertas) {
        const now = new Date();
        const end = new Date(tender.fecha_recepcion_ofertas);
        const diffTime = end.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:text-gray-900 -ml-2">
                    <Link href="/dashboard/opportunities">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver
                    </Link>
                </Button>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Share2 className="h-4 w-4 mr-2" />
                        Compartir
                    </Button>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>

            {/* Main Object Title Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-gray-50/50 rounded-bl-2xl border-b border-l border-gray-100">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Referencia</span>
                        <span className="text-sm font-mono font-medium text-gray-600 select-all">{tender.referencia_proceso}</span>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 text-xs">
                        {tender.modalidad}
                    </Badge>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight mb-6">
                        {tender.descripcion}
                    </h1>

                    <div className="flex flex-wrap gap-y-4 gap-x-8 text-sm">
                        <div className="flex items-center text-gray-600">
                            <Building2 className="h-4 w-4 mr-2 text-primary/70" />
                            <span className="font-semibold text-gray-900 mr-2">Entidad:</span>
                            {tender.entidad}
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
                            <span className="font-semibold text-gray-900 mr-2">Ubicación:</span>
                            {tender.ciudad}, {tender.departamento}
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">

                    {/* Key Info Card */}
                    <Card className="border-gray-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                            <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                                <Info className="h-4 w-4 mr-2 text-primary" />
                                Detalles del Proceso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <dl className="divide-y divide-gray-50">
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
                                    <dt className="text-sm font-medium text-gray-500">Estado Actual</dt>
                                    <dd className="text-sm text-gray-900 sm:col-span-2 font-medium flex items-center">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${tender.fase?.includes('Presentación') ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {tender.fase}
                                    </dd>
                                </div>
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
                                    <dt className="text-sm font-medium text-gray-500">Valor Estimado</dt>
                                    <dd className="text-lg text-green-700 sm:col-span-2 font-bold font-mono">
                                        {formatCurrency(tender.precio_base)}
                                    </dd>
                                </div>
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
                                    <dt className="text-sm font-medium text-gray-500">Códigos UNSPSC</dt>
                                    <dd className="text-sm text-gray-900 sm:col-span-2">
                                        <div className="flex flex-wrap gap-2">
                                            {tender.codigos_unspsc?.map((code: string) => (
                                                <Badge key={code} variant="secondary" className="font-mono text-xs text-gray-600 bg-gray-100">
                                                    {code}
                                                </Badge>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-gray-50/50 transition-colors">
                                    <dt className="text-sm font-medium text-gray-500">Fuente de Datos</dt>
                                    <dd className="text-xs text-gray-400 sm:col-span-2 flex items-center">
                                        {source === 'DATABASE' ? 'Base de datos local (Sincronizado)' : 'API SECOP II (Tiempo real)'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Document Links Section */}
                    <Card className="border-gray-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                            <CardTitle className="text-base font-bold text-gray-800 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                Documentos del Proceso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            {tender.url_proceso ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2 rounded text-red-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">Enlace al Proceso (SECOP II)</p>
                                                <p className="text-xs text-gray-500">Fuente oficial</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" asChild className="text-blue-600 hover:text-blue-800">
                                            <a href={tender.url_proceso} target="_blank" rel="noopener noreferrer">
                                                Abrir <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-center text-gray-400 mt-2">
                                        * Los documentos detallados (Pliegos, Anexos) deben consultarse directamente en la plataforma SECOP II usando el enlace anterior.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic text-center">No hay enlaces disponibles.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Analysis Component */}
                    <AIAnalysisCard tender={JSON.parse(JSON.stringify(tender))} />

                </div>

                {/* Right Column: Dates & Actions */}
                <div className="space-y-6">
                    {/* Timeline Card */}
                    <Card className="border-gray-100 shadow-premium bg-white">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Cronograma</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>

                            <div className="relative z-10 flex items-start gap-3">
                                <div className="w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white mt-1.5 flex-none"></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Publicación</p>
                                    <p className="text-sm font-bold text-gray-900">{formatDate(tender.fecha_publicacion)}</p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-start gap-3">
                                <div className={`w-3 h-3 rounded-full ring-4 ring-white mt-1.5 flex-none ${daysRemaining && daysRemaining > 0 ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="text-xs text-secondary font-bold uppercase mb-0.5">Cierre de Ofertas</p>
                                    <p className="text-sm font-bold text-gray-900">{formatDate(tender.fecha_recepcion_ofertas)}</p>
                                    {daysRemaining !== null && (
                                        <p className={`text-xs font-medium mt-1 ${daysRemaining > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {daysRemaining > 0 ? `Quedan ${daysRemaining} días` : 'Finalizado'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                            <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold" asChild>
                                <a href={tender.url_proceso} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver en SECOP II
                                </a>
                            </Button>
                        </div>
                    </Card>

                    {/* Action Card: Favorite & Notes */}
                    <Card className="border-gray-100 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-gray-50">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-gray-500">Gestión</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <ProcessActions tender={tender} initialStatus={await checkInterestStatus(tender.referencia_proceso)} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}
