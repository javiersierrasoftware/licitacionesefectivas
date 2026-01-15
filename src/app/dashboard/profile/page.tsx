import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import User from "@/lib/models/User";
import { updateProfile } from "@/lib/actions/profile";
import { ProfileForm } from "./profile-form"; // Client component

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

            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <ProfileForm
                    user={{ name: user?.name, email: user?.email }}
                    profile={JSON.parse(JSON.stringify(profile))}
                />
            </div>
        </div>
    );
}
