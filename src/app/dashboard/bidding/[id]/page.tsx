import { getBiddingProcess } from "@/lib/actions/process-actions";
import { BiddingManager } from "@/components/dashboard/bidding/BiddingManager";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BiddingProcessPage({ params }: PageProps) {
    const { id } = await params;

    const data = await getBiddingProcess(id);

    if (!data || !data.process) {
        redirect("/dashboard/opportunities");
    }

    return (
        <div className="container mx-auto py-6 px-4 md:px-0">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Gestión de Licitación
            </h1>
            <BiddingManager process={data.process} companyProfile={data.companyProfile} />
        </div>
    );
}
