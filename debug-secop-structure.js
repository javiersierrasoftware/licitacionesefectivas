const baseUrl = "https://www.datos.gov.co/resource/p6dx-8zbt.json";

const params2 = new URLSearchParams({
    "$limit": "1",
    "$order": "fecha_de_publicacion_del DESC"
});

console.log("Querying generic:", `${baseUrl}?${params2}`);

fetch(`${baseUrl}?${params2}`)
    .then(r => r.json())
    .then(d => {
        if (d && d.length > 0) {
            console.log("First result keys:", Object.keys(d[0]));
            console.log("First result full:", JSON.stringify(d[0], null, 2));
        } else {
            console.log("No results found.");
        }
    })
    .catch(e => console.error(e));
