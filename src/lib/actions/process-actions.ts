"use server";

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import SavedOpportunity from "@/lib/models/SavedOpportunity";
import Tender from "@/lib/models/Tender";
import BiddingProcess from "@/lib/models/BiddingProcess";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { revalidatePath } from "next/cache";

export async function updateProcessNotes(tenderId: string, notes: string) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await dbConnect();

        await SavedOpportunity.findOneAndUpdate(
            { userId: session.user.id, tenderId: tenderId },
            {
                $set: {
                    notes: notes,
                    updatedAt: new Date()
                }
            }
        );

        revalidatePath("/dashboard/interests");
        return { success: true };
    } catch (error) {
        console.error("Error updating notes:", error);
        return { success: false, error: "Database error" };
    }
}

export async function checkInterestStatus(referenciaProceso: string) {
    const session = await auth();
    if (!session?.user) return 'NONE';

    await dbConnect();

    // Support querying by Reference or ID (legacy)
    let tender = await Tender.findOne({ referencia_proceso: referenciaProceso });

    // If not found by reference, try to find by _id (if the passed arg was an ID)
    if (!tender && referenciaProceso.match(/^[0-9a-fA-F]{24}$/)) {
        tender = await Tender.findById(referenciaProceso);
    }

    if (!tender) return 'NONE';

    // Check Participation first (higher priority)
    const participation = await BiddingProcess.findOne({ userId: session.user.id, tenderId: tender._id });
    if (participation) return 'PARTICIPATING';

    const saved = await SavedOpportunity.findOne({ userId: session.user.id, tenderId: tender._id });
    if (saved?.isFavorite) return 'INTERESTED';

    return 'NONE';
}

export async function toggleInterest(referenciaProceso: string, isInterested: boolean) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await dbConnect();

    const tender = await Tender.findOne({ referencia_proceso: referenciaProceso });
    if (!tender) throw new Error("Tender not found");

    if (isInterested) {
        await SavedOpportunity.findOneAndUpdate(
            { userId: session.user.id, tenderId: tender._id },
            {
                userId: session.user.id,
                tenderId: tender._id,
                tenderRef: referenciaProceso,
                isFavorite: true,
                status: 'INTERESTED'
            },
            { upsert: true }
        );
    } else {
        await SavedOpportunity.findOneAndUpdate(
            { userId: session.user.id, tenderId: tender._id },
            { isFavorite: false },
            { upsert: true }
        );
    }

    revalidatePath("/dashboard/opportunities");
    revalidatePath(`/dashboard/opportunities/${referenciaProceso}`);
    return { success: true };
}

