"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or use a simple alert if no toast provider

export function ManualSyncButton() {
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<{ fetched: number, newly: number, updated: number } | null>(null);

    const handleSync = async () => {
        setLoading(true);
        setLastResult(null);
        try {
            const res = await fetch("/api/cron/sync");
            const data = await res.json();

            if (data.success) {
                setLastResult({
                    fetched: data.summary.fetched,
                    newly: data.summary.newly_created,
                    updated: data.summary.updated
                });
                toast.success(`Sincronización Completada: ${data.summary.newly_created} nuevos procesos.`);
            } else {
                toast.error("Error en la sincronización.");
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            {lastResult && (
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    <span>
                        <span className="font-bold text-gray-700">{lastResult.newly}</span> Nuevos |
                        <span className="font-bold text-gray-700 ml-1">{lastResult.updated}</span> Actualizados
                    </span>
                </div>
            )}

            <Button
                onClick={handleSync}
                disabled={loading}
                variant="outline"
                className="bg-white border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-sm"
            >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Sincronizando..." : "Sincronizar SECOP Ahora"}
            </Button>
        </div>
    );
}
