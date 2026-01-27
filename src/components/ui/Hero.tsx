import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full overflow-hidden bg-background py-14 lg:py-24 xl:py-28">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src="/images/ImagenparaLicitaciones.png"
                    alt="Oficina corporativa moderna"
                    fill
                    priority
                    className="object-cover object-center"
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="flex flex-col items-start gap-6 max-w-4xl text-white">
                    <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                            Scoring de ajuste (IA)
                        </div>
                        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                            Generación automática de documentos
                        </div>
                        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                            Gestión integral del proceso
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white drop-shadow-sm">
                        Gana más procesos en SECOP I y II <br />
                        <span className="text-secondary">con IA + acompañamiento experto</span>
                    </h1>

                    <p className="text-lg text-gray-100 md:text-xl leading-relaxed">
                        Monitoreo + scoring de ajuste + generación de documentos + gestión del proceso. Menos riesgo, más adjudicaciones.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row mt-4">
                        <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 border-0 font-bold" asChild>
                            <Link href="/contactanos">
                                Agenda diagnóstico gratis
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/5" asChild>
                            <Link href="/planes">
                                Ver planes
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-sm text-gray-200">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full bg-gray-400 border-2 border-primary" />
                                /* Placeholder for user avatars or success icons if needed */
                            ))}
                        </div>
                        <p>Te mostramos oportunidades reales según tu perfil (UNSPSC/experiencia/capacidad).</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
