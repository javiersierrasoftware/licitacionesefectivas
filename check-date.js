
async function debug() {
    // Native fetch is available in Node 18+
    console.log("Checking latest SECOP data...");
    const url = "https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=5&$order=fecha_de_publicacion_del DESC";

    try {
        const res = await fetch(url);
        const data = await res.json();

        console.log("Latest 5 records dates:");
        data.forEach(d => {
            console.log(`- Ref: ${d.referencia_del_proceso} | Date: ${d.fecha_de_publicacion_del} | Fase: ${d.fase}`);
        });

        if (data.length > 0) {
            console.log("\nCurrent System Date vs Latest API Date:");
            console.log("System:", new Date().toISOString());
            console.log("API:   ", data[0].fecha_de_publicacion_del);
        }

    } catch (e) {
        console.error(e);
    }
}

debug();
