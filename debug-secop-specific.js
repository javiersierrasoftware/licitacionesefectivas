const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";
const code = '72100000'; // One of the user's codes
const where = `estado_de_apertura_del_proceso = 'Abierto' AND codigo_principal_de_categoria IN ('${code}','V1.${code}')`;

const params = new URLSearchParams({
    "$where": where,
    "$limit": "10",
    "$order": "fecha_de_publicacion_del DESC"
});

console.log("Querying precise:", `${baseUrl}?${params}`);

fetch(`${baseUrl}?${params}`)
    .then(r => r.json())
    .then(d => {
        console.log("Results count:", d.length);
        if (d.length === 0) {
            console.log("Trying broader search (starts with 7210)...");
            const where2 = `estado_de_apertura_del_proceso = 'Abierto' AND starts_with(codigo_principal_de_categoria, 'V1.7210')`;
            const params2 = new URLSearchParams({
                "$where": where2,
                "$limit": "5",
                "$order": "fecha_de_publicacion_del DESC"
            });
            console.log("Querying broader:", `${baseUrl}?${params2}`);
            return fetch(`${baseUrl}?${params2}`);
        }
    })
    .then(r => r ? r.json() : null)
    .then(d => {
        if (d) {
            console.log("Broader results count:", d.length);
            if (d.length > 0) {
                console.log("Example Code found:", d[0].codigo_principal_de_categoria);
                console.log("Example Title:", d[0].descripci_n_del_procedimiento);
            }
        }
    })
    .catch(e => console.error(e));
