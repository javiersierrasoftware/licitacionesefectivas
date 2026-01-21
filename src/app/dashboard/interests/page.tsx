import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { getSavedOpportunities } from "@/lib/actions/opportunities";
import { OpportunitiesTable } from "@/components/dashboard/opportunities/OpportunitiesTable";
import { Star } from "lucide-react";

export default async function InterestsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const savedItems = await getSavedOpportunities(session.user.id);

    // Map saved items back to SecopTender format for the table
    const opportunities = savedItems.map(item => item.tenderData);

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Star className="h-6 w-6 text-accent fill-accent" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Mesa de Interés</h1>
                </div>
                <p className="text-muted-foreground">
                    Tus procesos de contratación seleccionados y guardados.
                </p>
            </div>

            {opportunities.length === 0 ? (
                <div className="p-12 border rounded-lg bg-gray-50 text-center">
                    <p className="text-gray-500">No tienes procesos marcados como favoritos.</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Marca la estrella en un proceso para verlo aquí.
                    </p>
                </div>
            ) : (
                <OpportunitiesTable opportunities={opportunities} />
            )}
        </div>
    );
}
