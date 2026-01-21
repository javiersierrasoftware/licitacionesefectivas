"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface StepModalityProps {
    selectedSectors: string[];
    onChange: (sectors: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const MODALITIES = [
    "Sector Público",
    "Entidades Descentralizadas",
    "Organismos Internacionales",
    "Sector Privado",
];

export function StepModality({ selectedSectors, onChange, onNext, onBack }: StepModalityProps) {

    const toggleSector = (sector: string) => {
        if (selectedSectors.includes(sector)) {
            onChange(selectedSectors.filter((s) => s !== sector));
        } else {
            onChange([...selectedSectors, sector]);
        }
    };

    const toggleAll = () => {
        if (selectedSectors.length === MODALITIES.length) {
            onChange([]);
        } else {
            onChange([...MODALITIES]);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
                <div onClick={toggleAll} className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedSectors.length === MODALITIES.length ? "bg-cyan-500 border-cyan-500 text-white" : "border-gray-300 bg-white"}`}>
                        {selectedSectors.length === MODALITIES.length && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">Seleccionar todas las modalidades</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MODALITIES.map((modality) => {
                        const isSelected = selectedSectors.includes(modality);
                        return (
                            <div
                                key={modality}
                                onClick={() => toggleSector(modality)}
                                className={`
                                    relative cursor-pointer rounded-full px-6 py-4 border-2 transition-all duration-200 text-center font-medium
                                    ${isSelected
                                        ? "bg-cyan-500 border-cyan-500 text-white shadow-md transform scale-[1.02]"
                                        : "bg-cyan-500/50 border-transparent text-white hover:bg-cyan-500/70"
                                    }
                                `}
                            >
                                {modality}
                                {isSelected && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-0.5">
                                        <Check className="w-3 h-3 text-cyan-600" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={onBack} className="rounded-full px-8">
                    ← Regresar
                </Button>
                <Button
                    onClick={onNext}
                    className="rounded-full px-8 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-cyan-600"
                    disabled={selectedSectors.length === 0}
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
