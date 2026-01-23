import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import User from "@/lib/models/User";
import { getInterestProfiles } from "@/lib/actions/interest-actions";
import { BasicInfoForm } from "@/components/dashboard/profile/BasicInfoForm";
import { DetailedInfoForm } from "@/components/dashboard/profile/DetailedInfoForm";
import { InterestManager } from "@/components/dashboard/profile/InterestManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, Target } from "lucide-react";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // Fetch Data
    const user = await User.findById(session.user.id).lean();
    const profile = await CompanyProfile.findOne({ userId: session.user.id }).lean();

    console.log("SERVER PAGE LOAD - Profile ID:", profile?._id);
    console.log("SERVER PAGE LOAD - Experiences count:", profile?.experiences?.length);
    console.log("SERVER PAGE LOAD - Experiences data:", JSON.stringify(profile?.experiences));

    const interestProfiles = await getInterestProfiles();

    // Serialize generic data (remove _id objects etc if needed for client components, though usually next handles lean objects well if simple)
    const serializedProfile = JSON.parse(JSON.stringify(profile || {}));
    const serializedUser = JSON.parse(JSON.stringify(user || {}));

    // Determine Plan (Mock logic for now, should be real later)
    const userPlan = 'basic'; // Fetch from User model or Subscription

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Perfil de Empresa</h1>
                <p className="text-gray-500 mt-1">
                    Gestiona la información de tu organización y tus criterios de búsqueda.
                </p>
            </div>

            <Tabs defaultValue="basic" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100/80 rounded-xl">
                    <TabsTrigger value="basic" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Building2 className="w-4 h-4 mr-2" />
                        Perfil Básico
                    </TabsTrigger>
                    <TabsTrigger value="detailed" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                        <FileText className="w-4 h-4 mr-2" />
                        Perfil Detallado
                    </TabsTrigger>
                    <TabsTrigger value="interests" className="py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all">
                        <Target className="w-4 h-4 mr-2" />
                        Intereses
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: BASIC INFO */}
                <TabsContent value="basic" className="outline-none animate-in fade-in-50 duration-500">
                    <div className="grid gap-6">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Datos Generales</CardTitle>
                                <CardDescription>Información pública y de contacto de la empresa.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <BasicInfoForm
                                    user={serializedUser}
                                    initialData={serializedProfile}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: DETAILED INFO */}
                <TabsContent value="detailed" className="outline-none animate-in fade-in-50 duration-500">
                    <div className="grid gap-6">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle>Perfil Detallado y Experiencia</CardTitle>
                                <CardDescription>Información requerida para procesos de contratación más complejos.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <DetailedInfoForm
                                    initialData={serializedProfile}
                                    isPremium={userPlan !== 'basic'} // Example logic
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 3: INTERESTS */}
                <TabsContent value="interests" className="outline-none animate-in fade-in-50 duration-500">
                    <div className="grid gap-6">
                        <Card className="border border-gray-100 shadow-sm bg-white">
                            <CardContent className="pt-6">
                                <InterestManager
                                    initialProfiles={interestProfiles}
                                    plan={userPlan}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
