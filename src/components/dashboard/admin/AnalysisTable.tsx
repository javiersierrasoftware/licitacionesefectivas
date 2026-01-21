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
    Share2,
    Copy,
    Calendar,
    Mail,
    UserCircle,
    Building2,
    MapPin,
    DollarSign
} from "lucide-react";
import React, { useState } from "react";
import { getUnspscName } from "@/lib/data/unspsc-codes";

export interface AnalysisInterest {
    id: string;
    title: string;
    entidad: string;
    reference: string;
    url: string;
    modality: string;
    price: string;
    deadline?: string;
    location: string;
}

export interface AnalysisCompany {
    id: string;
    companyName: string;
    legalRepresentative: string;
    email: string;
    creationDate: string;
    yearsExperience: string;
    unspscCodes: string[];
    interests: AnalysisInterest[];
}

interface AnalysisTableProps {
    data: AnalysisCompany[];
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

export function AnalysisTable({ data }: AnalysisTableProps) {
    // Filter State
    const [filters, setFilters] = useState({
        empresa: "",
        representante: "",
        actividades: "",
        intereses: ""
    });

    // Formatting helpers
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatCurrency = (val?: string) => {
        if (!val || val === '0') return "N/A";
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(val));
    };

    // Filter Logic
    const filteredData = data.filter(item => {
        const matchEmpresa = (item.companyName || "").toLowerCase().includes(filters.empresa.toLowerCase());
        const matchRep = ((item.legalRepresentative || "") + (item.email || "")).toLowerCase().includes(filters.representante.toLowerCase());

        // Search in codes or descriptions
        const codesStr = item.unspscCodes.map(c => `${c} ${getUnspscName(c)}`).join(" ").toLowerCase();
        const matchActividades = codesStr.includes(filters.actividades.toLowerCase());

        // Search in interests (title, entity, modality, location)
        const interestsStr = item.interests.map(i => `${i.title} ${i.entidad} ${i.modality} ${i.location}`).join(" ").toLowerCase();
        const matchIntereses = interestsStr.includes(filters.intereses.toLowerCase());

        return matchEmpresa && matchRep && matchActividades && matchIntereses;
    });

