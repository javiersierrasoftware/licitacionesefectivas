"use server";

import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Ensure only admins can perform these actions
async function checkAdmin() {
    const session = await auth();
    // Use optional chaining carefully, referencing the role property we added to User model
    // Note: You might need to extend the Session type in next-auth.d.ts to typescript-know about 'role'
    // For now we assume if it's stored in DB it might be available or we re-fetch user.
    // Ideally session callback populates role.
    if (session?.user?.email !== "javiersierrac@gmail.com") {
        // Quick fallback check if role isn't in session yet
        // In a real app we'd verify the role from the token/session properly
        throw new Error("Unauthorized");
    }
}

export async function updatePlan(id: string, formData: FormData) {
    await checkAdmin();
    await dbConnect();

    const data = {
        name: formData.get("name"),
        price: formData.get("price"),
        description: formData.get("description"),
        features: formData.get("features")?.toString().split("\n").map(f => f.trim()).filter(Boolean),
        buttonVariant: formData.get("buttonVariant"),
        color: formData.get("color"), // Advanced usage, maybe just text input for now
    };

    try {
        await Plan.findByIdAndUpdate(id, data);
        revalidatePath("/planes");
        revalidatePath("/dashboard/admin/planes");
        return { success: true };
    } catch (error) {
        console.error("Update Plan Error:", error);
        return { success: false, error: "Failed to update plan" };
    }
}
