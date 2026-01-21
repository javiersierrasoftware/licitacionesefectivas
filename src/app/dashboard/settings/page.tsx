import { auth } from "@/auth";
import { SettingsForm } from "./settings-form";
import { Bell } from "lucide-react";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    let initialSettings = null;

    try {
        await dbConnect();
        const profile = await CompanyProfile.findOne({ userId: session.user.id }).lean();
        // Extract settings or provide defaults manually if not set
        initialSettings = profile?.notificationSettings || {
            enabled: true,
            frequency: 'daily',
            triggers: {
                newOpportunities: true,
                statusChanges: true,
                expiring: false,
            },
            channels: {
                email: true,
                whatsapp: false,
            }
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
    }

    if (!initialSettings) return <div>Error loading settings</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-6 w-6 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración de Notificaciones</h1>
                </div>
                <p className="text-muted-foreground">
                    Personaliza cómo y cuándo quieres recibir alertas sobre nuevas oportunidades.
                </p>
            </div>

            <SettingsForm initialSettings={initialSettings} />
        </div>
    );
}