    return (
        <div className="rounded-xl border border-gray-100 bg-white shadow-premium overflow-hidden flex flex-col h-full">
            <div className="flex-1 overflow-auto relative">
                <Table>
                    <TableHeader className="bg-primary sticky top-0 z-20">
                        <TableRow className="hover:bg-primary border-none">
                            <TableHead className="w-[50px] text-white font-bold h-auto py-3 text-center border-r border-[#009bb8]/30 align-top first:rounded-tl-xl bg-primary">
                                <div className="mb-1">
                                    <input type="checkbox" className="rounded border-white/50 text-accent focus:ring-0 cursor-pointer" />
                                </div>
                            </TableHead>

                            <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[200px] bg-primary">
                                <div>Empresa / Info</div>
                                <FilterInput value={filters.empresa} onChange={(v) => setFilters(p => ({ ...p, empresa: v }))} placeholder="Buscar empresa..." />
                            </TableHead>

                            <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[150px] bg-primary">
                                <div>Representante</div>
                                <FilterInput value={filters.representante} onChange={(v) => setFilters(p => ({ ...p, representante: v }))} placeholder="Nombre / Email..." />
                            </TableHead>

                            <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center border-r border-[#009bb8]/30 align-top min-w-[200px] bg-primary">
                                <div>Actividades (UNSPSC)</div>
                                <FilterInput value={filters.actividades} onChange={(v) => setFilters(p => ({ ...p, actividades: v }))} placeholder="Filtrar códigos..." />
                            </TableHead>

                            <TableHead className="text-white font-bold h-auto py-3 text-[11px] uppercase tracking-wider text-center align-top min-w-[400px] last:rounded-tr-xl bg-primary">
                                <div>Procesos / Vencimiento</div>
                                <FilterInput value={filters.intereses} onChange={(v) => setFilters(p => ({ ...p, intereses: v }))} placeholder="Buscar en procesos..." />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    No hay resultados con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => {
                                const rowClass = "bg-white";
                                return (
                                    <TableRow key={item.id} className={`border-b border-gray-100 hover:bg-neutral hover:shadow-sm transition-all duration-200 ${rowClass}`}>
                                        {/* Checkbox */}
                                        <TableCell className="text-center align-top py-4 border-r border-gray-50 w-[50px]">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer mt-1" />
                                        </TableCell>

                                        {/* Empresa Info */}
                                        <TableCell className="align-top py-4 border-r border-gray-50 max-w-[200px]">
                                            <div className="flex flex-col gap-2">
                                                <div className="font-bold text-[11px] uppercase text-gray-800 leading-tight">
                                                    {item.companyName}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">
                                                        {item.yearsExperience}
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 flex items-center">
                                                        <Calendar className="h-3 w-3 mr-1" />
                                                        {formatDate(item.creationDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Representante */}
                                        <TableCell className="align-top py-4 border-r border-gray-50 max-w-[150px]">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <UserCircle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    <span className="text-[10px] font-medium text-gray-700 uppercase line-clamp-2">
                                                        {item.legalRepresentative || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                    <span className="text-[10px] text-gray-500 truncate max-w-full" title={item.email}>
                                                        {item.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Actividades */}
                                        <TableCell className="align-top py-4 border-r border-gray-50 max-w-[200px]">
                                            <div className="flex flex-wrap gap-1">
                                                {item.unspscCodes.length > 0 ? (
                                                    item.unspscCodes.map((c) => (
                                                        <Badge key={c} variant="secondary" className="text-[9px] px-1.5 py-0 bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 font-normal">
                                                            {c}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">Sin códigos</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Intereses Grouped */}
                                        <TableCell className="align-top py-4 px-4 min-w-[400px]">
                                            {item.interests.length > 0 ? (
                                                <div className="space-y-3">
                                                    {item.interests.map((interest, idx) => (
                                                        <div key={interest.id} className="bg-gray-50/50 rounded-lg border border-gray-100 p-3 hover:border-primary/20 hover:shadow-sm transition-all group relative">
                                                            <div className="flex justify-between items-center gap-3">
                                                                {/* Main Info */}
                                                                <div className="flex-1 min-w-0 space-y-1.5">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <Badge variant="outline" className="text-[9px] h-4 py-0 border-blue-200 text-blue-700 bg-blue-50/30 whitespace-nowrap font-normal">
                                                                            {interest.modality}
                                                                        </Badge>
                                                                        <span className="text-[9px] font-bold text-gray-700 uppercase line-clamp-1" title={interest.entidad}>
                                                                            {interest.entidad}
                                                                        </span>
                                                                    </div>

                                                                    <a href={interest.url} target="_blank" rel="noopener noreferrer" className="block text-[10px] font-semibold text-gray-800 leading-snug hover:text-primary hover:underline line-clamp-2 pr-6" title={interest.title}>
                                                                        {interest.title}
                                                                    </a>

                                                                    <div className="flex items-center gap-3 text-[9px] text-gray-500">
                                                                        <span className="font-bold text-secondary bg-green-50 px-1.5 py-0.5 rounded">{formatCurrency(interest.price)}</span>
                                                                        <span className="flex items-center truncate max-w-[120px]" title={interest.location}>
                                                                            <MapPin className="h-2.5 w-2.5 mr-0.5 text-gray-400" />
                                                                            {interest.location}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Deadline "Column" */}
                                                                <div className="w-[85px] shrink-0 border-l border-gray-100 pl-3 flex flex-col items-end justify-center text-right">
                                                                    {interest.deadline ? (
                                                                        <>
                                                                            <span className="text-[10px] font-bold text-gray-700">{formatDate(interest.deadline)}</span>
                                                                            <span className="text-[8px] text-red-500 font-medium flex items-center mt-0.5">
                                                                                Vence <Calendar className="h-2 w-2 ml-1" />
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-[9px] text-gray-400 italic">--</span>
                                                                    )}
                                                                </div>

                                                                {/* Floating Link Action */}
                                                                <a
                                                                    href={interest.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="absolute top-2 right-2 text-gray-300 hover:text-primary p-1 hover:bg-primary/5 rounded transition-colors"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 bg-gray-50/30 rounded border border-dashed border-gray-100">
                                                    <span className="text-[10px] text-gray-400">Sin intereses registrados</span>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
