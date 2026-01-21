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
        <div className="space-y-6">
            {showSuccess && (
                <Alert className="bg-green-50 text-green-700 border-green-200 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Guardado</AlertTitle>
                    <AlertDescription>Your preferences have been updated successfully.</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Notificaciones Generales</CardTitle>
                            <CardDescription>Activa o desactiva todas las alertas del sistema.</CardDescription>
                        </div>
                        <Switch
                            checked={settings.enabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                        />
                    </div>
                </CardHeader>
            </Card>

            <div className={`space-y-6 transition-opacity ${!settings.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Frecuencia */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Frecuencia de Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={settings.frequency}
                                onValueChange={(val) => setSettings({ ...settings, frequency: val })}
                                className="space-y-3"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="realtime" id="r1" />
                                    <Label htmlFor="r1" className="font-normal">Tiempo Real (Inmediato)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="daily" id="r2" />
                                    <Label htmlFor="r2" className="font-normal">Resumen Diario (7:00 AM)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="weekly" id="r3" />
                                    <Label htmlFor="r3" className="font-normal">Resumen Semanal (Lunes)</Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Canales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Canales de Recepción</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="channel-email" className="font-normal">Correo Electrónico</Label>
                                <Switch
                                    id="channel-email"
                                    checked={settings.channels.email}
                                    onCheckedChange={(c) => updateChannel('email', c)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="channel-whatsapp" className="font-normal">WhatsApp (Beta)</Label>
                                <Switch
                                    id="channel-whatsapp"
                                    checked={settings.channels.whatsapp}
                                    onCheckedChange={(c) => updateChannel('whatsapp', c)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Triggers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tipos de Alerta</CardTitle>
                        <CardDescription>Elige qué eventos deben generar una notificación.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <Label htmlFor="trigger-new" className="flex-1 font-normal cursor-pointer">
                                <span className="block font-medium">Nuevas Oportunidades</span>
                                <span className="text-xs text-muted-foreground">Coincidencias con tu perfil</span>
                            </Label>
                            <Switch
                                id="trigger-new"
                                checked={settings.triggers.newOpportunities}
                                onCheckedChange={(c) => updateTrigger('newOpportunities', c)}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <Label htmlFor="trigger-status" className="flex-1 font-normal cursor-pointer">
                                <span className="block font-medium">Cambios de Estado</span>
                                <span className="text-xs text-muted-foreground">Actualizaciones en tus favoritos</span>
                            </Label>
                            <Switch
                                id="trigger-status"
                                checked={settings.triggers.statusChanges}
                                onCheckedChange={(c) => updateTrigger('statusChanges', c)}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                            <Label htmlFor="trigger-expiring" className="flex-1 font-normal cursor-pointer">
                                <span className="block font-medium">Cierres Próximos</span>
                                <span className="text-xs text-muted-foreground">Recordatorio 24h antes del cierre</span>
                            </Label>
                            <Switch
                                id="trigger-expiring"
                                checked={settings.triggers.expiring}
                                onCheckedChange={(c) => updateTrigger('expiring', c)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full md:w-auto bg-[#00B4D8] hover:bg-[#009bb8] text-white font-bold"
                >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