export async function participateInProcess(referenciaProceso: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    console.log(`[participateInProcess] Iniciando para usuario ${session.user.id} y ref ${referenciaProceso}`);

    await dbConnect();
    const tender = await Tender.findOne({ referencia_proceso: referenciaProceso });

    if (!tender) {
        console.error(`[participateInProcess] Tender no encontrado para ref: ${referenciaProceso}`);
        // Intenta buscar por ID por si acaso
        if (referenciaProceso.match(/^[0-9a-fA-F]{24}$/)) {
            const tenderById = await Tender.findById(referenciaProceso);
            if (tenderById) {
                console.log(`[participateInProcess] Tender encontrado por ID en fallback.`);
                // Recursivamente llamar con la referencia correcta si se halló por ID
                if (tenderById.referencia_proceso) {
                    return participateInProcess(tenderById.referencia_proceso);
                }
            }
        }
        return { success: false, error: "Tender not found in DB" };
    }

    console.log(`[participateInProcess] Tender encontrado: ${tender._id}`);

    // Check if already exists
    const existing = await BiddingProcess.findOne({ userId: session.user.id, tenderId: tender._id });
    if (existing) {
        console.log(`[participateInProcess] Ya existe proceso: ${existing._id}`);
        // Just return the existing ID
        return { success: true, id: existing._id };
    }

    // Logic for Point 5: Initialize with smart defaults based on type/content
    const desc = (tender.descripcion || "").toLowerCase();
    const isObra = desc.includes("obra") || desc.includes("construccion") || desc.includes("mantenimiento de via");

    const defaultDocs = [
        { name: "Carta de Presentación de la Oferta", type: "TEMPLATE" },
        { name: "Certificado de Existencia y Rep. Legal", type: "LEGAL" },
        { name: "Cédula Representante Legal", type: "LEGAL" },
        { name: "RUT Actualizado", type: "LEGAL" },
        { name: "Certificado Contraloría, Procuraduría y Policía", type: "LEGAL" },
        { name: "Garantía de Seriedad de la Oferta", type: "FINANCIAL" },
    ];

    if (isObra) {
        console.log(`[participateInProcess] Detectado tipo OBRA, añadiendo docs extra.`);
        defaultDocs.push({ name: "Certificado RUP (Experiencia)", type: "TECHNICAL" });
        defaultDocs.push({ name: "Certificado K de Contratación", type: "FINANCIAL" });
        defaultDocs.push({ name: "Hoja de Vida Director de Obra", type: "TECHNICAL" });
    } else {
        defaultDocs.push({ name: "Certificaciones de Experiencia", type: "TECHNICAL" });
    }

    // Default Tasks based on typical Timeline
    const tasks = [
        { title: "Lectura detallada de pliegos", order: 1 },
        { title: "Solicitar póliza de seriedad", order: 2 },
        { title: "Elaborar propuesta técnica", order: 3 },
        { title: "Recopilar documentos legales", order: 4 },
        { title: "Subir oferta a SECOP II", order: 5 },
    ];

    try {
        const newProcess = await BiddingProcess.create({
            userId: session.user.id,
            tenderId: tender._id,
            tenderRef: referenciaProceso,
            status: 'EN_PROCESO',
            progress: 0,
            requiredDocuments: defaultDocs,
            tasks: tasks
        });

        console.log(`[participateInProcess] Proceso creado exitosamente: ${newProcess._id}`);

        // Also mark as interested/saved automatically as 'PARTICIPATING'
        await SavedOpportunity.findOneAndUpdate(
            { userId: session.user.id, tenderId: tender._id },
            {
                userId: session.user.id,
                tenderId: tender._id,
                tenderRef: referenciaProceso,
                isFavorite: true,
                status: 'PARTICIPATING'
            },
            { upsert: true }
        );

        revalidatePath("/dashboard/opportunities");
        return { success: true, id: newProcess._id.toString() };
    } catch (e: any) {
        console.error(`[participateInProcess] Error creando proceso:`, e);
        return { success: false, error: e.message || "Error creating process" };
    }
}

export async function getBiddingProcess(identifier: string) {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // ID can be the BiddingProcess _id OR the Tender Reference
    // First try by BiddingProcess _id
    let process: any = null;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        process = await BiddingProcess.findOne({ _id: identifier, userId: session.user.id }).populate('tenderId');
    }

    // If not found (or if identifier wasn't an ID), try by Tender Reference + UserId
    // If not found (or if identifier wasn't an ID), try by Tender Reference + UserId
    if (!process) {
        // Admin override or User specific check
        const query: any = { tenderRef: identifier };
        if ((session.user as any).role !== 'admin') {
            query.userId = session.user.id;
        }

        process = await BiddingProcess.findOne(query).populate('tenderId');
    }

    if (!process) {
        // Try fetching by ID without userId constraint if admin
        if ((session.user as any).role === 'admin' && identifier.match(/^[0-9a-fA-F]{24}$/)) {
            process = await BiddingProcess.findById(identifier).populate('tenderId');
        }
    }

    if (!process) return null;

    // Security check: if not admin, ensure ownership
    if ((session.user as any).role !== 'admin' && process.userId !== session.user.id) {
        return null;
    }

    // Get Company Profile for Docs (target user's profile, not admin's if viewing others)
    const companyProfile = await CompanyProfile.findOne({ userId: process.userId }).lean();

    // Serializable object for client
    return {
        process: JSON.parse(JSON.stringify(process)),
        companyProfile: companyProfile ? JSON.parse(JSON.stringify(companyProfile)) : null
    };
}

