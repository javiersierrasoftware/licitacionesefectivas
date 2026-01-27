import { Settings2, Target, FileText } from "lucide-react";

export function StepsSection() {
    const steps = [
        {
            icon: Settings2,
            title: "1. Configuramos tu perfil",
            description: "(UNSPSC, experiencia, capacidad, zonas)"
        },
        {
            icon: Target,
            title: "2. IA prioriza oportunidades",
            description: "(scoring de Ajuste + alertas)"
        },
        {
            icon: FileText,
            title: "3. Generas y gestionas la oferta",
            description: "(docs + tablero + acompañamiento)"
        }
    ];

    return (
        <section className="py-8 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Así automatizamos tu participación</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gray-100 -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center bg-white p-4 relative">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-primary shadow-sm border border-blue-100 z-10">
                                <step.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
