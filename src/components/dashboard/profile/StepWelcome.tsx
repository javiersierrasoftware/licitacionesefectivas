"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface StepWelcomeProps {
    userName: string;
    onNext: () => void;
}

export function StepWelcome({ userName, onNext }: StepWelcomeProps) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex items-center space-x-2 text-green-500 mb-6 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium text-sm md:text-base">
                    Bienvenido {userName}, creaste tu cuenta
                </span>
            </div>

            <h2 className="text-xl md:text-2xl text-gray-700 max-w-lg mb-8 leading-relaxed">
                ¡Cuenta creada con éxito! Ahora avanza con la configuración de tu perfil para filtrar y priorizar las licitaciones que más te interesan.
            </h2>

            <Button
                onClick={onNext}
                size="lg"
                className="bg-white text-green-600 border-2 border-green-500 hover:bg-green-50 hover:text-green-700 rounded-full px-12 py-6 text-lg shadow-none"
            >
                Continuar
            </Button>
        </div>
    );
}
