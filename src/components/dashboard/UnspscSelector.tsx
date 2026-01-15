"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Plus } from "lucide-react";
import { searchUnspscCodes, getUnspscName } from "@/lib/data/unspsc-codes";

interface UnspscSelectorProps {
    initialCodes?: string[];
    name: string; // The form field name for submission
}

export function UnspscSelector({ initialCodes = [], name }: UnspscSelectorProps) {
    const [selectedCodes, setSelectedCodes] = useState<string[]>(initialCodes);
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
            setSelectedCodes([...selectedCodes, code]);
        }
        setQuery("");
        setSearchResults([]);
    };

    const removeCode = (code: string) => {
        setSelectedCodes(selectedCodes.filter((c) => c !== code));
    };

    return (
        <div className="space-y-4">
            {/* Hidden input to submit the actual array of codes as a comma-separated string 
          (since native forms don't handle arrays well without complex naming) 
          OR we can handle this in the parent form submission logic.
          Let's use a hidden input with JSON string or repeated fields.
      */}
            <input type="hidden" name={name} value={JSON.stringify(selectedCodes)} />

            <div className="space-y-2">
                <Label>Buscar Códigos o Categorías (UNSPSC)</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ej: Software, Aseo, Vigilancia, 80101500..."
                        className="pl-9"
                        value={query}
                        onChange={handleSearch}
                    />
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full max-w-md bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        {searchResults.map((item) => (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => addCode(item.code)}
                                className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm flex justify-between items-center group"
                            >
                                <span>
                                    <span className="font-mono font-semibold text-blue-600 mr-2">{item.code}</span>
                                    {item.name}
                                </span>
                                <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Codes List */}
            <div className="space-y-2">
                <Label>Códigos Seleccionados ({selectedCodes.length})</Label>
                {selectedCodes.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                        No has seleccionado ningún código. Agrega al menos uno para recibir ofertas relevantes.
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {selectedCodes.map((code) => {
                        const name = getUnspscName(code);
                        return (
                            <div
                                key={code}
                                className="flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                            >
                                <span>{code} - {name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeCode(code)}
                                    className="ml-1 rounded-full p-0.5 hover:bg-blue-200 text-blue-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
