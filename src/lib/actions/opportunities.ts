"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import { SecopTender } from "@/lib/services/secop";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(tender: SecopTender) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    const existing = await SavedOpportunity.findOne({
        userId: session.user.id,
        tenderId: tender.referencia_del_proceso,
    });

    if (existing) {
        // Toggle favorite status
        existing.isFavorite = !existing.isFavorite;
        // If not favorite and no notes, we could potentially remove it, 
        // but keeping it is fine for history if needed. 
        // For now, let's keep it.
        existing.tenderData = tender; // Update snapshot
        existing.updatedAt = new Date();
        await existing.save();
    } else {
        // Create new
        await SavedOpportunity.create({
            userId: session.user.id,
            tenderId: tender.referencia_del_proceso,
            isFavorite: true,
            tenderData: tender,
        });
    }

    revalidatePath("/dashboard/opportunities");
    revalidatePath("/dashboard/interests");
}

export async function saveNote(tenderId: string, note: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    await dbConnect();

    await SavedOpportunity.findOneAndUpdate(
        { userId: session.user.id, tenderId: tenderId },
        {
            $set: { notes: note, updatedAt: new Date() }
        },
        { upsert: false } // We assume the item exists or we handle creation contextually. 
        // Actually, user might add note to non-favorite. 
        // But for now let's assume UI handles "favorite first" or we upsert if we pass tenderData.
        // Needs tenderData to upsert safely.
    );
    // If we need to support adding notes to unsaved items, we'd need to pass the tender data here too.
    // For simplicity, let's assume we mainly note saved items, or we'll update this later.

    revalidatePath("/dashboard/interests");
}

export async function getSavedOpportunities(userId: string) {
    await dbConnect();
    return SavedOpportunity.find({ userId, isFavorite: true }).sort({ updatedAt: -1 });
}
