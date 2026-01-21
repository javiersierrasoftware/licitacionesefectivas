"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this or standard textarea
import { Label } from "@/components/ui/label"; // Check if this exists, otherwise standard label
import { sendContactMessage } from "@/lib/actions/contact";
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { Mail, MapPin, Phone } from "lucide-react";

// Assuming we don't have a specialized Textarea component in ui yet, we'll check imports or use standard.
// Based on previous file listing, `textarea.tsx` might exist or not. If not, standard html.
// Actually, user metadata says `src/components/ui/textarea.tsx` is OPEN, so it exists!

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Enviando..." : "Enviar Mensaje"}
        </Button>
    );
}

export default function ContactPage() {
    const [state, formAction] = useActionState(sendContactMessage, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            formRef.current?.reset();
        } else if (state?.message && !state?.errors) {
            toast.error(state.message);
        }
    }, [state]);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="bg-primary py-12 md:py-20 text-white">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        Contáctanos
                    </h1>
                    <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                        ¿Tienes dudas? Estamos aquí para ayudarte a potenciar tu negocio con licitaciones.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 py-12">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-gray-900">Ponte en contacto</h2>
                            <p className="text-muted-foreground">
                                Completa el formulario y nuestro equipo te responderá a la brevedad posible.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Correo Electrónico</h3>
                                    <p className="text-muted-foreground">contacto@licitacionesefectivas.com</p>
                                    <p className="text-muted-foreground">soporte@licitacionesefectivas.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Ubicación</h3>
                                    <p className="text-muted-foreground">Bogotá, Colombia</p>
                                    <p className="text-sm text-gray-500">Oficina Principal (Atención con Cita)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                        <form ref={formRef} action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nombre Completo</label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Tu nombre"
                                    required
                                    aria-describedby="name-error"
                                    className={state?.errors?.name ? "border-red-500" : ""}
                                />
                                {state?.errors?.name && (
                                    <p id="name-error" className="text-sm text-red-500">{state.errors.name[0]}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Correo Electrónico</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    required
                                    className={state?.errors?.email ? "border-red-500" : ""}
                                />
                                {state?.errors?.email && (
                                    <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Asunto</label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    placeholder="Motivo de tu mensaje"
                                    required
                                    className={state?.errors?.subject ? "border-red-500" : ""}
                                />
                                {state?.errors?.subject && (
                                    <p className="text-sm text-red-500">{state.errors.subject[0]}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Mensaje</label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Cuéntanos cómo podemos ayudarte..."
                                    rows={5}
                                    required
                                    className={state?.errors?.message ? "border-red-500" : ""}
                                />
                                {state?.errors?.message && (
                                    <p className="text-sm text-red-500">{state.errors.message[0]}</p>
                                )}
                            </div>

                            <SubmitButton />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
