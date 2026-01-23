"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Save, Loader2, Briefcase, PlayCircle } from "lucide-react";
import { updateProcessNotes, participateInProcess, toggleInterest } from "@/lib/actions/process-actions";
import { SecopTender } from "@/lib/services/secop";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast"; // Assuming you have toast
import { toast } from "sonner"; // Falling back to simple alert if toast hook not present

interface ProcessActionsProps {
    tender: any;
    initialStatus: string | { isFavorite: boolean; notes: string };
}

export function ProcessActions({ tender, initialStatus }: ProcessActionsProps) {
    const router = useRouter();

    // Determine initial state from the prop (which might be string or object due to legacy)
    const statusString = typeof initialStatus === 'string' ? initialStatus : (initialStatus?.isFavorite ? 'INTERESTED' : 'NONE');
    const legacyNotes = typeof initialStatus === 'object' ? initialStatus?.notes : "";

    const [status, setStatus] = useState(statusString);
    const [notes, setNotes] = useState(legacyNotes);

    const [loadingFav, setLoadingFav] = useState(false);
    const [loadingPart, setLoadingPart] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);

    // Map DB tender back to SecopTender shape
    const adaptedTender: SecopTender = {
        referencia_del_proceso: tender.referencia_proceso || tender.referencia_del_proceso,
        entidad: tender.entidad,
        nit_entidad: tender.nit_entidad || "N/A",
        departamento_entidad: tender.departamento || tender.departamento_entidad,
        ciudad_entidad: tender.ciudad || tender.ciudad_entidad,
        descripci_n_del_procedimiento: tender.descripcion || tender.descripci_n_del_procedimiento,
        precio_base: tender.precio_base?.toString() || "0",
        fase: tender.fase,
        fecha_de_publicacion_del: tender.fecha_publicacion?.toString() || tender.fecha_de_publicacion_del,
        modalidad_de_contratacion: tender.modalidad || tender.modalidad_de_contratacion,
        urlproceso: tender.url_proceso || tender.urlproceso,
        codigo_principal_de_categoria: tender.codigos_unspsc?.[0] || tender.codigo_principal_de_categoria,
        fecha_de_recepcion_de_ofertas: tender.fecha_recepcion_ofertas?.toString() || tender.fecha_de_recepcion_de_ofertas
    };

    const handleToggleInterest = async () => {
        setLoadingFav(true);
        try {
            const newStatus = status === 'INTERESTED' ? 'NONE' : 'INTERESTED';
            await toggleInterest(adaptedTender.referencia_del_proceso, newStatus === 'INTERESTED');
            setStatus(newStatus);
            router.refresh();
        } catch (error) {
            console.error("Failed to toggle interest", error);
        } finally {
            setLoadingFav(false);
        }
    };

    const handleParticipate = async () => {
        setLoadingPart(true);
        try {
            const result = await participateInProcess(adaptedTender.referencia_del_proceso);
            if (result.success) {
                setStatus('PARTICIPATING');
                // Optional: Redirect immediately or let user choose
                // router.push(`/dashboard/bidding/${adaptedTender.referencia_del_proceso}`);
                router.refresh();
            } else {
                console.error("Failed to start participation", result.error);
                alert(`Error al iniciar participación: ${result.error}`);
            }
        } catch (error) {
            console.error("Error participating", error);
            alert("Error de conexión al intentar participar.");
        } finally {
            setLoadingPart(false);
        }
    };

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        try {
            await updateProcessNotes(adaptedTender.referencia_del_proceso, notes);
        } catch (error) {
            console.error("Failed to save notes", error);
        } finally {
            setSavingNotes(false);
        }
    };

    const isInterested = status === 'INTERESTED' || status === 'PARTICIPATING';
    const isParticipating = status === 'PARTICIPATING';

    return (
        <div className="space-y-4">
            {/* Primary Action: Participate */}
            {!isParticipating ? (
                <Button
                    onClick={handleParticipate}
                    disabled={loadingPart}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20"
                >
                    {loadingPart ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                    PARTICIPAR EN ESTE PROCESO
                </Button>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-green-800 font-bold mb-3 text-sm flex items-center justify-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Estás participando activamente
                    </p>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 font-bold" size="sm">
                        <Link href={`/dashboard/bidding/${adaptedTender.referencia_del_proceso}`}>
                            Ir al Panel de Gestión
                        </Link>
                    </Button>
                </div>
            )}

            {/* Secondary Action: Interest */}
            {!isParticipating && (
                <Button
                    onClick={handleToggleInterest}
                    disabled={loadingFav}
                    variant={isInterested ? "default" : "outline"}
                    className={`w-full font-bold shadow-sm ${isInterested ? "bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-400" : "text-gray-600 hover:text-primary hover:border-primary"}`}
                >
                    {loadingFav ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Star className={`h-4 w-4 mr-2 ${isInterested ? "fill-amber-900" : ""}`} />
                    )}
                    {isInterested ? "Marcado como Interés" : "Marcar Solo Interés"}
                </Button>
            )}

            {/* Notes Section - Only visible if Interested/Participating */}
            {isInterested && (
                <div className="bg-yellow-50/50 rounded-xl border border-yellow-100 p-4 transition-all duration-300">
                    <label className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2 block">
                        Mis Notas / Seguimiento
                    </label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Escribe aquí observaciones..."
                        className="bg-white border-yellow-200 text-sm mb-3 min-h-[100px] focus-visible:ring-yellow-400"
                    />
                    <div className="flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            {savingNotes ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                            Guardar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
