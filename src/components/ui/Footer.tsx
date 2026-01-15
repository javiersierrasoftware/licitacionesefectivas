import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-xl font-bold text-primary tracking-tight">
                                Licitaciones<span className="text-secondary">Efectivas</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                            Facilitamos el acceso a oportunidades de contratación pública con tecnología y asesoría experta.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Servicios
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Casos de Éxito
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Servicios</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Consultoría SECOP II
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Búsqueda de Licitaciones
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Representación Legal
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Capacitación
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-primary mr-2 shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                    Carrera 38 # 22 – 29 <br />Sincelejo, Colombia
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-primary mr-2 shrink-0" />
                                <span className="text-sm text-muted-foreground">+57 (601) 123 4567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-primary mr-2 shrink-0" />
                                <span className="text-sm text-muted-foreground">contacto@licitaciones.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center bg-gray-50">
                    <p className="text-xs text-gray-400">
                        © {new Date().getFullYear()} Licitaciones Efectivas S.A.S. Todos los derechos reservados.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="#" className="text-xs text-gray-400 hover:text-primary">
                            Política de Privacidad
                        </Link>
                        <Link href="#" className="text-xs text-gray-400 hover:text-primary">
                            Términos de Uso
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
