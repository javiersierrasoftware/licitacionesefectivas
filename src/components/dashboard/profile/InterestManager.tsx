"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, Settings, Trash2, Bell, BellOff, MapPin, Search, Check, ChevronsUpDown, X } from "lucide-react";
import { createInterestProfile, deleteInterestProfile, updateInterestProfile } from "@/lib/actions/interest-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UNSPSC_CATEGORIES, PROCUREMENT_MODALITIES } from "@/lib/constants/unspsc-categories";
import { COLOMBIA_LOCATIONS } from "@/lib/constants/colombia-locations";

// Helper for Categorized Select
function CategorizedMultiSelect({
    title,
    categories,
    selectedValues,
    onChange
}: {
    title: string,
    categories: { id: string, name: string, codes: { code: string, label: string }[] }[],
    selectedValues: string[],
    onChange: (values: string[]) => void
}) {
    const [open, setOpen] = useState(false);

    const toggleSelection = (code: string) => {
        if (selectedValues.includes(code)) {
            onChange(selectedValues.filter(v => v !== code));
        } else {
            onChange([...selectedValues, code]);
        }
    };

    const toggleCategory = (catId: string, catCodes: string[]) => {
        const allSelected = catCodes.every(c => selectedValues.includes(c));
        if (allSelected) {
            // Deselect all
            onChange(selectedValues.filter(v => !catCodes.includes(v)));
        } else {
            // Select all (merge unique)
            const newValues = new Set([...selectedValues, ...catCodes]);
            onChange(Array.from(newValues));
        }
    };

    // Flatten for badges
    const getLabel = (code: string) => {
        for (const cat of categories) {
            const found = cat.codes.find(c => c.code === code);
            if (found) return `${found.code} - ${found.label}`;
        }
        return code;
    };

    return (
        <div className="space-y-2">
            <Label>{title}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[44px] px-3 py-2 text-left bg-white"
                    >
                        <div className="flex flex-wrap gap-1">
                            {selectedValues.length === 0 && <span className="text-muted-foreground mr-auto">{title}</span>}
                            {selectedValues.length > 0 && selectedValues.length <= 5 && (
                                selectedValues.map(val => (
                                    <Badge key={val} variant="secondary" className="mr-1 text-[10px] font-normal">
                                        {val}
                                    </Badge>
                                ))
                            )}
                            {selectedValues.length > 5 && (
                                <Badge variant="secondary" className="mr-1">
                                    {selectedValues.length} seleccionados
                                </Badge>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={`Buscar en ${title}...`} />
                        <CommandList>
                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                            <ScrollArea className="h-[300px]">
                                {categories.map((group) => {
                                    const catCodeIds = group.codes.map(c => c.code);
                                    const isAllCatSelected = catCodeIds.every(c => selectedValues.includes(c));
                                    const isSomeCatSelected = catCodeIds.some(c => selectedValues.includes(c));

                                    return (
                                        <CommandGroup key={group.id} heading={
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors py-1" onClick={() => toggleCategory(group.id, catCodeIds)}>
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isAllCatSelected ? "bg-primary text-primary-foreground" :
                                                        isSomeCatSelected ? "bg-primary/20 text-primary" : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <Check className={cn("h-3 w-3")} />
                                                </div>
                                                <span className="font-bold text-gray-800">{group.name}</span>
                                            </div>
                                        }>
                                            {group.codes.map((item) => (
                                                <CommandItem
                                                    key={item.code}
                                                    value={`${item.code} ${item.label}`}
                                                    onSelect={() => toggleSelection(item.code)}
                                                    className="pl-8"
                                                >
                                                    <div
                                                        className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            selectedValues.includes(item.code)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "opacity-50 [&_svg]:invisible"
                                                        )}
                                                    >
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    <span className="text-muted-foreground mr-2 font-mono text-xs">{item.code}</span>
                                                    <span className="truncate" title={item.label}>{item.label}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    );
                                })}
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected Chips */}
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-h-[100px] overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                    {selectedValues.map(val => (
                        <Badge key={val} variant="outline" className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer pr-1 transition-colors" onClick={() => toggleSelection(val)}>
                            {getLabel(val)}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    ))}
                    <button onClick={() => onChange([])} className="text-xs text-red-500 hover:underline px-2">Borrar Todo</button>
                </div>
            )}
        </div>
    );
}

