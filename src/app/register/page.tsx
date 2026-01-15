"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Wrapper for register to handle success redirect on client
// or just use logic inside component.
// But useActionState expects a function.

export default function RegisterPage() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(register, undefined);

    useEffect(() => {
        if (state === "success") {
            router.push("/login?registered=true");
        }
    }, [state, router]);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold tracking-tight">
                        Licitaciones<span className="text-secondary">Efectivas</span>
                    </span>
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-4">Únete a Licitaciones Efectivas</h1>
                    <p className="text-lg text-blue-100 max-w-md">
                        Crea tu cuenta empresarial y comienza a recibir alertas de contratación pública.
                    </p>
                </div>
                <div className="text-sm text-blue-200">
                    © {new Date().getFullYear()} Licitaciones Efectivas S.A.S.
                </div>
            </div>

            {/* Right: Register Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta Empresarial</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Completa los datos de tu empresa
                        </p>
                    </div>

                    <form action={formAction} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Persona de Contacto</label>
                                <input required name="name" type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa (Razón Social)</label>
                                <input required name="companyName" type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIT</label>
                                <input required name="nit" type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input required name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <input required name="password" type="password" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                            </div>
                        </div>

                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? "Registrando..." : "Registrarse"}
                        </Button>

                        {state && state !== "success" && (
                            <p className="text-sm text-red-500 text-center">{state}</p>
                        )}

                        <div className="text-center text-sm">
                            <span className="text-gray-500">¿Ya tienes cuenta? </span>
                            <Link href="/login" className="font-medium text-primary hover:text-secondary">
                                Inicia sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
