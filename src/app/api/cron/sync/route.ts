import { NextResponse } from 'next/server';
import dbConnect from "@/lib/db";
import Tender from "@/lib/models/Tender";
import { fetchSecopOpportunities } from "@/lib/services/secop";

export const dynamic = 'force-dynamic'; // Prevent caching so Cron runs fresh

export async function GET(request: Request) {
    // Basic security: check for a secret key if needed, or allow public trigger for now with rate limiting implied by Vercel
    // For prototype, we'll keep it open or check a query param

    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    await dbConnect();

    try {
        console.log("Starting SECOP Sync Cron Job...");

        // Fetch latest 50 opportunities globally (no specific codes)
        // We modify fetchSecopOpportunities to handle "no codes" = global fetch automatically
        const secopData = await fetchSecopOpportunities([]);

        console.log(`Fetched ${secopData.length} items from SECOP API.`);

        if (secopData.length > 0) {
            console.log("DEBUG: Keys in first item:", Object.keys(secopData[0]));
        }

        let newCount = 0;
        let updatedCount = 0;

        // Helper to safely parse dates or return null/fallback
        const safeDate = (dateStr: string | undefined): Date | null => {
            if (!dateStr) return null;
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        };

        for (const item of secopData) {
            // Check if exists
            const existing = await Tender.findOne({ referencia_proceso: item.referencia_del_proceso });

            // Handle URL object/string weirdness
            const rawUrl = item.urlproceso;
            let url = "";
            if (typeof rawUrl === 'string') url = rawUrl;
            else if (rawUrl && typeof rawUrl === 'object') url = (rawUrl as any).url;

            // Safe Parse Dates - Try multiple known keys for publication date
            // Cast item to any to bypass interface strictness for debug/fallback check
            const rawItem = item as any;
            let pubDate = safeDate(rawItem.fecha_de_publicacion_del || rawItem.fecha_de_publicacion);
            const closeDate = safeDate(rawItem.fecha_de_recepcion_de_ofertas);

            // If publication date is missing (common in some SECOP records), default to NOW so it appears as recent
            if (!pubDate) {
                console.warn(`Date missing for process ${item.referencia_del_proceso}. Defaulting to NOW.`);
                pubDate = new Date(); // Fallback to current time
            }

            const tenderData = {
                referencia_proceso: item.referencia_del_proceso,
                entidad: item.entidad,
                descripcion: item.descripci_n_del_procedimiento,
                objeto: item.descripci_n_del_procedimiento,
                modalidad: item.modalidad_de_contratacion,
                precio_base: Number(item.precio_base),
                fecha_publicacion: pubDate, // Guaranteed valid Date here
                fecha_recepcion_ofertas: closeDate,
                departamento: item.departamento_entidad,
                ciudad: item.ciudad_entidad,
                codigos_unspsc: item.codigo_principal_de_categoria ? [item.codigo_principal_de_categoria] : [],
                url_proceso: url,
                fase: item.fase,
                raw_data: item
            };

            if (!existing) {
                await Tender.create(tenderData);
                newCount++;
            } else {
                // Optional: Update status if changed
                if (existing.fase !== item.fase) {
                    await Tender.updateOne({ _id: existing._id }, { fase: item.fase, updated_at: new Date() });
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                fetched: secopData.length,
                newly_created: newCount,
                updated: updatedCount
            }
        });

    } catch (error: any) {
        console.error("Cron Job Failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
