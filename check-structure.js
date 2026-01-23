
async function debug() {
    console.log("Checking date fields in SECOP data...");
    const url = "https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=1&$order=fecha_de_publicacion_del DESC"; // Trying sorting by what we think is the key

    try {
        const res = await fetch(url);
        const data = await res.json();
        const item = data[0];
        console.log("Keys found:", Object.keys(item));
        console.log("----------------");
        // Print anything looking like a date
        Object.keys(item).forEach(k => {
            if (k.includes('fecha') || k.includes('date')) {
                console.log(`${k}: ${item[k]}`);
            }
        });

    } catch (e) {
        console.error(e);
    }
}
debug();
