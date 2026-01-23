"use server";

import { auth } from "@/auth";
import OpenAI from "openai";

interface AnalysisResult {
    summary: string;
    requirements: string[];
    risks: string[];
    score: number;
}

export async function analyzeTender(tenderData: any): Promise<{ success: boolean; data?: AnalysisResult; error?: string }> {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback if no key
    if (!apiKey) {
        console.warn("OPENAI_API_KEY missing, using Mock Fallback");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return mockAnalysis(tenderData);
    }

    try {
        const openai = new OpenAI({ apiKey });

        // Construct a rich context from the tender data
        const context = `
        ANALIZAR LICITACIÓN PÚBLICA COLOMBIANA (SECOP II).
        
        INFORMACIÓN DEL PROCESO:
        - Objeto/Descripción: ${tenderData.descripcion || tenderData.objeto}
        - Entidad Contratante: ${tenderData.entidad}
        - Referencia: ${tenderData.referencia_proceso}
        - Modalidad: ${tenderData.modalidad}
        - Cuantía/Presupuesto: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(tenderData.precio_base)}
        - Ubicación: ${tenderData.ciudad}, ${tenderData.departamento}
        - Códigos UNSPSC: ${tenderData.codigos_unspsc?.join(", ")}
        - Fase Actual: ${tenderData.fase}
        
        TAREA:
        Actúa como un experto consultor en contratación estatal.
        Realiza un análisis rápido de oportunidades y riesgos.

        SALIDA JSON REQUERIDA (JSON VÁLIDO):
        {
            "summary": "Resumen ejecutivo de 2-3 frases.",
            "requirements": ["Requisito 1", "Requisito 2", "Requisito 3"],
            "risks": ["Riesgo 1", "Riesgo 2"],
            "score": 85
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fast and cost-effective
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: "Eres un asistente experto en licitaciones públicas. Responde siempre en JSON válido." },
                { role: "user", content: context }
            ],
            temperature: 0.7,
        });

        const content = completion.choices[0].message.content;

        if (!content) throw new Error("Empty response from OpenAI");

        try {
            const jsonParams = JSON.parse(content);
            return {
                success: true,
                data: {
                    summary: jsonParams.summary || "Sin resumen disponible.",
                    requirements: Array.isArray(jsonParams.requirements) ? jsonParams.requirements : [],
                    risks: Array.isArray(jsonParams.risks) ? jsonParams.risks : [],
                    score: typeof jsonParams.score === 'number' ? jsonParams.score : 50
                }
            };
        } catch (parseError) {
            console.error("Error parsing OpenAI JSON:", content);
            return { success: false, error: "Error interpretando respuesta de IA" };
        }

    } catch (error) {
        console.error("OpenAI API Error (Falling back to Mock):", error);
        return mockAnalysis(tenderData);
    }
}

// Enhanced mock function for better UX when API is down/unpaid - Updated Description
function mockAnalysis(tenderData: any): { success: boolean, data: AnalysisResult } {
    const desc = (tenderData.descripcion || "").toLowerCase();
    const objeto = (tenderData.objeto || "").toLowerCase();
    const fullText = desc + " " + objeto;

    let summary = "";
    let requirements: string[] = [];
    let risks: string[] = [];
    let score = 60;

    // Simple keyword-based logic to mimic AI
    if (fullText.includes("obra") || fullText.includes("construccion") || fullText.includes("mantenimiento vial")) {
        summary = "Este proceso corresponde a ejecución de obras civiles. SUGERENCIA: Revisar Cronograma y Presupuesto por volatilidad de materiales.";
        requirements = [
            "Experiencia en códigos RUP de Construcción.",
            "Personal: Director de Obra (>5 años exp), Residente.",
            "Capacidad Financiera: K de Contratación robusto."
        ];
        risks = [
            "Plazos de ejecución ajustados.",
            "Requiere visita de obra obligatoria."
        ];
        score = 75;
    } else if (fullText.includes("interventoria") || fullText.includes("consultoria") || fullText.includes("estudios")) {
        summary = "Concurso de Méritos (Servicios Intelectuales). La propuesta técnica y experiencia del equipo son determinantes.";
        requirements = [
            "Experiencia específica en interventoría similar.",
            "Equipo multidisciplinario (Ingenieros, Jurídicos).",
            "Certificación ISO 9001."
        ];
        risks = [
            "Evaluación subjetiva de metodología.",
            "Tarifas reguladas."
        ];
        score = 80;
    } else if (fullText.includes("suministro") || fullText.includes("adquisicion") || fullText.includes("compra")) {
        summary = "Adquisición de Bienes (Precio es decisivo). Probable Subasta Inversa o Mínima Cuantía.";
        requirements = [
            "Fichas técnicas detalladas.",
            "Carta de distribuidor autorizado.",
            "Tiempos de entrega cortos (<15 días)."
        ];
        risks = [
            "Alta competencia en precios.",
            "Penalizaciones estrictas."
        ];
        score = 65;
        // Default case
    } else {
        summary = "Servicios Profesionales / Apoyo a la Gestión. Se evalúa perfil e idoneidad.";
        requirements = [
            "Título profesional y postgrado afín.",
            "Experiencia general > 24 meses.",
            "Experiencia en sector público."
        ];
        risks = [
            "Contrato sujeto a renovación.",
            "Pago contra informes de actividades."
        ];
        score = 85;
    }

    summary += " (Nota: Análisis generado offline. Configura OpenAI API Key para activar IA).";

    return {
        success: true,
        data: {
            summary,
            requirements,
            risks,
            score
        }
    };
}