// Simple MultiSelect for Location/Modalities
function SimpleMultiSelect({
    title,
    options,
    selectedValues,
    onChange
}: {
    title: string,
    options: string[],
    selectedValues: string[],
    onChange: (values: string[]) => void
}) {
    const [open, setOpen] = useState(false);

    const toggleSelection = (val: string) => {
        if (selectedValues.includes(val)) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange([...selectedValues, val]);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{title}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[44px] bg-white"
                    >
                        <div className="flex flex-wrap gap-1 text-left">
                            {selectedValues.length === 0 && <span className="text-muted-foreground">{title}</span>}
                            {selectedValues.length > 0 && selectedValues.length <= 3 && (
                                selectedValues.map(val => (
                                    <Badge key={val} variant="secondary" className="mr-1 font-normal">
                                        {val}
                                    </Badge>
                                ))
                            )}
                            {selectedValues.length > 3 && (
                                <Badge variant="secondary" className="mr-1">
                                    {selectedValues.length} seleccionados
                                </Badge>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder={`Buscar ${title}...`} />
                        <CommandList>
                            <CommandEmpty>No encontrado.</CommandEmpty>
                            <ScrollArea className="h-[200px]">
                                {options.map((opt) => (
                                    <CommandItem
                                        key={opt}
                                        value={opt}
                                        onSelect={() => toggleSelection(opt)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                selectedValues.includes(opt)
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        {opt}
                                    </CommandItem>
                                ))}
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}


export function InterestManager({ initialProfiles, plan = 'basic' }: { initialProfiles: any[], plan?: string }) {
    const router = useRouter();
    const [profiles, setProfiles] = useState(initialProfiles);
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        unspscCodes: [] as string[],
        modalities: [] as string[],
        departments: [] as string[],
        minValue: "",
        maxValue: "",
        historyStart: "",
        emailNotification: true
    });

    const canCreate = plan === 'basic' ? profiles.length < 1 : true;
    const departmentOptions = Object.keys(COLOMBIA_LOCATIONS).sort();

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            unspscCodes: [],
            modalities: [],
            departments: [],
            minValue: "",
            maxValue: "",
            historyStart: "",
            emailNotification: true
        });
    }

    const openEdit = (profile: any) => {
        setEditingId(profile._id);
        setFormData({
            name: profile.name,
            unspscCodes: profile.unspscCodes || [],
            modalities: profile.modalities || [],
            departments: profile.departments || [],
            minValue: profile.minValue || "",
            maxValue: profile.maxValue || "",
            historyStart: profile.historyStart ? new Date(profile.historyStart).toISOString().split('T')[0] : "",
            emailNotification: profile.emailNotification,
            isActive: profile.isActive !== undefined ? profile.isActive : true
        });
        setIsOpen(true);
    };

    const handleCreateOrUpdate = async () => {
        if (!formData.name) return toast.error("El nombre del perfil es obligatorio");
        if (formData.unspscCodes.length === 0) return toast.error("Debe seleccionar al menos un código UNSPSC");

        const payload = {
            name: formData.name,
            unspscCodes: formData.unspscCodes,
            modalities: formData.modalities,
            departments: formData.departments,
            minValue: formData.minValue ? Number(formData.minValue) : undefined,
            maxValue: formData.maxValue ? Number(formData.maxValue) : undefined,
            historyStart: formData.historyStart ? new Date(formData.historyStart) : undefined,
            emailNotification: formData.emailNotification,
            isActive: formData.isActive
        };

        if (editingId) {
            const res = await updateInterestProfile(editingId, payload);
            if (res.success) {
                toast.success("Perfil actualizado");
                setProfiles(profiles.map(p => p._id === editingId ? { ...p, ...payload, _id: editingId } : p));
                setIsOpen(false);
                resetForm();
                router.refresh();
            } else {
                toast.error(res.error || "Error actualizando perfil");
            }
        } else {
            const res = await createInterestProfile(payload);
            if (res.success) {
                toast.success("Perfil de interés creado");
                setProfiles([res.profile, ...profiles]);
                setIsOpen(false);
                resetForm();
                router.refresh();
            } else {
                toast.error(res.error || "Error al crear perfil");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Eliminar este perfil de interés?")) {
            const res = await deleteInterestProfile(id);
            if (res.success) {
                setProfiles(profiles.filter(p => p._id !== id));
                toast.success("Perfil eliminado");
                router.refresh();
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Perfiles de Interés</h3>
                    <p className="text-sm text-gray-500">Configura múltiples criterios de búsqueda automática.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button disabled={!canCreate && !editingId}>
                            <Plus className="h-4 w-4 mr-2" />
                            {editingId ? "Editar" : "Nuevo Perfil"}
                        </Button>
                    </DialogTrigger>
                    {!canCreate && !editingId && <p className="text-xs text-red-500 text-right mt-1">Límite alcanzado (Plan Básico)</p>}

                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Editar Perfil" : "Crear Nuevo Perfil"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label>Nombre del Perfil</Label>
                                <Input
                                    placeholder="Ej: Licitaciones de Obra Civil en Antioquia"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <Separator />
                            <h4 className="text-sm font-semibold text-gray-700">Filtros Avanzados</h4>

                            {/* Enhanced UNSPSC Selector */}
                            <CategorizedMultiSelect
                                title="Códigos UNSPSC (Bienes y Servicios)"
                                categories={UNSPSC_CATEGORIES}
                                selectedValues={formData.unspscCodes}
                                onChange={(vals) => setFormData({ ...formData, unspscCodes: vals })}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <SimpleMultiSelect
                                    title="Departamentos"
                                    options={departmentOptions}
                                    selectedValues={formData.departments}
                                    onChange={(vals) => setFormData({ ...formData, departments: vals })}
                                />

                                <SimpleMultiSelect
                                    title="Modalidades de Contratación"
                                    options={PROCUREMENT_MODALITIES}
                                    selectedValues={formData.modalities}
                                    onChange={(vals) => setFormData({ ...formData, modalities: vals })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Valor Mínimo (COP)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={formData.minValue}
                                        onChange={e => setFormData({ ...formData, minValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor Máximo</Label>
                                    <Input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={formData.maxValue}
                                        onChange={e => setFormData({ ...formData, maxValue: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Publicado Desde</Label>
                                    <Input
                                        type="date"
                                        value={formData.historyStart}
                                        onChange={e => setFormData({ ...formData, historyStart: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Estado del Perfil</Label>
                                        <p className="text-xs text-gray-500">Activa o pausa este perfil de búsqueda.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-medium", formData.isActive ? "text-green-600" : "text-gray-500")}>
                                            {formData.isActive ? "Activo" : "Pausado"}
                                        </span>
                                        <Switch
                                            checked={formData.isActive}
                                            onCheckedChange={c => setFormData({ ...formData, isActive: c })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border border-gray-100">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Notificaciones por Correo</Label>
                                        <p className="text-xs text-gray-500">Recibe alertas diarias cuando aparezcan nuevas oportunidades.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-medium", formData.emailNotification ? "text-blue-600" : "text-gray-500")}>
                                            {formData.emailNotification ? "Activadas" : "Desactivadas"}
                                        </span>
                                        <Switch
                                            checked={formData.emailNotification}
                                            onCheckedChange={c => setFormData({ ...formData, emailNotification: c })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateOrUpdate}>{editingId ? "Actualizar Perfil" : "Guardar Perfil"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {profiles.map((profile) => (
                    <Card key={profile._id} className={cn("group hover:shadow-md transition-shadow border-l-4", profile.isActive ? "border-l-blue-500" : "border-l-gray-300 opacity-75")}>
                        <CardHeader className="pb-3 pt-4">
                            <div className="flex justify-between items-start">
                                <div className="cursor-pointer flex-1" onClick={() => openEdit(profile)}>
                                    <CardTitle className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                        {profile.name}
                                        {profile.isActive ? (
                                            <Badge variant="secondary" className="text-[10px] font-normal text-green-700 bg-green-50 border-green-200">Activo</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px] font-normal text-gray-600 bg-gray-100 border-gray-200">Pausado</Badge>
                                        )}
                                        {profile.emailNotification ?
                                            <Badge variant="secondary" className="text-[10px] font-normal text-blue-700 bg-blue-50 border-blue-200"><Bell className="w-3 h-3 mr-1" /> Notif. On</Badge> :
                                            <Badge variant="secondary" className="text-[10px] font-normal text-gray-500 bg-transparent border-0"><BellOff className="w-3 h-3 text-gray-300" /></Badge>
                                        }
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-xs text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-100 rounded-sm">
                                                {profile.unspscCodes?.length || 0} Categorías UNSPSC
                                            </Badge>
                                            <span className="text-gray-300">|</span>
                                            <span>
                                                {profile.departments?.length > 0 ? profile.departments.join(', ') : "Toda Colombia"}
                                            </span>
                                        </div>
                                        {profile.modalities?.length > 0 && (
                                            <div className="text-gray-400 italic">
                                                Modalidades: {profile.modalities.slice(0, 3).join(', ')}{profile.modalities.length > 3 ? '...' : ''}
                                            </div>
                                        )}
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(profile._id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
