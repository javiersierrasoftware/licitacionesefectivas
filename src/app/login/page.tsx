"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"; // Ensure heroicons is installed or use lucide

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

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
                    <h1 className="text-4xl font-bold mb-4">Bienvenido al Portal de Clientes</h1>
                    <p className="text-lg text-blue-100 max-w-md">
                        Gestiona tu perfil, descubre oportunidades personalizadas y gana más contratos con el Estado.
                    </p>
                </div>
                <div className="text-sm text-blue-200">
                    © {new Date().getFullYear()} Licitaciones Efectivas S.A.S.
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Ingresa tus credenciales para acceder
                        </p>
                    </div>

                    <form action={formAction} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    placeholder="ejemplo@empresa.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending ? "Ingresando..." : "Ingresar"}
                        </Button>

                        {errorMessage && (
                            <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                <p className="text-sm text-red-500">{errorMessage}</p>
                            </div>
                        )}

                        <div className="text-center text-sm">
                            <span className="text-gray-500">¿No tienes cuenta? </span>
                            <Link href="/register" className="font-medium text-primary hover:text-secondary">
                                Regístrate aquí
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
