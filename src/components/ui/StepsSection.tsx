import { UserPlus, CreditCard, Settings2 } from "lucide-react";

export function StepsSection() {
    const steps = [
        {
            icon: UserPlus,
            title: "1. Regístrate",
            description: "Crea tu cuenta en el portal para acceder a todas las funcionalidades."
        },
        {
            icon: CreditCard,
            title: "2. Elige y Paga",
            description: "Selecciona el plan ideal para tu empresa y realiza el pago seguro con Wompi."
        },
        {
            icon: Settings2,
            title: "3. Configura y Licita",
            description: "Define tus intereses y comienza a recibir las mejores oportunidades del estado."
        }
    ];

    return (
        <section className="py-16 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-gray-900">¿Cómo funciona?</h2>
                    <p className="text-muted-foreground">Tres simples pasos para empezar a ganar.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 -z-10" />

                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center bg-white p-4 relative">
                            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6 text-primary shadow-sm border border-blue-100 z-10">
                                <step.icon className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
