"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, FileSearch } from "lucide-react";
import { analyzeTender } from "@/lib/actions/ai-actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AIAnalysisCard({ tender }: { tender: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const result = await analyzeTender(tender);
            if (result.success && result.data) {
                setAnalysis(result.data);
                toast.success("Análisis completado");
            } else {
                toast.error("No se pudo realizar el análisis");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
        setIsLoading(false);
    };

    if (analysis) {
        return (
            <Card className="border-purple-100 shadow-sm bg-purple-50/30 overflow-hidden">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Análisis Inteligente
                    </CardTitle>
                    <Badge variant="outline" className="bg-white text-purple-700 border-purple-200">
                        Score: {analysis.score}/100
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {analysis.summary}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" /> Requisitos Clave
                            </h4>
                            <ul className="space-y-2">
                                {analysis.requirements.map((req: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="bg-green-100 text-green-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">{i + 1}</span>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-600" /> Riesgos Detectados
                            </h4>
                            <ul className="space-y-2">
                                {analysis.risks.map((risk: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="bg-amber-100 text-amber-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">!</span>
                                        {risk}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-100 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-gray-400" />
                    Análisis de Pliegos (IA)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 text-center transition-all">
                    {isLoading ? (
                        <div className="py-2">
                            <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-3" />
                            <p className="text-purple-800 font-medium">Analizando documentos...</p>
                            <p className="text-xs text-purple-500 mt-1 animate-pulse">Extrayendo requisitos técnicos y financieros...</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-purple-900 font-semibold mb-2 flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                Generar Resumen Ejecutivo
                            </p>
                            <p className="text-sm text-purple-600/80 mb-5 max-w-sm mx-auto">
                                Nuestra IA leerá la descripción y documentos del proceso para extraer requisitos habilitantes y riesgos.
                            </p>
                            <Button
                                onClick={handleAnalyze}
                                className="bg-white text-purple-700 hover:bg-purple-100 hover:text-purple-900 border border-purple-200 shadow-sm font-semibold"
                            >
                                Iniciar Análisis
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
