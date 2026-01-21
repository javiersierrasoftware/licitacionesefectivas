"use server";

import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Ensure only admins can perform these actions
async function checkAdmin() {
    const session = await auth();
    // Check role explicitly
    const userRole = (session?.user as any)?.role;

    const isRoleAdmin = userRole?.toLowerCase() === 'admin';

    if (!isRoleAdmin) {
        throw new Error("Unauthorized: Admin role required");
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
