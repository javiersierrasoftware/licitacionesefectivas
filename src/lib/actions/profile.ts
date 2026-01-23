"use server";

import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(
    prevState: string | undefined,
    formData: FormData
) {
    const session = await auth();
    if (!session?.user?.id) return "No autenticado.";

    console.log("Updating Profile. Form Data Keys:", Array.from(formData.keys()));

    const updatePayload: any = {};

    // Helper to safely add fields if present in FormData
    const addIfPresent = (key: string, targetKey: string = key) => {
        if (formData.has(key)) {
            const value = formData.get(key);
            // Treat empty strings as valid updates (clearing the field) unless it's strictly specific logic
            updatePayload[targetKey] = value as string;
        }
    };

    try {
        await dbConnect();

        // Update User Name if present
        if (formData.has("name")) {
            const name = formData.get("name") as string;
            await User.findByIdAndUpdate(session.user.id, { name });
        }

        // --- Basic & Contact Info ---
        addIfPresent("companyName");
        addIfPresent("description");
        addIfPresent("nit");
        addIfPresent("address");
        addIfPresent("phone");
        addIfPresent("ciudad", "city");
        addIfPresent("website");

        // --- Legal & Classification ---
        addIfPresent("personType");
        addIfPresent("legalRepresentative");
        addIfPresent("companyType");
        addIfPresent("actividadesCamara");
        addIfPresent("profileName");

        // --- Dates ---
        if (formData.has("creationDate")) {
            const dateStr = formData.get("creationDate") as string;
            updatePayload.creationDate = dateStr ? new Date(dateStr) : null;
        }

        // --- Files ---
        addIfPresent("rutFile");
        addIfPresent("camaraComercioFile");
        addIfPresent("cedulaRepLegalFile");

        // --- Arrays / JSON Fields ---
        // Only parse and update if the field is actually in the form data

        if (formData.has("unspscCodes")) {
            try {
                const raw = formData.get("unspscCodes") as string;
                updatePayload.unspscCodes = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error("Error parsing unspscCodes", e);
            }
        }

        if (formData.has("sectors")) {
            try {
                const raw = formData.get("sectors") as string;
                updatePayload.sectors = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error("Error parsing sectors", e);
            }
        }

        if (formData.has("departments")) {
            try {
                const raw = formData.get("departments") as string;
                updatePayload.departments = raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.error("Error parsing departments", e);
            }
        }

        if (formData.has("preferences")) {
            try {
                const raw = formData.get("preferences") as string;
                const prefs = raw ? JSON.parse(raw) : {};

                // Clean up empty strings for numbers/dates
                if (prefs.tenderValueMin === "") prefs.tenderValueMin = undefined;
                if (prefs.tenderValueMax === "") prefs.tenderValueMax = undefined;
                if (prefs.historyStart === "") prefs.historyStart = undefined;

                updatePayload.preferences = prefs;
            } catch (e) {
                console.error("Error parsing preferences", e);
            }
        }

        // Always update timestamp
        updatePayload.updatedAt = new Date();

        console.log("FINAL PARTIAL UPDATE PAYLOAD:", JSON.stringify(updatePayload, null, 2));

        if (Object.keys(updatePayload).length > 1) { // > 1 because updatedAt is always there
            // Update Company Profile
            await CompanyProfile.findOneAndUpdate(
                { userId: session.user.id },
                { $set: updatePayload }, // Use $set to ensure partial update behavior
                { upsert: true, new: true, strict: false }
            );
            revalidatePath("/dashboard/profile");
            return "Perfil actualizado correctamente.";
        } else {
            return "No hubo cambios para guardar.";
        }

    } catch (error) {
        console.error("Profile update error:", error);
        return "Error al actualizar el perfil.";
    }
}
