"use server";

import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function activateManualSubscription(planId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Usuario no autenticado");
    }

    try {
        await dbConnect();

        // Calculate end date (30 days from now)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        await User.findByIdAndUpdate(session.user.id, {
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate,
            planId: planId
        });

        revalidatePath("/dashboard");
        revalidatePath("/planes");
    } catch (error) {
        console.error("Error activating subscription manually:", error);
        return { error: "Error al activar la suscripción" };
    }

    redirect("/dashboard?payment=success&method=manual");
}
