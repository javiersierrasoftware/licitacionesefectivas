"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, FileText, Upload } from "lucide-react";
import { updateProfile } from "@/lib/actions/profile";
import { addExperience, removeExperience } from "@/lib/actions/experience-actions";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export function DetailedInfoForm({ initialData, isPremium = false }: { initialData: any, isPremium?: boolean }) {
    const router = useRouter();
    // Ensure experiences list is never undefined
    const [experiences, setExperiences] = useState(initialData?.experiences || []);

    // Experience Form State
    const [expTitle, setExpTitle] = useState("");
    const [expDuration, setExpDuration] = useState("");
    const [expValue, setExpValue] = useState(""); // New: Contract Value
    const [expContractType, setExpContractType] = useState("Publica"); // New: Public/Private
    const [expTypes, setExpTypes] = useState("");

    const handleAddExperience = async () => {
        if (!expTitle || !expDuration || !expValue) return toast.error("Complete los campos de experiencia");

        const res = await addExperience({
            title: expTitle,
            durationMonths: expDuration,
            contractValue: expValue,
            contractType: expContractType,
            experienceTypes: [expTypes]
        });

        if (res.success) {
            toast.success("Experiencia agregada");
            setExpTitle("");
            setExpDuration("");
            setExpValue("");
            setExpContractType("Publica");
            setExpTypes("");
            if (res.experiences) setExperiences(res.experiences);
            router.refresh();
        } else {
            toast.error("Error al agregar experiencia");
        }
    };

    const handleRemoveExperience = async (id: string) => {
        if (confirm("¿Estás seguro?")) {
            const res = await removeExperience(id);
            if (res.success) {
                toast.success("Experiencia eliminada");
                if (res.experiences) setExperiences(res.experiences);
                router.refresh();
            }
        }
    }

    if (!isPremium) {
        // Premium logic placeholder
    }

    return (
        <div className="space-y-8">

            {/* 1. Legal & Typology */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle>Información Legal y Corporativa</CardTitle>
                    <CardDescription>Detalles registrados en Cámara de Comercio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form action={async (formData) => {
                        const res = await updateProfile(undefined, formData);
                        if (res === "Perfil actualizado correctamente.") {
                            toast.success("Información legal actualizada");
                        } else {
                            toast.error(res);
                        }
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Tipología de Empresa</Label>
                                <Select name="companyType" defaultValue={initialData?.companyType || "Pyme"}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Microempresa">Microempresa</SelectItem>
                                        <SelectItem value="Pequena">Pequeña Empresa</SelectItem>
                                        <SelectItem value="Mediana">Mediana Empresa</SelectItem>
                                        <SelectItem value="Grande">Gran Empresa</SelectItem>
                                        <SelectItem value="ESAL">Entidad Sin Ánimo de Lucro (ESAL)</SelectItem>
                                        <SelectItem value="UnionTemporal">Unión Temporal / Consorcio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Archivo Cámara de Comercio (Simulado)</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors text-center relative group">
                                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click para cargar PDF</span>
                                    <Input type="file" name="camaraComercioFileMock" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <Label>Actividades Declaradas</Label>
                                <Textarea
                                    name="actividadesCamara"
                                    placeholder="Describa las actividades económicas principales..."
                                    defaultValue={initialData?.actividadesCamara}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Cédula Representante Legal (Simulado)</Label>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors text-center relative group">
                                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click para cargar PDF</span>
                                    <Input type="file" name="cedulaFileMock" className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button type="submit">Actualizar Datos Legales</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2. Experience Section */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader>
                    <CardTitle>Experiencia Acreditada</CardTitle>
                    <CardDescription>Historial de contratos y certificaciones para licitaciones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Add New Experience */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                        <h4 className="text-sm font-bold text-gray-700">Agregar Nueva Experiencia</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label className="text-xs">Objeto del Contrato / Detalle</Label>
                                <Input
                                    value={expTitle}
                                    onChange={e => setExpTitle(e.target.value)}
                                    placeholder="Ej: Suministro de dotación..."
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Valor del Contrato (COP)</Label>
                                <Input
                                    type="number"
                                    value={expValue}
                                    onChange={e => setExpValue(e.target.value)}
                                    placeholder="Ej: 50000000"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Tipo de Contratación</Label>
                                <Select value={expContractType} onValueChange={setExpContractType}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Publica">Pública</SelectItem>
                                        <SelectItem value="Privada">Privada</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs">Tiempo Ejecución (Meses)</Label>
                                <Input
                                    type="number"
                                    value={expDuration}
                                    onChange={e => setExpDuration(e.target.value)}
                                    placeholder="Ej: 12"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Etiquetas (Opcional)</Label>
                                <Input
                                    value={expTypes}
                                    onChange={e => setExpTypes(e.target.value)}
                                    placeholder="Ej: Salud, Obra Civil"
                                />
                            </div>
                        </div>
                        <Button size="sm" onClick={handleAddExperience} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Experiencia
                        </Button>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                        {experiences.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No tienes experiencias registradas aún.
                            </p>
                        )}
                        {experiences.map((exp: any) => (
                            <div key={exp._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${exp.contractType === 'Publica' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-gray-900 text-sm line-clamp-1">{exp.title}</h5>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Badge variant={exp.contractType === 'Publica' ? 'default' : 'secondary'} className="text-[10px]">
                                                {exp.contractType || 'Publica'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] text-gray-600 bg-gray-50 border-gray-200">
                                                $ {new Intl.NumberFormat('es-CO').format(exp.contractValue || 0)}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] text-gray-500 bg-white">
                                                {exp.durationMonths} Meses
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveExperience(exp._id)} className="text-gray-400 hover:text-red-500 shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
