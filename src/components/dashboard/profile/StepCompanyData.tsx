"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, FileText, User, Calendar } from "lucide-react";
import { WizardData } from "./WizardParams";

interface StepCompanyDataProps {
    data: WizardData;
    onChange: (data: Partial<WizardData>) => void;
    onNext: () => void;
}

export function StepCompanyData({ data, onChange, onNext }: StepCompanyDataProps) {
    const isValid = data.nit && data.legalRepresentative && data.creationDate;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos de la Empresa</h2>
                <p className="text-muted-foreground">Ingresa la información legal básica de tu organización.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* NIT */}
                <div className="space-y-3">
                    <Label htmlFor="nit" className="text-gray-700 font-medium">NIT / Identificación Tributaria</Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="nit"
                            placeholder="Ej. 900.123.456-7"
                            className="pl-10 rounded-xl bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                            value={data.nit || ""}
                            onChange={(e) => onChange({ nit: e.target.value })}
                        />
                    </div>
                </div>

                {/* Legal Representative */}
                <div className="space-y-3">
                    <Label htmlFor="legalRep" className="text-gray-700 font-medium">Representante Legal</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="legalRep"
                            placeholder="Nombre completo"
                            className="pl-10 rounded-xl bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                            value={data.legalRepresentative || ""}
                            onChange={(e) => onChange({ legalRepresentative: e.target.value })}
                        />
                    </div>
                </div>

                {/* Creation Date */}
                <div className="space-y-3">
                    <Label htmlFor="creationDate" className="text-gray-700 font-medium">Fecha de Creación</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="creationDate"
                            type="date"
                            className="pl-10 rounded-xl bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                            value={data.creationDate || ""}
                            onChange={(e) => onChange({ creationDate: e.target.value })}
                        />
                    </div>
                </div>

                {/* RUT File Upload (Mock) */}
                <div className="space-y-3">
                    <Label htmlFor="rut" className="text-gray-700 font-medium">Cargue de RUT (PDF)</Label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            id="rut"
                            type="file"
                            accept=".pdf"
                            className="pl-10 rounded-xl bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 file:bg-cyan-50 file:text-cyan-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:text-sm file:font-semibold hover:file:bg-cyan-100"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // For now just storing the name as a placeholder since we don't have file storage set up in this plan
                                    onChange({ rutFile: file.name });
                                }
                            }}
                        />
                        {data.rutFile && (
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                ✓ Archivo seleccionado: {data.rutFile}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 max-w-4xl mx-auto">
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="rounded-full px-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-200"
                >
                    Continuar →
                </Button>
            </div>
        </div>
    );
}
