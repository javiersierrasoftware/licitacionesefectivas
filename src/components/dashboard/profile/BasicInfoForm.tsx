"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfile } from "@/lib/actions/profile";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { COLOMBIA_LOCATIONS } from "@/lib/constants/colombia-locations";

export function BasicInfoForm({ initialData, user }: { initialData: any, user: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial state setup
    const initialDept = initialData?.departments?.[0] || "";
    const initialCity = initialData?.city ? initialData.city.trim() : "";

    const [selectedDept, setSelectedDept] = useState<string>(initialDept);
    const [selectedCity, setSelectedCity] = useState<string>(initialCity);

    // Prepare initial state mapping for other fields
    const defaultData = {
        name: user.name || "",
        companyName: initialData?.companyName || "",
        nit: initialData?.nit || "",
        personType: initialData?.personType || "Juridica",
        legalRepresentative: initialData?.legalRepresentative || "",
        address: initialData?.address || "",
        phone: initialData?.phone || "",
        creationDate: initialData?.creationDate ? new Date(initialData.creationDate).toISOString().split('T')[0] : "",
    };

    const handleDeptChange = (val: string) => {
        setSelectedDept(val);
        setSelectedCity(""); // Reset city when dept changes
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        // Robustly handle controlled inputs
        if (selectedDept) {
            formData.set("departments", JSON.stringify([selectedDept]));
            // Also set the legacy/form-friendly field just in case - though backend uses 'departments'
            formData.set("departamento_hq", selectedDept);
        }

        if (selectedCity) {
            formData.set("ciudad", selectedCity);
        } else {
            // If strictly needed, allow clearing?
            formData.set("ciudad", "");
        }

        const result = await updateProfile(undefined, formData);

        if (result === "Perfil actualizado correctamente.") {
            toast.success("Información básica guardada correctamente");
        } else {
            toast.error(result);
        }
        setIsSubmitting(false);
    };

    const cities = selectedDept ? COLOMBIA_LOCATIONS[selectedDept] || [] : [];

    // Ensure the current selected city is always an option to prevent it from being hidden
    // This solves the issue if the saved city name doesn't perfectly match the list (e.g. spelling/casing diffs)
    let cityOptions = [...cities].sort();
    if (selectedCity && !cityOptions.includes(selectedCity)) {
        cityOptions = [selectedCity, ...cityOptions];
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa / Razón Social</Label>
                    <Input id="companyName" name="companyName" defaultValue={defaultData.companyName} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nit">NIT / Documento</Label>
                    <Input id="nit" name="nit" defaultValue={defaultData.nit} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="personType">Tipo de Persona</Label>
                    <Select name="personType" defaultValue={defaultData.personType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent style={{ zIndex: 99999 }}>
                            <SelectItem value="Juridica">Persona Jurídica</SelectItem>
                            <SelectItem value="Natural">Persona Natural</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="legalRepresentative">Representante Legal</Label>
                    <Input id="legalRepresentative" name="legalRepresentative" defaultValue={defaultData.legalRepresentative} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="creationDate">Fecha de Constitución</Label>
                    <Input id="creationDate" name="creationDate" type="date" defaultValue={defaultData.creationDate} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input id="phone" name="phone" defaultValue={defaultData.phone} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección de Radicación</Label>
                <Input id="address" name="address" defaultValue={defaultData.address} placeholder="Dirección completa" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento Principal</Label>
                    <Select
                        name="departamento_hq"
                        value={selectedDept}
                        onValueChange={handleDeptChange}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Seleccione Departamento" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]" style={{ zIndex: 99999 }}>
                            {Object.keys(COLOMBIA_LOCATIONS).sort().map(dept => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">Ubicación de la sede principal.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad / Municipio</Label>
                    <Select
                        name="ciudad"
                        value={selectedCity}
                        onValueChange={setSelectedCity}
                        disabled={!selectedDept}
                    >
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder={selectedDept ? "Seleccione Ciudad..." : "Primero elija Dpto"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]" style={{ zIndex: 99999 }}>
                            {cityOptions.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    );
}
