export default function CookiesPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
            <div className="prose prose-blue max-w-none text-gray-700">
                <p>Última actualización: {new Date().getFullYear()}</p>

                <h3>1. ¿Qué son las cookies?</h3>
                <p>
                    Las cookies son pequeños archivos de texto que los sitios web que visita colocan en su ordenador.
                    Se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente,
                    así como para proporcionar información a los propietarios del sitio.
                </p>

                <h3>2. Cómo usamos las cookies</h3>
                <p>
                    Utilizamos cookies para:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Entender y guardar sus preferencias para futuras visitas.</li>
                        <li>Compilar datos agregados sobre el tráfico y la interacción del sitio.</li>
                        <li>Facilitar el proceso de inicio de sesión y seguridad.</li>
                    </ul>
                </p>

                <h3>3. Control de cookies</h3>
                <p>
                    La mayoría de los navegadores web le permiten controlar las cookies a través de la configuración de preferencias.
                    Sin embargo, si limita la capacidad de los sitios web para establecer cookies, puede empeorar su experiencia general de usuario.
                </p>
            </div>
        </div>
    );
}
