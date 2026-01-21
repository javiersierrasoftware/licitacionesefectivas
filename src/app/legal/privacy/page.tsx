export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
            <div className="prose prose-blue max-w-none text-gray-700">
                <p>Última actualización: {new Date().getFullYear()}</p>

                <h3>1. Información que recopilamos</h3>
                <p>
                    En Licitaciones Efectivas, recopilamos información personal que usted nos proporciona voluntariamente al registrarse,
                    suscribirse a nuestros planes o contactarnos. Esto puede incluir su nombre, dirección de correo electrónico,
                    información de la empresa y datos de pago.
                </p>

                <h3>2. Uso de la información</h3>
                <p>
                    Utilizamos su información para:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Proporcionar y mantener nuestros servicios.</li>
                        <li>Notificarle sobre cambios en nuestros servicios.</li>
                        <li>Permitirle participar en funciones interactivas.</li>
                        <li>Proporcionar soporte al cliente.</li>
                        <li>Recopilar análisis para mejorar nuestro servicio.</li>
                    </ul>
                </p>

                <h3>3. Protección de datos</h3>
                <p>
                    La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión a través de Internet
                    o método de almacenamiento electrónico es 100% seguro.
                </p>

                <h3>4. Contacto</h3>
                <p>
                    Si tiene preguntas sobre esta Política de Privacidad, contáctenos en contacto@licitacionesefectivas.com.
                </p>
            </div>
        </div>
    );
}
