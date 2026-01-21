"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Monitor, Briefcase, Calculator, Shirt, Utensils, Construction } from "lucide-react";
import { searchUnspscCodes, getUnspscName } from "@/lib/data/unspsc-codes";

interface StepActivityProps {
    selectedCodes: string[];
    onChange: (codes: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const CATEGORIES = [
    { name: "Tecnología", icon: Monitor, query: "software" },
    { name: "Consultoría", icon: Briefcase, query: "consultoría" },
    { name: "Financiero", icon: Calculator, query: "bancarios" },
    { name: "Dotación", icon: Shirt, query: "ropa" },
    { name: "Alimentos", icon: Utensils, query: "alimentos" },
    { name: "Construcción", icon: Construction, query: "construcción" },
];

export function StepActivity({ selectedCodes, onChange, onNext, onBack }: StepActivityProps) {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<{ code: string; name: string }[]>([]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length > 2) {
            setSearchResults(searchUnspscCodes(value));
        } else {
            setSearchResults([]);
        }
    };

    const addCode = (code: string) => {
        if (!selectedCodes.includes(code)) {
            onChange([...selectedCodes, code]);
        }
        setQuery("");
        setSearchResults([]);
    };

    const removeCode = (code: string) => {
        onChange(selectedCodes.filter((c) => c !== code));
    };

    const handleCategoryClick = (catQuery: string) => {
        setQuery(catQuery);
        setSearchResults(searchUnspscCodes(catQuery));
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="space-y-2">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Busca por actividad económica o UNSPSC"
                        className="pl-9 rounded-full bg-white border-gray-200"
                        value={query}
                        onChange={handleSearch}
                    />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-60 overflow-y-auto">
                        {searchResults.map((item) => (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => addCode(item.code)}
                                className="w-full text-left px-4 py-3 hover:bg-cyan-50 text-sm flex justify-between items-center group border-b border-gray-50 last:border-0"
                            >
                                <span>
                                    <span className="font-mono font-semibold text-cyan-600 mr-2">{item.code}</span>
                                    {item.name}
                                </span>
                                <Plus className="h-4 w-4 text-gray-400 group-hover:text-cyan-600" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Visual Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.query)}
                        className="flex items-center space-x-3 p-3 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition-all text-left bg-white shadow-sm"
                    >
                        <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                            <cat.icon className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Selected Codes */}
            {selectedCodes.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Códigos Seleccionados</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedCodes.map((code) => (
                            <div
                                key={code}
                                className="flex items-center space-x-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800"
                            >
                                <span>{code} - {getUnspscName(code)}</span>
                                <button
                                    onClick={() => removeCode(code)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-cyan-200 text-cyan-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={onBack} className="rounded-full px-8">
                    ← Regresar
                </Button>
                <Button
                    onClick={onNext}
                    className="rounded-full px-8 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-cyan-600"
                    disabled={selectedCodes.length === 0}
                >
                    Siguiente →
                </Button>
            </div>
        </div>
    );
}
