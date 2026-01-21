"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Check } from "lucide-react";

interface StepLocationProps {
    selectedDepartments: string[];
    onChange: (departments: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const DEPARTMENTS = [
    "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá",
    "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
    "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
    "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
    "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
];

export function StepLocation({ selectedDepartments, onChange, onNext, onBack }: StepLocationProps) {
    const [query, setQuery] = useState("");

    const filteredDepartments = DEPARTMENTS.filter(d =>
        d.toLowerCase().includes(query.toLowerCase())
    );

    const toggleDepartment = (dept: string) => {
        if (selectedDepartments.includes(dept)) {
            onChange(selectedDepartments.filter((d) => d !== dept));
        } else {
            onChange([...selectedDepartments, dept]);
        }
    };

    const toggleAll = () => {
        if (selectedDepartments.length === DEPARTMENTS.length) {
            onChange([]);
        } else {
            onChange([...DEPARTMENTS]);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Busca por ubicación"
                        className="pl-9 rounded-full bg-white border-gray-200"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div onClick={toggleAll} className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedDepartments.length === DEPARTMENTS.length ? "bg-cyan-500 border-cyan-500 text-white" : "border-gray-300 bg-white"}`}>
                        {selectedDepartments.length === DEPARTMENTS.length && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600">Seleccionar todo el país - Colombia</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
                    {filteredDepartments.map((dept) => {
                        const isSelected = selectedDepartments.includes(dept);
                        return (
                            <div
                                key={dept}
                                onClick={() => toggleDepartment(dept)}
                                className={`
                                    relative cursor-pointer rounded-full px-4 py-3 border transition-all duration-200 flex items-center justify-between group
                                    ${isSelected
                                        ? "bg-cyan-500 border-cyan-500 text-white shadow-sm"
                                        : "bg-white border-gray-200 text-gray-700 hover:border-cyan-300"
                                    }
                                `}
                            >
                                <span className="font-medium">{dept}</span>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
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
                    disabled={selectedDepartments.length === 0}
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
