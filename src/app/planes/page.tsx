import { StepsSection } from "@/components/ui/StepsSection";
import { PlansSection } from "@/components/ui/PlansSection";
import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";
import { auth } from "@/auth";

export default async function PlanesPage() {
    await dbConnect();
    const session = await auth();

    // Fetch active plans, sorted by order
    const plans = await Plan.find({ isActive: true }).sort({ order: 1 }).lean();

    // Transform MongoDB documents to plain objects effectively if needed, 
    // although .lean() does a good job. We might need to cast _id if we used it, 
    // but the component interface doesn't ask for id currently.
    // We map to ensure the types match exactly the interface expected by PlansSection
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


            <main className="flex-1">
                {/* Hero for Plans Page */}
                <div className="bg-primary/5 py-12 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl mb-6">
                            Nuestros Planes
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Transparencia y flexibilidad. Elige la herramienta perfecta para ganar licitaciones.
                        </p>
                    </div>
                </div>

                <StepsSection />

                <div className="">
                    <PlansSection plans={formattedPlans.length > 0 ? formattedPlans : undefined} />
                </div>

            </main>


        </div>
    );
}
