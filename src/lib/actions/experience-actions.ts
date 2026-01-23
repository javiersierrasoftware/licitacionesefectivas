"use server";

import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

import mongoose from "mongoose";

export async function addExperience(data: any) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    try {
        await dbConnect();

        console.log("Adding Experience for User:", session.user.id);

        // Manually generate ID to ensure consistency and immediate availability
        const newExpId = new mongoose.Types.ObjectId();

        const updatedProfile = await CompanyProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $push: {
                    experiences: {
                        _id: newExpId, // Explicit ID
                        title: data.title,
                        durationMonths: parseInt(data.durationMonths),
                        contractValue: parseInt(data.contractValue) || 0,
                        contractType: data.contractType,
                        experienceTypes: data.experienceTypes,
                        createdAt: new Date()
                    }
                },
                $setOnInsert: {
                    companyName: "Mi Empresa (Pendiente)",
                    unspscCodes: [],
                    sectors: [],
                    departments: []
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true, strict: false }
        ).lean();

        revalidatePath("/dashboard/profile");
        return { success: true, experiences: JSON.parse(JSON.stringify(updatedProfile.experiences || [])) };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Error agregando experiencia" };
    }
}

export async function removeExperience(experienceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "No autenticado" };

    if (!experienceId) {
        console.error("Attempted to remove experience with null/undefined ID");
        return { success: false, error: "ID de experiencia inválido" };
    }

    try {
        await dbConnect();

        const updatedProfile = await CompanyProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $pull: {
                    experiences: { _id: new mongoose.Types.ObjectId(experienceId) }
                }
            },
            { new: true }
        ).lean();

        revalidatePath("/dashboard/profile");
        return { success: true, experiences: JSON.parse(JSON.stringify(updatedProfile?.experiences || [])) };
    } catch (error) {
        console.error("Error removing experience:", error);
        return { success: false, error: "Error eliminando experiencia" };
    }
}
