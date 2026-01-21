"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ExternalLink,
    Eye,
    Star,
    FolderPlus,
    MessageSquare,
    FileText,
    Share2,
    Copy,
} from "lucide-react";
import { SecopTender } from "@/lib/services/secop";
import { toggleFavorite } from "@/lib/actions/opportunities";
import React, { useState } from "react";

interface OpportunitiesTableProps {
    opportunities: SecopTender[];
    initialSavedIds?: Set<string>;
}

const FilterInput = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className="w-full mt-1 px-1 py-0.5 text-[9px] text-gray-700 bg-white/90 border border-white/20 rounded placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-white/50"
    />
);

export function OpportunitiesTable({ opportunities, initialSavedIds }: OpportunitiesTableProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    // Store saved IDs locally to support optimistic updates
    const [savedIds, setSavedIds] = useState<Set<string>>(initialSavedIds || new Set());

    // Column Filters State
    const [filters, setFilters] = useState({
        entidad: "",
        objeto: "",
        cuantia: "",
        modalidad: "",
        numero: "",
        estado: "",
        fecha: "",
        ubicacion: ""
    });

    const formatCurrency = (val: string) => {
        if (!val) return '$ 0';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(val));
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleToggleFavorite = async (tender: SecopTender) => {
        const id = tender.referencia_del_proceso;

        // Optimistic update
        const isCurrentlySaved = savedIds.has(id);
        const newSavedIds = new Set(savedIds);
        if (isCurrentlySaved) {
            newSavedIds.delete(id);
        } else {
            newSavedIds.add(id);
        }
        setSavedIds(newSavedIds); // Update local state immediately

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            await toggleFavorite(tender);
        } catch (error) {
            console.error("Failed to toggle favorite", error);
            // Revert on error
            setSavedIds(prev => {
                const reverted = new Set(prev);
                if (isCurrentlySaved) reverted.add(id);
                else reverted.delete(id);
                return reverted;
            });
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    // Filter Logic
    const filteredOpportunities = opportunities.filter(tender => {
        const matchEntidad = (tender.entidad || "").toLowerCase().includes(filters.entidad.toLowerCase());
        const matchObjeto = (tender.descripci_n_del_procedimiento || "").toLowerCase().includes(filters.objeto.toLowerCase());
        const matchModalidad = (tender.modalidad_de_contratacion || "").toLowerCase().includes(filters.modalidad.toLowerCase());
        const matchNumero = (tender.referencia_del_proceso || "").toLowerCase().includes(filters.numero.toLowerCase());

        // Custom logic for derived fields
        const estadoDisplay = tender.fase === 'Presentación de oferta' ? 'En borrador' : 'No aplica';
        const matchEstado = estadoDisplay.toLowerCase().includes(filters.estado.toLowerCase());

        const fechaDisplay = formatDate(tender.fecha_de_publicacion_del);
        const matchFecha = fechaDisplay.toLowerCase().includes(filters.fecha.toLowerCase());

        const ubicacionDisplay = `${tender.departamento_entidad} : ${tender.ciudad_entidad}`;
        const matchUbicacion = ubicacionDisplay.toLowerCase().includes(filters.ubicacion.toLowerCase());

        // For Cuantía, remove currency symbols/formatting for better search? Or search within formatted?
        // Let's search in formatted string for simplicity as that's what user sees
        const cuantiaDisplay = formatCurrency(tender.precio_base);
        // Also allow searching raw number
        const matchCuantia = cuantiaDisplay.includes(filters.cuantia) || (tender.precio_base || "").includes(filters.cuantia);

        return matchEntidad && matchObjeto && matchModalidad && matchNumero && matchEstado && matchFecha && matchUbicacion && matchCuantia;
    });



    return (
        <div className="rounded-xl border border-gray-100 bg-white shadow-premium overflow-hidden">
            <Table>
                <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-primary border-none">
                        <TableHead className="w-[50px] text-white font-bold h-auto py-3 text-center border-r border-[#009bb8]/30 align-top first:rounded-tl-xl">
                            <div className="mb-1">
                                <input type="checkbox" className="rounded border-white/50 text-accent focus:ring-0 cursor-pointer" />
                            </div>
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top">
                            Portal
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[120px]">
                            <div>Entidad</div>
                            <FilterInput value={filters.entidad} onChange={(v) => setFilters(p => ({ ...p, entidad: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center min-w-[300px] border-r border-[#009bb8]/30 align-top">
                            <div>Objeto</div>
                            <FilterInput value={filters.objeto} onChange={(v) => setFilters(p => ({ ...p, objeto: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[100px]">
                            <div>Cuantía</div>
                            <FilterInput value={filters.cuantia} onChange={(v) => setFilters(p => ({ ...p, cuantia: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 max-w-[120px] align-top min-w-[100px]">
                            <div>Modalidad</div>
                            <FilterInput value={filters.modalidad} onChange={(v) => setFilters(p => ({ ...p, modalidad: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[100px]">
                            <div>Número</div>
                            <FilterInput value={filters.numero} onChange={(v) => setFilters(p => ({ ...p, numero: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[100px]">
                            <div>Estado</div>
                            <FilterInput value={filters.estado} onChange={(v) => setFilters(p => ({ ...p, estado: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[100px]">
                            <div>F. pub</div>
                            <FilterInput value={filters.fecha} onChange={(v) => setFilters(p => ({ ...p, fecha: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[120px]">
                            <div>Ubicación</div>
                            <FilterInput value={filters.ubicacion} onChange={(v) => setFilters(p => ({ ...p, ubicacion: v }))} placeholder="Filtrar..." />
                        </TableHead>
                        <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center align-top last:rounded-tr-xl">
                            Contratista(s)
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredOpportunities.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={11} className="h-24 text-center">
                                No hay resultados con los filtros aplicados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredOpportunities.map((tender, index) => {
                            // URL handling
                            const processUrl = typeof tender.urlproceso === 'object' && tender.urlproceso !== null
                                ? (tender.urlproceso as any).url
                                : tender.urlproceso;

                            const isEven = index % 2 === 0;
                            const rowClass = "bg-white";
                            const isLoading = loadingMap[tender.referencia_del_proceso];

                            return (
                                <React.Fragment key={tender.referencia_del_proceso}>
                                    {/* Data Row */}
                                    <TableRow className={`border-none ring-1 ring-inset ring-transparent hover:ring-gray-200 transition-all duration-200 hover:bg-neutral hover:shadow-sm ${rowClass}`}>
                                        <TableCell className="text-center align-middle relative py-6 border-r border-gray-50 w-[50px]">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50 w-[60px]">
                                            <div className="flex justify-center">
                                                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                                    S2
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50 max-w-[150px]">
                                            <div className="font-bold text-[10px] uppercase text-gray-800 leading-tight mb-2 line-clamp-2">
                                                {tender.entidad}
                                            </div>
                                            <div className="text-primary text-[10px] cursor-pointer hover:underline flex items-center justify-center gap-1 font-bold">
                                                Ver análisis <span className="text-[8px]">›</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-middle py-6 border-r border-gray-50 px-6">
                                            <div className="uppercase font-bold text-[10px] text-gray-700 leading-relaxed text-center line-clamp-3" title={tender.descripci_n_del_procedimiento}>
                                                {tender.descripci_n_del_procedimiento}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <div className="text-[11px] font-bold text-secondary whitespace-nowrap">
                                                {formatCurrency(tender.precio_base)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <div className="text-[10px] leading-tight text-gray-600 font-medium">
                                                {tender.modalidad_de_contratacion || "Solicitud de información"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <div className="text-[10px] font-bold text-gray-800 whitespace-nowrap">
                                                {tender.referencia_del_proceso}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-100">
                                                {tender.fase === 'Presentación de oferta' ? 'En borrador' : 'No aplica'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <div className="text-[10px] text-gray-600 font-medium">
                                                {formatDate(tender.fecha_de_publicacion_del)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6 border-r border-gray-50">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1 mb-2 text-gray-600 text-[10px] font-medium leading-tight">
                                                    <span className="text-center">{tender.departamento_entidad} : {tender.ciudad_entidad}</span>
                                                </div>
                                                <div className="text-primary cursor-pointer hover:underline text-[10px] flex items-center gap-1 font-bold">
                                                    Ver análisis <span className="text-[8px]">›</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-middle py-6">
                                            <span className="text-[10px] text-gray-400 italic">
                                                No aplica adjudicación
                                            </span>
                                        </TableCell>
                                    </TableRow>

                                    {/* Action Toolbar Row */}
                                    <TableRow className={`border-b border-gray-100 hover:bg-neutral ${rowClass}`}>
                                        <TableCell colSpan={11} className="py-2 px-6">
                                            <div className="flex items-center gap-8 pl-14 opacity-80 hover:opacity-100 transition-opacity">
                                                {/* View Documents Button */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5 px-4 text-[11px] font-bold bg-white"
                                                    asChild
                                                >
                                                    <a href={processUrl} target="_blank" rel="noopener noreferrer">
                                                        <FileText className="h-3 w-3 mr-2" />
                                                        Ver documentos <span className="ml-1 text-[9px]">›</span>
                                                    </a>
                                                </Button>

                                                {/* Action Icons */}
                                                <div className="flex items-center gap-5 text-gray-400">
                                                    <button
                                                        onClick={() => handleToggleFavorite(tender)}
                                                        disabled={isLoading}
                                                        className={`hover:text-amber-400 transition-colors ${isLoading ? 'opacity-50' : ''}`}
                                                        title={savedIds.has(tender.referencia_del_proceso) ? "Quitar de favoritos" : "Agregar a favoritos"}
                                                    >
                                                        <Star
                                                            className={`h-4 w-4 ${savedIds.has(tender.referencia_del_proceso)
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-400 hover:fill-amber-400"
                                                                } ${isLoading ? 'animate-pulse' : ''}`}
                                                        />
                                                    </button>
                                                    <button className="hover:text-[#00B4D8] transition-colors" title="Ver detalle">
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button className="hover:text-indigo-500 transition-colors" title="Carpeta">
                                                        <FolderPlus className="h-4 w-4" />
                                                    </button>
                                                    <a href={processUrl} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 transition-colors" title="Ir a la fuente (SECOP II)">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <button className="hover:text-blue-500 transition-colors" title="Compartir">
                                                        <Share2 className="h-4 w-4" />
                                                    </button>
                                                    <button className="hover:text-gray-600 transition-colors" title="Copiar">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
