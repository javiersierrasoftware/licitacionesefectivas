"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
// import { cn } from "@/lib/utils"; // Unused
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Planes", href: "/planes" },
    { name: "Servicios", href: "#servicios" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Contacto", href: "/contactanos" },
];

import type { Session } from "next-auth";
import { logout } from "@/lib/actions";

export function Navbar({ session }: { session: Session | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith("/dashboard");
    const isLoginPage = pathname === "/login";

    if (isLoginPage) return null;

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <img src="/images/logolicitaciones.PNG" alt="Licitaciones Efectivas Logo" className="h-12 w-auto object-contain" />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={
                                pathname === "/"
                                    ? link.href
                                    : link.href.startsWith("/")
                                        ? link.href
                                        : `/${link.href}`
                            }
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {session ? (
                        <div className="flex items-center gap-2">
                            {isDashboard ? (
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/dashboard/profile">Mi Perfil</Link>
                                </Button>
                            ) : (
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/dashboard">Ir al Dashboard</Link>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => logout()} className="hover:bg-red-50 hover:text-red-600">
                                Salir
                            </Button>
                        </div>
                    ) : (
                        <Button variant="default" size="sm" asChild>
                            <Link href="/login">Portal Clientes</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Toggle - Only show if there are links to show or if we want mobile access to profile/logout */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b bg-white"
                    >
                        <div className="flex flex-col space-y-4 p-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={pathname === "/" ? link.href : `/${link.href}`}
                                    className="text-sm font-medium text-foreground hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {session ? (
                                <>
                                    {isDashboard ? (
                                        <Button className="w-full" variant="default" asChild>
                                            <Link href="/dashboard/profile" onClick={() => setIsOpen(false)}>Mi Perfil</Link>
                                        </Button>
                                    ) : (
                                        <Button className="w-full" asChild>
                                            <Link href="/dashboard" onClick={() => setIsOpen(false)}>Ir al Dashboard</Link>
                                        </Button>
                                    )}
                                    <Button variant="outline" className="w-full hover:bg-red-50 hover:text-red-600" onClick={() => { logout(); setIsOpen(false); }}>
                                        Cerrar Sesión
                                    </Button>
                                </>
                            ) : (
                                <Button className="w-full" asChild>
                                    <Link href="/login" onClick={() => setIsOpen(false)}>Portal Clientes</Link>
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
