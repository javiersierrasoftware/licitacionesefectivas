"use client";

import { useState } from "react";
import { updatePlan } from "@/lib/actions/plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; // Assuming sonner or use standard alert

interface PlanProps {
    _id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    buttonVariant: string;
    color: string;
}

export function PlanEditor({ plan }: { plan: PlanProps }) {
    const [isLoading, setIsLoading] = useState(false);

    async function itemAction(formData: FormData) {
        setIsLoading(true);
        const res = await updatePlan(plan._id, formData);
        setIsLoading(false);
        if (res.success) {
            alert("Plan actualizado correctamente"); // Simple feedback
        } else {
            alert("Error al actualizar");
        }
    }

    return (
        <Card>
            <form action={itemAction}>
                <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`name-${plan._id}`}>Nombre</Label>
                        <Input id={`name-${plan._id}`} name="name" defaultValue={plan.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`price-${plan._id}`}>Precio</Label>
                        <Input id={`price-${plan._id}`} name="price" defaultValue={plan.price} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`desc-${plan._id}`}>Descripción</Label>
                        <Input id={`desc-${plan._id}`} name="description" defaultValue={plan.description} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`feat-${plan._id}`}>Características (Una por línea)</Label>
                        <Textarea
                            id={`feat-${plan._id}`}
                            name="features"
                            defaultValue={plan.features.join("\n")}
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`variant-${plan._id}`}>Estilo del Botón</Label>
                        <Select name="buttonVariant" defaultValue={plan.buttonVariant}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default (Azul Sólido)</SelectItem>
                                <SelectItem value="secondary">Secondary (Oscuro/Blanco)</SelectItem>
                                <SelectItem value="outline">Outline (Borde)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hidden color input regarding Tailwind classes for now to avoid breaking layout */}
                    <input type="hidden" name="color" value={plan.color} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