export async function updateDocumentStatus(processId: string, docId: string, status: string, fileUrl?: string) {
    const session = await auth();
    if (!session?.user) return { success: false };

    await dbConnect();

    const update: any = {
        "requiredDocuments.$.status": status,
        "updatedAt": new Date()
    };

    if (fileUrl !== undefined) {
        update["requiredDocuments.$.fileUrl"] = fileUrl;
        if (status === 'UPLOADED') {
            update["requiredDocuments.$.uploadedAt"] = new Date();
        }
    }

    await BiddingProcess.updateOne(
        { _id: processId, userId: session.user.id, "requiredDocuments._id": docId },
        { $set: update }
    );

    // Recalculate progress
    await recalculateProgress(processId, session.user.id!);

    revalidatePath(`/dashboard/bidding/${processId}`);
    return { success: true };
}

export async function updateTaskStatus(processId: string, taskId: string, isCompleted: boolean) {
    const session = await auth();
    if (!session?.user) return { success: false };

    await dbConnect();

    await BiddingProcess.updateOne(
        { _id: processId, userId: session.user.id, "tasks._id": taskId },
        {
            $set: {
                "tasks.$.isCompleted": isCompleted,
                "updatedAt": new Date()
            }
        }
    );

    // Recalculate progress
    await recalculateProgress(processId, session.user.id!);

    revalidatePath(`/dashboard/bidding/${processId}`);
    return { success: true };
}

export async function getCoverLetterData(processId: string) {
    const session = await auth();
    if (!session?.user) return null;

    await dbConnect();

    // 1. Get Process with Tender
    const process = await BiddingProcess.findById(processId).populate('tenderId');
    if (!process || process.userId !== session.user.id) return null;

    // 2. Get Company Profile
    const profile = await CompanyProfile.findOne({ userId: session.user.id });

    // 3. Construct Data Pack
    const data = {
        company: {
            name: profile?.companyName || session.user.name || "Nombre de Empresa",
            nit: profile?.nit || "NIT/CC XXXX",
            representative: profile?.legalRepresentative || session.user.name || "Representante Legal",
            address: profile?.address || "Dirección Física",
            city: profile?.city || "Ciudad",
            email: session.user.email || profile?.website || "contacto@email.com",
            phone: profile?.phone || "Teléfono"
        },
        tender: {
            entity: process.tenderId?.entidad || "ENTIDAD CONTRATANTE",
            reference: process.tenderId?.referencia_proceso || "REFERENCIA",
            object: process.tenderId?.descripcion || process.tenderId?.objeto || "Objeto del Contrato...",
            city: process.tenderId?.ciudad || process.tenderId?.departamento || "Ciudad Destino"
        },
        date: new Date().toISOString()
    };

    return JSON.parse(JSON.stringify(data));
}

export async function updateProcessStatus(processId: string, status: string, dateStr?: string) {
    const session = await auth();
    if (!session?.user) return { success: false };

    await dbConnect();

    const update: any = {
        status: status,
        updatedAt: new Date()
    };

    if (dateStr) {
        update.statusDate = new Date(dateStr);
    }

    await BiddingProcess.updateOne(
        { _id: processId, userId: session.user.id },
        { $set: update }
    );

    revalidatePath(`/dashboard/bidding/${processId}`);
    revalidatePath(`/dashboard`);
    return { success: true };
}

// Helper to recalculate progress
async function recalculateProgress(processId: string, userId: string) {
    const process = await BiddingProcess.findOne({ _id: processId, userId });
    if (!process) return;

    const totalDocs = process.requiredDocuments?.length || 0;
    const completedDocs = process.requiredDocuments?.filter((d: any) => d.status === 'UPLOADED' || d.status === 'REVIEWED').length || 0;

    const totalTasks = process.tasks?.length || 0;
    const completedTasks = process.tasks?.filter((t: any) => t.isCompleted).length || 0;

    const total = totalDocs + totalTasks;
    const completed = completedDocs + completedTasks;

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await BiddingProcess.updateOne({ _id: processId }, { $set: { progress } });
}
