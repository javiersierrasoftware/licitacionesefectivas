import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PlanEditor } from "@/components/admin/PlanEditor";

export default async function AdminPlanesPage() {
    await dbConnect();
    const session = await auth();

    // Basic authorization check - in real app check session.user.role === 'admin'
    if (session?.user?.email !== "javiersierrac@gmail.com") {
        return <div className="p-8 text-center text-red-500">No tienes permisos de administrador.</div>;
    }

    // sort by order
    const plans = await Plan.find({}).sort({ order: 1 }).lean();
    // map _id to string
    const safePlans = plans.map(p => ({
        ...p,
        _id: p._id.toString()
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Administrar Planes</h1>
            <p className="text-muted-foreground">Edita los precios y características de los planes públicos.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safePlans.map(plan => (
                    <PlanEditor key={plan._id} plan={plan} />
                ))}
            </div>
        </div>
    );
}
