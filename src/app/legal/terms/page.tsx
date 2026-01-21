export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Términos de Uso</h1>
            <div className="prose prose-blue max-w-none text-gray-700">
                <p>Última actualización: {new Date().getFullYear()}</p>

                <h3>1. Aceptación de los términos</h3>
                <p>
                    Al acceder y utilizar este sitio web y sus servicios, usted acepta estar sujeto a estos Términos de Uso y a todas las leyes aplicables.
                    Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                </p>

                <h3>2. Uso del servicio</h3>
                <p>
                    Se le concede una licencia limitada, no exclusiva e intransferible para acceder y utilizar el servicio estrictamente de acuerdo con estos términos.
                </p>

                <h3>3. Cuentas</h3>
                <p>
                    Al crear una cuenta con nosotros, debe proporcionarnos información precisa, completa y actual.
                    El incumplimiento de esto constituye una violación de los términos, que puede resultar en la terminación inmediata de su cuenta.
                </p>

                <h3>4. Propiedad Intelectual</h3>
                <p>
                    El servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de Licitaciones Efectivas S.A.S. y sus licenciantes.
                </p>

                <h3>5. Terminación</h3>
                <p>
                    Podemos terminar o suspender su acceso inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo,
                    incluido, entre otros, si incumple los Términos.
                </p>
            </div>
        </div>
    );
}
