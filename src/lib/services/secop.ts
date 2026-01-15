export interface SecopTender {
    referencia_del_proceso: string;
    entidad: string;
    nit_entidad: string;
    departamento_entidad: string;
    ciudad_entidad: string;
    descripci_n_del_procedimiento: string; // Correct Socrata key
    precio_base: string;
    fase: string; // Use 'fase' instead of 'estado_del_proceso'
    fecha_de_publicacion_del: string; // Correct key
    modalidad_de_contratacion: string;
    urlproceso: { url: string } | string; // Can be object or string depending on parsing
    codigo_principal_de_categoria: string;
}

export async function fetchSecopOpportunities(unspscCodes: string[] = []) {
    // SECOP II - Procesos de Contratación (p6dx-8zbt)
    const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

    // Socrata 'fase' for active tenders
    const whereClauseParts = ["(fase = 'Presentación de oferta' OR fase = 'Publicado')"];

    // Filter by codes if provided
    if (unspscCodes && unspscCodes.length > 0) {
        const uniqueCodes = [...new Set(unspscCodes)];
        // Prefix with V1. as observed in dataset (e.g., V1.80111600)
        // We search for both raw code and V1. prefixed code to be safe
        const codesList = uniqueCodes.flatMap(c => [`'${c}'`, `'V1.${c}'`]).join(",");
        whereClauseParts.push(`codigo_principal_de_categoria IN (${codesList})`);
    }

    const params = new URLSearchParams({
        "$where": whereClauseParts.join(" AND "),
        "$limit": "20",
        "$order": "fecha_de_publicacion_del DESC"
    });

    const fullUrl = `${baseUrl}?${params.toString()}`;
    console.log("Fetching SECOP V2 URL:", fullUrl);

    try {
        const res = await fetch(fullUrl, {
            next: { revalidate: 300 } // Cache for 5 min
        });

        if (!res.ok) {
            console.error("SECOP API Error Status:", res.status);
            const text = await res.text();
            console.error("SECOP API Error Body:", text);
            return [];
        }

        const data = await res.json();
        console.log(`Found ${data.length} opportunities`);
        return data as SecopTender[];
    } catch (error) {
        console.error("SECOP API Network Error", error);
        return [];
    }
}
