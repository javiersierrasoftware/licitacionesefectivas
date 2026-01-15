import { Hero } from "@/components/ui/Hero";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Search, Shield, TrendingUp, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
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
              title="Búsqueda y Monitoreo"
              description="Rastreamos SECOP I y II diariamente para identificar oportunidades que se ajusten a tu perfil comercial."
              icon={Search}
            />
            <ServiceCard
              title="Gestión de Licitaciones"
              description="Preparamos y presentamos tus ofertas cumpliendo rigurosamente con todos los requisitos habilitantes."
              icon={TrendingUp}
            />
            <ServiceCard
              title="Asesoría Jurídica"
              description="Respaldo legal experto en contratación estatal, resolución de controversias y defensa de tus derechos."
              icon={Shield}
            />
            <ServiceCard
              title="Capacitación"
              description="Entrenamos a tu equipo comercial y jurídico para dominar las plataformas de contratación del Estado."
              icon={Users}
            />
          </div>
        </div>
      </section>

      {/* Trust/Stats Section */}
      <section id="nosotros" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                ¿Por qué elegir Licitaciones Efectivas?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Somos un equipo interdisciplinario con más de 10 años de experiencia ganando licitaciones. Entendemos que cada pliego es diferente y cada detalle cuenta.
              </p>
              <ul className="space-y-4">
                {[
                  "Efectividad superior al 80% en procesos presentados.",
                  "Acompañamiento personalizado y estrategia a medida.",
                  "Tecnología propia para análisis de datos de contratación.",
                  "Transparencia y confidencialidad garantizada."
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-foreground">
                    <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-white text-xs">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-xl">
              {/* Placeholder for About Image - could be another generated one or a solid color with pattern */}
              <div className="absolute inset-0 bg-blue-900 flex items-center justify-center">
                <span className="text-white/20 text-9xl font-bold">LE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
            ¿Listo para ganar tu próxima licitación?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Agenda una consultoría gratuita y descubre cómo podemos potenciar tus resultados en el sector público.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 bg-primary text-white hover:bg-primary/90">
              Contáctanos Ahora
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-md px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
              Ver Planes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
