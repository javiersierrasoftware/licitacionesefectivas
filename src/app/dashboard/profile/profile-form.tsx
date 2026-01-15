"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnspscSelector } from "@/components/dashboard/UnspscSelector";

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const [message, formAction, isPending] = useActionState(updateProfile, undefined);

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Contacto</Label>
                    <Input id="name" name="name" defaultValue={user?.name} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" value={user?.email} disabled className="bg-gray-50" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="companyName">Razón Social</Label>
                <Input id="companyName" name="companyName" defaultValue={profile?.companyName} required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="nit">NIT</Label>
                    <Input id="nit" name="nit" defaultValue={profile?.nit} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phone} placeholder="+57 ..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" defaultValue={profile?.address} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" name="website" defaultValue={profile?.website} placeholder="https://..." />
            </div>

            <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Áreas de Interés (SECOP II)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Selecciona los códigos de productos y servicios (UNSPSC) que ofrece tu empresa.
                    Esto nos permitirá filtrarte las licitaciones adecuadas.
                </p>
                <UnspscSelector name="unspscCodes" initialCodes={profile?.unspscCodes || []} />
            </div>

            <div className="flex items-center justify-between pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
                {message && (
                    <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
                        {message}
                    </p>
                )}
            </div>
        </form>
    );
}
