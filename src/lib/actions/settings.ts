"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { revalidatePath } from "next/cache";

interface NotificationSettings {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'realtime';
    triggers: {
        newOpportunities: boolean;
        statusChanges: boolean;
        expiring: boolean;
    };
    channels: {
        email: boolean;
        whatsapp: boolean;
    }
}

export async function updateNotificationSettings(settings: NotificationSettings) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        await dbConnect();

        await CompanyProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $set: {
                    notificationSettings: settings
                }
            },
            { new: true, upsert: true }
        );

        revalidatePath('/dashboard/settings');
        return { success: true };
    } catch (error) {
        console.error("Error updating notification settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
