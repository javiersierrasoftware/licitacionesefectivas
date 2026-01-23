import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import BiddingProcess from "@/lib/models/BiddingProcess";
import Tender from "@/lib/models/Tender"; // Ensure Tender is registered
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, Clock, AlertCircle } from "lucide-react";

export default async function BiddingListPage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // Ensure Tender model is initialized before populating
    // This is a common mongoose fix when using populate in Next.js server components
    console.log("Registered Models:", Object.keys(require('mongoose').connection.models));

    const processes = await BiddingProcess.find({ userId: session.user.id })
        .populate('tenderId')
        .sort({ updatedAt: -1 });

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-2">Mis Procesos de Licitación</h1>
            <p className="text-gray-500 mb-8">Gestiona tus participaciones activas y prepara tus ofertas.</p>

            {processes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No estás participando en procesos</h3>
                    <p className="text-gray-500 mb-6">Busca oportunidades y haz clic en "Participar" para comenzar.</p>
                    <Button asChild>
                        <Link href="/dashboard/opportunities">Buscar Oportunidades</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {processes.map((process) => {
                        const tender = process.tenderId;
                        return (
                            <Card key={process._id.toString()} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-600">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${process.status === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' :
                                                process.status === 'RADICADO' ? 'bg-purple-100 text-purple-800' :
                                                    process.status === 'GANADO' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {process.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {process.progress}%
                                        </span>
                                    </div>
                                    <CardTitle className="text-base line-clamp-2 leading-snug">
                                        {tender?.descripcion || "Proceso sin descripción"}
                                    </CardTitle>
                                    <CardDescription className="text-xs mt-1 font-mono">
                                        {process.tenderRef}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 space-y-2">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-semibold text-gray-900">Entidad:</span> {tender?.entidad || "N/A"}
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${process.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 pt-1">
                                            <span>Avance Documental</span>
                                            <span>
                                                {process.requiredDocuments?.filter((d: any) => d.status === 'UPLOADED' || d.status === 'REVIEWED').length || 0}
                                                /{process.requiredDocuments?.length || 0} Docs
                                            </span>
                                        </div>
                                    </div>

                                    <Button asChild className="w-full group">
                                        <Link href={`/dashboard/bidding/${process._id}`}>
                                            Gestionar Oferta
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
