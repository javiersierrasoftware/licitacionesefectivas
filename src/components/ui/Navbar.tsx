"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "#servicios" },
    { name: "Nosotros", href: "#nosotros" },
    { name: "Contacto", href: "#contacto" },
];

import type { Session } from "next-auth";
import { logout } from "@/lib/actions";

// ... previous imports

export function Navbar({ session }: { session: Session | null }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary tracking-tight">
                        Licitaciones<span className="text-secondary">Efectivas</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {link.name}
                        </Link>
                    ))}
                    {session ? (
                        <div className="flex items-center gap-2">
                            <Button variant="default" size="sm" asChild>
                                <Link href="/dashboard">Ir al Dashboard</Link>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => logout()} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                Salir
                            </Button>
                        </div>
                    ) : (
                        <Button variant="default" size="sm" asChild>
                            <Link href="/login">Portal Clientes</Link>
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
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
                                    href={link.href}
                                    className="text-sm font-medium text-foreground hover:text-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {session ? (
                                <>
                                    <Button className="w-full" asChild>
                                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>Ir al Dashboard</Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50" onClick={() => { logout(); setIsOpen(false); }}>
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
