const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";
const code = '80111600'; // Code seen in generic result
const where = `estado_de_apertura_del_proceso = 'Abierto' AND codigo_principal_de_categoria IN ('${code}','V1.${code}')`;

const params = new URLSearchParams({
    "$where": where,
    "$limit": "10",
    "$order": "fecha_de_publicacion_del DESC"
});

console.log("Querying with known code:", `${baseUrl}?${params}`);

fetch(`${baseUrl}?${params}`)
    .then(r => r.json())
    .then(d => {
        console.log("Results count:", d.length);
        if (d.length > 0) {
            console.log("First result:", JSON.stringify(d[0], null, 2));
        }
    })
    .catch(e => console.error(e));
