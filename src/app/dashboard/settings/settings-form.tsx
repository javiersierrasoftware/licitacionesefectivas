"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateNotificationSettings } from "@/lib/actions/settings";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SettingsFormProps {
    initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setShowSuccess(false);
        try {
            const result = await updateNotificationSettings(settings);
            if (result.success) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const updateTrigger = (key: string, val: boolean) => {
        setSettings((prev: any) => ({
            ...prev,
            triggers: { ...prev.triggers, [key]: val }
        }));
    };

    const updateChannel = (key: string, val: boolean) => {
        setSettings((prev: any) => ({
            ...prev,
            channels: { ...prev.channels, [key]: val }
        }));
    };

    return (
        <div className="space-y-8">
            {showSuccess && (
                <Alert className="bg-green-50 text-green-700 border-green-200 animate-in slide-in-from-top-2 rounded-xl">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Guardado</AlertTitle>
                    <AlertDescription>Tus preferencias han sido actualizadas exitosamente.</AlertDescription>
                </Alert>
            )}

            {/* Generales - Single Row Card */}
            <Card className="shadow-premium border-0 bg-neutral/5 rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-bold text-gray-900">Notificaciones Generales</h3>
                        <p className="text-sm text-muted-foreground">Activa o desactiva todas las alertas del sistema.</p>
                    </div>
                    <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                        className="data-[state=checked]:bg-primary"
                    />
                </CardContent>
            </Card>

            <div className={`space-y-6 transition-opacity duration-300 ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Frecuencia */}
                    <Card className="shadow-premium border-0 bg-neutral/5 rounded-2xl h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">Frecuencia de Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={settings.frequency}
                                onValueChange={(val) => setSettings({ ...settings, frequency: val })}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="realtime" id="r1" className="text-primary border-gray-400" />
                                    <Label htmlFor="r1" className="font-normal text-gray-700 cursor-pointer">Tiempo Real (Inmediato)</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="daily" id="r2" className="text-primary border-gray-400" />
                                    <Label htmlFor="r2" className="font-normal text-gray-700 cursor-pointer">Resumen Diario (7:00 AM)</Label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="weekly" id="r3" className="text-primary border-gray-400" />
                                    <Label htmlFor="r3" className="font-normal text-gray-700 cursor-pointer">Resumen Semanal (Lunes)</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Canales */}
                    <Card className="shadow-premium border-0 bg-neutral/5 rounded-2xl h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold">Canales de Recepción</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="channel-email" className="font-normal text-gray-700">Correo Electrónico</Label>
                                <Switch
                                    id="channel-email"
                                    checked={settings.channels.email}
                                    onCheckedChange={(c) => updateChannel('email', c)}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="channel-whatsapp" className="font-normal text-gray-700">WhatsApp (Beta)</Label>
                                <Switch
                                    id="channel-whatsapp"
                                    checked={settings.channels.whatsapp}
                                    onCheckedChange={(c) => updateChannel('whatsapp', c)}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Triggers */}
                <Card className="shadow-premium border-0 bg-neutral/5 rounded-2xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold">Tipos de Alerta</CardTitle>
                        <CardDescription>Elige qué eventos deben generar una notificación.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <Label htmlFor="trigger-new" className="flex-1 cursor-pointer">
                                <span className="block font-medium text-gray-900">Nuevas Oportunidades</span>
                                <span className="text-xs text-muted-foreground">Coincidencias con tu perfil</span>
                            </Label>
                            <Switch
                                id="trigger-new"
                                checked={settings.triggers.newOpportunities}
                                onCheckedChange={(c) => updateTrigger('newOpportunities', c)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <Label htmlFor="trigger-status" className="flex-1 cursor-pointer">
                                <span className="block font-medium text-gray-900">Cambios de Estado</span>
                                <span className="text-xs text-muted-foreground">Actualizaciones en tus favoritos</span>
                            </Label>
                            <Switch
                                id="trigger-status"
                                checked={settings.triggers.statusChanges}
                                onCheckedChange={(c) => updateTrigger('statusChanges', c)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <Label htmlFor="trigger-expiring" className="flex-1 cursor-pointer">
                                <span className="block font-medium text-gray-900">Cierres Próximos</span>
                                <span className="text-xs text-muted-foreground">Recordatorio 24h antes del cierre</span>
                            </Label>
                            <Switch
                                id="trigger-expiring"
                                checked={settings.triggers.expiring}
                                onCheckedChange={(c) => updateTrigger('expiring', c)}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl shadow-lg shadow-blue-200"
                >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
