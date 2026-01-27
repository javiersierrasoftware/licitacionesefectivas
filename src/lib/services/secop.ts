export interface SecopTender {
    referencia_del_proceso: string;
    entidad: string;
    nit_entidad: string;
    departamento_entidad: string;
    ciudad_entidad: string;
    descripci_n_del_procedimiento: string; // Correct Socrata key
    precio_base: string;
    fase: string; // Use 'fase' instead of 'estado_del_proceso'
    estado_de_apertura_del_proceso: string; // New field for status
    fecha_de_publicacion_del: string; // Correct key
    fecha_de_publicacion?: string; // Fallback key
    modalidad_de_contratacion: string;
    urlproceso: { url: string } | string; // Can be object or string depending on parsing
    codigo_principal_de_categoria: string;
    fecha_de_recepcion_de_ofertas?: string; // Closing date
}

export async function fetchSecopOpportunities(unspscCodes: string[] = []) {
    // SECOP II - Procesos de Contratación (p6dx-8zbt)
    const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

    // Socrata 'fase' for active tenders
    // We remove strict date filtering to avoid issues with server time vs API time (2025 vs 2026)
    // We rely on $order DESC and $limit to get the "latest" available.
    const whereClauseParts = [
        "estado_de_apertura_del_proceso = 'Abierto'"
    ];

    // Filter by codes if provided
    if (unspscCodes && unspscCodes.length > 0) {
        const uniqueCodes = [...new Set(unspscCodes)];

        // Split into "Families" (ending in 0000) and Specifics
        const families = uniqueCodes.filter(c => c.endsWith("0000"));
        const specifics = uniqueCodes.filter(c => !c.endsWith("0000"));

        const conditions: string[] = [];

        // Specific codes: Exact match (checking raw and V1 prefix)
        if (specifics.length > 0) {
            const codesList = specifics.flatMap(c => [`'${c}'`, `'V1.${c}'`]).join(",");
            conditions.push(`codigo_principal_de_categoria IN (${codesList})`);
        }

        // Family codes: Use starts_with for broader match (e.g. 72100000 -> 7210...)
        // We match V1.prefix + first 4 digits
        if (families.length > 0) {
            const familyConditions = families.map(c => {
                const prefix = c.substring(0, 4); // First 4 digits
                return `(starts_with(codigo_principal_de_categoria, 'V1.${prefix}') OR starts_with(codigo_principal_de_categoria, '${prefix}'))`;
            });
            conditions.push(`(${familyConditions.join(" OR ")})`);
        }

        if (conditions.length > 0) {
            whereClauseParts.push(`(${conditions.join(" OR ")})`);
        }
    }

    const params = new URLSearchParams({
        "$where": whereClauseParts.join(" AND "),
        "$limit": "1000", // Increased limit to capture full 5 days
        "$order": "fecha_de_publicacion_del DESC"
    });

    const fullUrl = `${baseUrl}?${params.toString()}`;
    console.log("Fetching SECOP V2 URL:", fullUrl);

    try {
        const res = await fetch(fullUrl, {
            next: { revalidate: 0 } // No cache for fresh updates
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

export async function getSecopProcesoByRef(referencia: string): Promise<SecopTender | null> {
    const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

    // Exact match on reference
    const params = new URLSearchParams({
        "referencia_del_proceso": referencia,
        "$limit": "1"
    });

    try {
        const res = await fetch(`${baseUrl}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) return null;

        const data = await res.json();
        return data.length > 0 ? (data[0] as SecopTender) : null;
    } catch (error) {
        console.error("Error fetching single process:", error);
        return null;
    }
}

export async function countSecopOpportunities(unspscCodes: string[] = []): Promise<number> {
    const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";
    const whereClauseParts = ["estado_de_apertura_del_proceso = 'Abierto'"];

    if (unspscCodes && unspscCodes.length > 0) {
        const uniqueCodes = [...new Set(unspscCodes)];
        const families = uniqueCodes.filter(c => c.endsWith("0000"));
        const specifics = uniqueCodes.filter(c => !c.endsWith("0000"));
        const conditions: string[] = [];

        if (specifics.length > 0) {
            const codesList = specifics.flatMap(c => [`'${c}'`, `'V1.${c}'`]).join(",");
            conditions.push(`codigo_principal_de_categoria IN (${codesList})`);
        }
        if (families.length > 0) {
            const familyConditions = families.map(c => {
                const prefix = c.substring(0, 4);
                return `(starts_with(codigo_principal_de_categoria, 'V1.${prefix}') OR starts_with(codigo_principal_de_categoria, '${prefix}'))`;
            });
            conditions.push(`(${familyConditions.join(" OR ")})`);
        }
        if (conditions.length > 0) whereClauseParts.push(`(${conditions.join(" OR ")})`);
    }

    const params = new URLSearchParams({
        "$where": whereClauseParts.join(" AND "),
        "$select": "count(*)"
    });

    try {
        const res = await fetch(`${baseUrl}?${params.toString()}`, { next: { revalidate: 0 } });
        if (!res.ok) return 0;
        const data = await res.json();
        return data[0]?.count ? parseInt(data[0].count, 10) : 0;
    } catch (error) {
        console.error("SECOP Count Error", error);
        return 0;
    }
}
