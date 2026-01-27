import { Hero } from "@/components/ui/Hero";
import Link from "next/link";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { PlansSection } from "@/components/ui/PlansSection";
import { Target, FileSearch, FileText, ListTodo } from "lucide-react";
import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";

export default async function Home() {
  await dbConnect();

  // Fetch active plans, sorted by order
  const plans = await Plan.find({ isActive: true }).sort({ order: 1 }).lean();

  const formattedPlans = plans.map(plan => ({
    _id: plan._id.toString(),
    name: plan.name,
    price: plan.price,
    description: plan.description,
    features: plan.features,
    color: plan.color,
    buttonVariant: plan.buttonVariant
  }));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <section id="servicios" className="py-12 bg-neutral">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Soluciones Integrales para Contratación Estatal
            </h2>
            <p className="text-lg text-muted-foreground">
              Cubrimos todas las etapas del proceso licitatorio para garantizar que tu empresa compita con ventaja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              title="Radar Inteligente + Scoring"
              description="Monitoreo diario SECOP I/II + alertas. La IA te entrega un Índice de Ajuste y te prioriza las oportunidades que realmente puedes ganar."
              icon={Target}
              linkText="Ver cómo funciona"
            />
            <ServiceCard
              title="Análisis de Pliegos con IA"
              description="Extrae requisitos, cronograma, factores de evaluación y riesgos. Checklist automático para no quedar por fuera por errores."
              icon={FileSearch}
              linkText="Ver ejemplo"
            />
            <ServiceCard
              title="Generación Automática de Documentos"
              description="Genera cartas, formatos, matrices, declaraciones y anexos con tu información precargada. Versionado y control de cambios."
              icon={FileText}
              linkText="Ver documentos"
            />
            <ServiceCard
              title="Gestión de Licitación de punta a punta"
              description="Tareas, responsables, vencimientos, observaciones, aclaraciones y entregables en un tablero. Todo listo para presentar a tiempo."
              icon={ListTodo}
              linkText="Conocer el flujo"
            />
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <PlansSection plans={formattedPlans.length > 0 ? formattedPlans : undefined} />

      {/* Trust/Stats Section */}
      <section id="nosotros" className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                ¿Por qué elegir Licitaciones Efectivas?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Somos un equipo con +10 años ganando licitaciones. Ahora lo potenciamos con IA para que licites más rápido, con menos errores y mejor estrategia.
              </p>
              <ul className="space-y-4">
                {[
                  "Índice de Ajuste (0–100) para priorizar lo que sí conviene presentar.",
                  " IA que lee pliegos y te entrega checklist + riesgos + matriz de requisitos.",
                  "Documentos automáticos listos para firmar y cargar.",
                  "Tablero de gestión del proceso (fechas, tareas, responsables y entregables)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-foreground">
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-primary text-xs font-bold">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-xl">
              <img
                src="/images/image2.png"
                alt="Licitaciones Efectivas"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            ¿Listo para ganar tu próxima licitación?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Recibe 10 oportunidades filtradas con tu Scoring de Ajuste esta semana.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 bg-secondary text-primary font-bold hover:bg-secondary/90">
              Quiero mi diagnóstico
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
