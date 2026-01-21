import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import CompanyProfile from "@/lib/models/CompanyProfile";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import { redirect } from "next/navigation";
import { Building2, Star } from "lucide-react";
import { AnalysisTable, AnalysisCompany } from "@/components/dashboard/admin/AnalysisTable";

export default async function AdminAnalysisPage() {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole?.toLowerCase() !== 'admin') {
        redirect("/dashboard");
    }

    await dbConnect();

    // Fetch all companies with user data
    const companies = await CompanyProfile.find().populate('userId', 'name email').lean();

    // Fetch all favorites to aggregate counts
    const allFavorites = await SavedOpportunity.find({ isFavorite: true }).lean();

    // Metrics
    const totalCompanies = companies.length;
    const totalInterests = allFavorites.length;

    // Aggregate interests by userId
    // Map userId -> Array of Interest
    const interestsByUserId: Record<string, any[]> = {};

    allFavorites.forEach((fav: any) => {
        const uid = fav.userId.toString();
        if (!interestsByUserId[uid]) {
            interestsByUserId[uid] = [];
        }

        // Extract Title, URL, Modality safely
        const t = fav.tenderData || {};
        const title = t.descripci_n_del_procedimiento || "Sin descripción";
        const modality = t.modalidad_de_contratacion || "Sin modalidad";
        const deadline = t.fecha_de_recepcion_de_ofertas;
        const price = t.precio_base || "0";
        const entidad = t.entidad || "Desconocida";
        const ref = t.referencia_del_proceso || "S/R";
        const loc = `${t.departamento_entidad || ''} : ${t.ciudad_entidad || ''}`;
        const cleanLoc = loc === " : " ? "Nacional" : loc;

        let url = "#";
        const rawUrl = t.urlproceso;

        if (typeof rawUrl === 'string') {
            url = rawUrl;
        } else if (rawUrl && typeof rawUrl === 'object' && rawUrl.url) {
            url = rawUrl.url;
        }

        interestsByUserId[uid].push({
            id: fav.tenderId,
            title,
            entidad,
            reference: ref,
            url,
            modality,
            price,
            deadline,
            location: cleanLoc
        });
    });

    const calculateExperience = (dateToCheck: string | Date | undefined) => {
        if (!dateToCheck) return "N/A";
        const start = new Date(dateToCheck);
        const now = new Date();
        const diff = now.getFullYear() - start.getFullYear();
        return diff >= 0 ? `${diff} Años` : "N/A";
    };

    // Prepare data for Client Component
    const analysisData: AnalysisCompany[] = companies.map((company: any) => {
        const user = company.userId;
        const interests = interestsByUserId[user?._id?.toString()] || [];
        const yearsExp = calculateExperience(company.creationDate);

        return {
            id: company._id.toString(),
            companyName: company.companyName || "Sin Nombre",
            legalRepresentative: company.legalRepresentative || "",
            email: user?.email || "",
            creationDate: company.creationDate ? new Date(company.creationDate).toISOString() : "",
            yearsExperience: yearsExp,
            unspscCodes: company.unspscCodes || [],
            interests: interests
        };
    });

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex-none space-y-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Análisis de Procesos</h1>
                    <p className="text-muted-foreground mt-1">
                        Visión general del interés de las empresas en los procesos de contratación.
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Empresas Registradas</p>
                            <h3 className="text-xl font-bold text-gray-900">{totalCompanies}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-2 bg-yellow-50 rounded-lg">
                            <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Intereses</p>
                            <h3 className="text-xl font-bold text-gray-900">{totalInterests}</h3>
                            <p className="text-[10px] text-green-600 font-medium">Global</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table Component */}
            <div className="flex-1 min-h-0">
                <AnalysisTable data={analysisData} />
            </div>
        </div>
    );
}
