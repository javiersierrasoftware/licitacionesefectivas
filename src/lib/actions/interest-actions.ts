"use server";

import dbConnect from "@/lib/db";
import InterestProfile from "@/lib/models/InterestProfile";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getInterestProfiles() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await dbConnect();
    const profiles = await InterestProfile.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(profiles));
}

export async function createInterestProfile(data: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    try {
        await dbConnect();

        // LIMIT CHECK LOGIC (TODO: Implement based on User Plan)
        // const count = await InterestProfile.countDocuments({ userId: session.user.id });
        // if (plan == 'basic' && count >= 1) return { error: "Upgrade required" }

        const newProfile = await InterestProfile.create({
            userId: session.user.id,
            ...data
        });

        revalidatePath("/dashboard/profile");
        return { success: true, profile: JSON.parse(JSON.stringify(newProfile)) };
    } catch (error) {
        console.error("Error creating interest profile:", error);
        return { success: false, error: "Error al crear el perfil de interés" };
    }
}

export async function updateInterestProfile(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    try {
        await dbConnect();
        await InterestProfile.findOneAndUpdate(
            { _id: id, userId: session.user.id }, // Security check
            data
        );
        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al actualizar" };
    }
}

export async function deleteInterestProfile(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    try {
        await dbConnect();
        await InterestProfile.findOneAndDelete({ _id: id, userId: session.user.id });
        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar" };
    }
}
