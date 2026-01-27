// A curated list of common UNSPSC segments/families for the prototype
// In a real app, this would be a full database collection of 50,000+ codes.

export const commonUnspscCodes = [
    { code: "43230000", name: "Software" },
    { code: "43232600", name: "Software de gestión de bases de datos" },
    { code: "80101500", name: "Servicios de consultoría de negocios y administración" },
    { code: "80111600", name: "Servicios de administración de proyectos" },
    { code: "81110000", name: "Servicios informáticos" },
    { code: "81112000", name: "Servicios de ingeniería de software o hardware" },
    { code: "72100000", name: "Mantenimiento y reparación de edificios y maquinarias" },
    { code: "72101500", name: "Servicios de mantenimiento y reparación de edificios" },
    { code: "72102900", name: "Servicios de mantenimiento de planta y suelo" },
    { code: "53100000", name: "Ropa" },
    { code: "53101600", name: "Camisas y blusas" },
    { code: "53102700", name: "Uniformes" },
    { code: "42130000", name: "Tejidos y materiales de cuero" },
    { code: "90100000", name: "Restaurantes y abastecimiento (Catering)" },
    { code: "90101500", name: "Servicios de comedores y cafeterías" },
    { code: "90101600", name: "Servicios de banquetes y catering" },
    { code: "39100000", name: "Lámparas y bombillas y componentes para lámparas" },
    { code: "39110000", name: "Iluminación, artefactos y accesorios" },
    { code: "44100000", name: "Maquinaria de oficina" },
    { code: "44120000", name: "Suministros de oficina" },
    { code: "82100000", name: "Publicidad" },
    { code: "82101500", name: "Publicidad impresa" },
    { code: "82101600", name: "Difusión de publicidad" },
    { code: "71100000", name: "Servicios de minería" },
    { code: "71110000", name: "Servicios de perforación y exploración de petróleo y gas" },
    { code: "95110000", name: "Vías públicas y carreteras" },
    { code: "95120000", name: "Construcción de edificios" },
    { code: "85100000", name: "Servicios de salud integral" },
    { code: "85120000", name: "Servicios de práctica médica" },
    { code: "41100000", name: "Equipo de laboratorio y científico" },
    { code: "41120000", name: "Suministros y accesorios de laboratorio" },
    { code: "50100000", name: "Frutas y verduras y frutos secos" },
    { code: "50110000", name: "Productos de carne y aves de corral" },
    { code: "50200000", name: "Bebidas" },
    { code: "84110000", name: "Servicios contables y de auditoría" },
    { code: "84120000", name: "Servicios bancarios y de inversión" },
    { code: "80141600", name: "Servicios de relaciones públicas" },
    { code: "80171500", name: "Servicios de investigación de mercado" },
    { code: "70151500", name: "Servicios de mantenimiento y reparación de vehículos" },
    { code: "25100000", name: "Vehículos de motor" },
    { code: "43190000", name: "Dispositivos de comunicaciones y accesorios" },
    { code: "43210000", name: "Equipos y accesorios de computadores" },
    { code: "55101500", name: "Materiales impresos (Libros, folletos)" },
    { code: "80111600", name: "Servicios de administración de proyectos" },
    { code: "72103300", name: "Servicios de mantenimiento y reparación de infraestructura" },
];

export function searchUnspscCodes(query: string) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return commonUnspscCodes.filter(
        item =>
            item.code.includes(lowerQuery) ||
            item.name.toLowerCase().includes(lowerQuery)
    );
}

export function getUnspscName(code: string) {
    return commonUnspscCodes.find(c => c.code === code)?.name || code;
}
