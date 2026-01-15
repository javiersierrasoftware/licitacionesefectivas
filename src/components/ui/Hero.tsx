import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full overflow-hidden bg-background py-20 lg:py-32 xl:py-40">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 select-none">
                <Image
                    src="/images/hero-bg.png"
                    alt="Oficina corporativa moderna"
                    fill
                    priority
                    className="object-cover object-center"
                    quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/75 mix-blend-multiply" />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="flex flex-col items-start gap-6 max-w-2xl text-white">
                    <div className="inline-flex items-center rounded-full border border-blue-200/30 bg-blue-500/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        Expertos en SECOP II
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white drop-shadow-sm">
                        Gana más licitaciones <br />
                        <span className="text-secondary">con menos esfuerzo</span>
                    </h1>

                    <p className="text-lg text-gray-100 md:text-xl leading-relaxed">
                        Maximizamos tus oportunidades de negocio con el Estado. Consultoría experta, búsqueda monitoreada y gestión integral de procesos de contratación.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row mt-4">
                        <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 border-0">
                            Ver Servicios
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary backdrop-blur-sm bg-white/5">
                            Agenda una Asesoría
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-8 w-8 rounded-full bg-gray-400 border-2 border-primary" />
                                /* Placeholder for user avatars or success icons if needed */
                            ))}
                        </div>
                        <p>Más de <span className="font-bold text-white">200+</span> empresas confían en nosotros</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
