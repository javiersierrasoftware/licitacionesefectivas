const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";
const code = '43230000';
const where = `(fase = 'Presentación de oferta' OR fase = 'Publicado' OR fase = 'Convocatoria') AND codigo_principal_de_categoria IN ('${code}','V1.${code}')`;

const params = new URLSearchParams({
    "$where": where,
    "$limit": "10",
    "$order": "fecha_de_publicacion_del DESC"
});

console.log("Querying:", `${baseUrl}?${params}`);

fetch(`${baseUrl}?${params}`)
    .then(r => r.json())
    .then(d => {
        console.log("Results count:", d.length);
        if (d.length > 0) {
            console.log("First result:", JSON.stringify(d[0], null, 2));
        } else {
            // Try without codes to check if API works at all
            console.log("No results with code. Checking generic availability...");
            const params2 = new URLSearchParams({
                "$limit": "1",
                "$order": "fecha_de_publicacion_del DESC"
            });
            return fetch(`${baseUrl}?${params2}`);
        }
    })
    .then(r => r ? r.json() : null)
    .then(d => {
        if (d) {
            console.log("Generic check result:", d.length);
            console.log("Latest tender fase:", d[0]?.fase);
            console.log("Latest tender code:", d[0]?.codigo_principal_de_categoria);
        }
    })
    .catch(e => console.error(e));
