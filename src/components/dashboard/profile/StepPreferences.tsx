"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Filter, Bell, History } from "lucide-react";
import { WizardData } from "./WizardParams";

interface StepPreferencesProps {
    data: WizardData;
    onChange: (data: Partial<WizardData>) => void;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function StepPreferences({ data, onChange, onBack, onSubmit, isSubmitting }: StepPreferencesProps) {

    const updatePreference = (key: keyof WizardData['preferences'], value: any) => {
        onChange({
            preferences: {
                ...data.preferences,
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

            <div className="flex flex-col md:flex-row gap-12">
                {/* Left Column: Basic Info */}
                <div className="flex-1 space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 relative group cursor-pointer hover:border-cyan-500 transition-colors">
                            <Filter className="w-8 h-8 text-gray-400 group-hover:text-cyan-500" />
                            <div className="absolute -bottom-2 -right-2 bg-gray-100 rounded-full p-1.5 border border-gray-200">
                                <SearchIcon className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="profileName" className="text-gray-700 font-medium">Dale un nombre a tu perfil:</Label>
                        <Input
                            id="profileName"
                            placeholder="Ej: Perfil ticsoft 1"
                            className="rounded-full bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                            value={data.profileName}
                            onChange={(e) => onChange({ profileName: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-gray-700 font-medium">Descripción del perfil - Opcional:</Label>
                        <Textarea
                            id="description"
                            placeholder="Ingresa una descripción al perfil"
                            className="resize-none rounded-2xl bg-white border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 min-h-[120px]"
                            value={data.description || ""}
                            onChange={(e) => onChange({ description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Right Column: Toggles */}
                <div className="flex-1 space-y-8 flex flex-col justify-center border-l md:border-l border-gray-100 md:pl-12">

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-cyan-600 font-medium">
                                <History className="w-5 h-5" />
                                <span>Histórico de procesos de contratación:</span>
                            </div>
                            <Switch checked={true} />
                        </div>

                        <div className="flex items-center space-x-3 bg-white p-2 rounded-full border w-fit">
                            <span className="text-sm text-gray-500 pl-2">Desde:</span>
                            <Input
                                type="date"
                                className="w-40 border-0 p-0 text-sm focus-visible:ring-0"
                                value={data.preferences.historyStart}
                                onChange={(e) => updatePreference('historyStart', e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground ml-2">* Puedes configurar tu histórico desde el 2011-01-01 en adelante.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-gray-700 font-medium">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span>Notificación a tu email:</span>
                            </div>
                            <Switch
                                checked={data.preferences.emailNotifications}
                                onCheckedChange={(checked: boolean) => updatePreference('emailNotifications', checked)}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Te notificaremos en tu correo cuando encontremos una oportunidad que coincida con este perfil.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <Label className="text-gray-700 font-medium block mb-3">Valor de Licitaciones (COP):</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Mínimo</span>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="rounded-xl bg-white"
                                    value={data.preferences.tenderValueMin || ""}
                                    onChange={(e) => updatePreference("tenderValueMin", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground">Máximo</span>
                                <Input
                                    type="number"
                                    placeholder="Sin límite"
                                    className="rounded-xl bg-white"
                                    value={data.preferences.tenderValueMax || ""}
                                    onChange={(e) => updatePreference("tenderValueMax", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button variant="outline" onClick={onBack} className="rounded-full px-8">
                    ← Regresar
                </Button>
                <Button
                    onClick={onSubmit}
                    className="rounded-full px-8 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shadow-green-200"
                    disabled={isSubmitting || !data.profileName}
                >
                    {isSubmitting ? "Creando..." : "Crea tu perfil"}
                </Button>
            </div>
        </div>
    );
}

function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
