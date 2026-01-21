import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import User from "@/lib/models/User";
import { updateProfile } from "@/lib/actions/profile";
import { ProfileWizard } from "@/components/dashboard/profile/ProfileWizard";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();
    // Fetch data to pre-fill form
    const user = await User.findById(session.user.id);
    const profile = await CompanyProfile.findOne({ userId: session.user.id });

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Perfil de Empresa</h1>
                <p className="text-muted-foreground">
                    Actualiza la información de tu organización y tus datos de contacto.
                </p>
            </div>

            <div className="bg-transparent">
                <ProfileWizard
                    user={{ name: user?.name, email: user?.email }}
                    existingProfile={JSON.parse(JSON.stringify(profile))}
                />
            </div>
        </div>
    );
}
