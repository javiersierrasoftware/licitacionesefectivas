"use client";

import { useFormState, useFormStatus } from "react-dom";
import { quickRegister, authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Creando cuenta..." : "Crear Cuenta y Continuar"}
        </Button>
    );
}

export function CheckoutRegisterForm() {
    const [state, dispatch] = useFormState(quickRegister, undefined);
    const router = useRouter();

    useEffect(() => {
        if (state === "success") {
            // Logic to auto-login. 
            // We can't access password easily here to pass to signIn('credentials') unless we stored it in state or context, 
            // or if we ask user to login.
            // BETTER UX: The server action returns success. Now we ask user to login or we try to perform a client-side login.
            // Since we don't have the password in plain text here (it was in formData), 
            // the smoothest way is:
            // 1. Ask user to login (Safe but adds a step)
            // 2. OR modify quickRegister to *also* create a session (hard with NextAuth v5 server actions + credentials).
            // Let's reload and show a specialized "Login to pay" or just redirect to login with callback.

            // Actually, for this specific flow, letting them login immediately with the password they just set is fine.
            // But we need the password.

            // For now, let's redirect to login page with a success message? 
            // Or better, switch this form to a "Login Form" pre-filled?

            // Let's try redirecting to login with callback
            router.push("/login?callbackUrl=" + window.location.pathname + "&verified=true");
        }
    }, [state, router]);

    return (
        <div className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
            <div className="text-center">
                <h3 className="text-lg font-bold">¿Nuevo cliente? Regístrate rápido</h3>
                <p className="text-sm text-gray-500">Para procesar tu pago necesitamos crear tu cuenta</p>
            </div>

            {state && state !== "success" && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {state}
                </div>
            )}

            <form action={dispatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" placeholder="Tu nombre" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Empresa</Label>
                        <Input id="companyName" name="companyName" placeholder="Nombre empresa" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" name="email" type="email" placeholder="nombre@empresa.com" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" name="password" type="password" required />
                </div>

                <SubmitButton />

                <div className="text-center text-sm">
                    ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 underline">Inicia Sesión</a>
                </div>
            </form>
        </div>
    );
}
