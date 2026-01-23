
import { getCoverLetterData } from "@/lib/actions/process-actions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DownloadWordButton } from "@/components/dashboard/bidding/actions/DownloadWordButton";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CoverLetterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getCoverLetterData(id);

    if (!data) {
        return <div className="p-8 text-center text-red-600">No se pudieron cargar los datos para la carta.</div>;
    }

    const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

    return (
        <div className="bg-white min-h-screen p-8 md:p-16 text-black font-serif max-w-4xl mx-auto shadow-xl print:shadow-none print:p-0">
            {/* Print Controls */}
            <div className="mb-8 print:hidden border-b pb-4">
                <Link href={`/dashboard/bidding/${id}`} className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver al Proceso
                </Link>
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-sans font-bold text-gray-800">Vista Previa: Carta de Presentación</h1>
                    <div className="flex gap-4">
                        <DownloadWordButton data={data} />
                        <button
                            id="printBtn"
                            className="bg-gray-600 hover:bg-gray-700 text-white font-sans font-bold py-2 px-4 rounded shadow transition-colors"
                        >
                            Imprimir / Guardar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Script for button functionality */}
            <script dangerouslySetInnerHTML={{
                __html: `
                document.getElementById('printBtn').addEventListener('click', () => window.print());
            `}} />

            {/* Letter Content */}
            <div className="leading-relaxed text-justify space-y-6 text-sm md:text-base">

                {/* Header: Date + City */}
                <div className="text-right mb-12">
                    <p>{data.company.city}, {today}</p>
                </div>

                {/* Recipient */}
                <div className="mb-8 font-bold">
                    <p>Señores</p>
                    <p className="uppercase">{data.tender.entity}</p>
                    <p>Ciudad</p>
                </div>

                {/* Reference */}
                <div className="mb-8 text-right font-bold w-2/3 ml-auto border-t border-black pt-2">
                    <p>REFERENCIA: PROCESO No. {data.tender.reference}</p>
                </div>

                {/* Subject */}
                <div className="mb-8">
                    <p><span className="font-bold">OBJETO:</span> {data.tender.object}</p>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    <p>
                        Yo, <span className="font-bold uppercase">{data.company.representative}</span>,
                        identificado con cédula de ciudadanía, actuando en calidad de Representante Legal de
                        <span className="font-bold uppercase"> {data.company.name}</span>, identificada con NIT
                        <span className="font-bold"> {data.company.nit}</span>, me permito presentar propuesta para el proceso de la referencia.
                    </p>

                    <p>
                        Declaro bajo la gravedad de juramento que:
                    </p>

                    <ol className="list-decimal list-outside ml-6 space-y-2">
                        <li>Conozco y acepto en su integridad los pliegos de condiciones y demás documentos del proceso.</li>
                        <li>La propuesta que presento cumple con todos y cada uno de los requisitos exigidos.</li>
                        <li>No me encuentro incurso en ninguna causal de inhabilidad o incompatibilidad para contratar con el Estado.</li>
                        <li>La sociedad y su representante legal no se encuentran reportados en el Boletín de Responsables Fiscales de la Contraloría General de la República.</li>
                        <li>Mi oferta económica tiene una validez mínima de noventa (90) días calendario.</li>
                    </ol>

                    <p>
                        Así mismo, informo los datos de contacto para efectos de notificaciones:
                    </p>

                    <ul className="list-disc list-outside ml-6 text-sm">
                        <li><strong>Dirección:</strong> {data.company.address}</li>
                        <li><strong>Teléfono:</strong> {data.company.phone}</li>
                        <li><strong>Correo Electrónico:</strong> {data.company.email}</li>
                    </ul>
                </div>

                {/* Signature */}
                <div className="mt-24">
                    <div className="border-t border-black w-64 pt-2">
                        <p className="font-bold uppercase">{data.company.representative}</p>
                        <p>Representante Legal</p>
                        <p className="text-sm">{data.company.name}</p>
                        <p className="text-sm">{data.company.nit}</p>
                    </div>
                </div>

            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 2.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
}
