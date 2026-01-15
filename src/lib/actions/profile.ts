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

    const name = formData.get("name") as string;
    const companyName = formData.get("companyName") as string;
    const nit = formData.get("nit") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const unspscCodesRaw = formData.get("unspscCodes") as string;

    let unspscCodes: string[] = [];
    try {
        if (unspscCodesRaw) {
            unspscCodes = JSON.parse(unspscCodesRaw);
        }
    } catch (e) {
        console.error("Error parsing codes", e);
    }

    try {
        await dbConnect();

        // Update User Name
        if (name) {
            await User.findByIdAndUpdate(session.user.id, { name });
        }

        // Update Company Profile
        await CompanyProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                companyName,
                nit,
                address,
                phone,
                website,
                unspscCodes,
            },
            { upsert: true, new: true }
        );

        revalidatePath("/dashboard/profile");
        return "Perfil actualizado correctamente.";
    } catch (error) {
        console.error("Profile update error:", error);
        return "Error al actualizar el perfil.";
    }
}
