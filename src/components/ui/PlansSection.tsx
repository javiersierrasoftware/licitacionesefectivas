import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface Plan {
    _id?: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    color: string;
    buttonVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

interface PlansSectionProps {
    plans?: Plan[];
}

export function PlansSection({ plans }: PlansSectionProps) {
    // Fallback default plans if none provided (or for initial loading state)
    const defaultPlans: Plan[] = [
        {
            name: "Básico",
            price: "Gratis",
            description: "Para empezar a explorar",
            features: ["Búsqueda ilimitada", "Filtros básicos", "Notificaciones diarias"],
            color: "bg-gray-100 text-gray-900",
            buttonVariant: "outline",
        },
        {
            name: "Emprendedor",
            price: "$90.000",
            description: "Para independientes",
            features: ["Alertas en tiempo real", "Filtros I.A.", "1 Usuario"],
            color: "bg-blue-50 text-blue-900 border-blue-200",
            buttonVariant: "default",
        },
        {
            name: "Pyme",
            price: "$180.000",
            description: "Equipos en crecimiento",
            features: ["Todo lo anterior", "3 Usuarios", "Análisis de Pliegos"],
            color: "bg-blue-600 text-white shadow-xl scale-105 z-10",
            buttonVariant: "secondary",
        },
        {
            name: "Empresarial",
            price: "$350.000",
            description: "Licitadores frecuentes",
            features: ["Todo lo anterior", "10 Usuarios", "Asesoría Jurídica (2h)"],
            color: "bg-indigo-50 text-indigo-900 border-indigo-200",
            buttonVariant: "default",
        },
        {
            name: "Corporativo",
            price: "Personalizado",
            description: "Soluciones a medida",
            features: ["Usuarios Ilimitados", "API Access", "Gestor Dedicado"],
            color: "bg-gray-900 text-white",
            buttonVariant: "secondary",
        },
    ];

    const displayPlans = plans && plans.length > 0 ? plans : defaultPlans;

    return (
        <section id="planes" className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                        Elige el plan ideal para tu éxito
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Desde herramientas gratuitas hasta soluciones corporativas completas. Escala con nosotros.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                    {displayPlans.map((plan, index) => (
                        <Card
                            key={index}
                            className={`flex flex-col h-full border-0 relative ${plan.color.includes('shadow') ? 'shadow-2xl' : 'shadow-md'} ${plan.color} transition-all duration-200 hover:-translate-y-1`}
                        >
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    {plan.price !== "Gratis" && plan.price !== "Personalizado" && <span className="text-sm opacity-80">/mes</span>}
                                </div>
                                <p className="text-sm opacity-80 pt-1">{plan.description}</p>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start text-sm">
                                            <Check className="h-4 w-4 mr-2 shrink-0 opacity-70" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {plan._id ? (
                                    <Button className="w-full" variant={plan.buttonVariant} asChild>
                                        <Link href={`/planes/checkout/${plan._id}`}>
                                            Elegir Plan
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="w-full" variant={plan.buttonVariant}>
                                        Elegir Plan
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
