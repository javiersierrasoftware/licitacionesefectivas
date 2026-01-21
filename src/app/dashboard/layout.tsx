import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, LogOut, CheckSquare, Star } from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";
import { AdminLink } from "@/components/ui/AdminLink";

import { auth } from "@/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar with Glass Effect & Modern Styling */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 hidden md:flex flex-col pt-8 pb-6 px-4 shadow-sm z-20">

                {/* Profile Snippet at Top or Logo if needed, but nav starts here */}
                <nav className="flex-1 space-y-1.5">
                    <Link
                        href="/dashboard"
                        className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                    >
                        <LayoutDashboard className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm tracking-wide">Resumen</span>
                    </Link>

                    <Link
                        href="/dashboard/opportunities"
                        className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                    >
                        <CheckSquare className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm tracking-wide">Oportunidades</span>
                    </Link>

                    <Link
                        href="/dashboard/interests"
                        className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                    >
                        <Star className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm tracking-wide">Interés</span>
                    </Link>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Gestión</p>
                    </div>

                    <Link
                        href="/dashboard/profile"
                        className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                    >
                        <Users className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm tracking-wide">Perfil de Empresa</span>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                    >
                        <Settings className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-sm tracking-wide">Notificaciones</span>
                    </Link>

                    <AdminLink userRole={(session?.user as any)?.role} />

                    {/* Admin Only Section */}
                    {(session?.user as any)?.role?.toLowerCase() === 'admin' && (
                        <>
                            <div className="pt-4 pb-2">
                                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Procesos</p>
                            </div>
                            <Link
                                href="/dashboard/admin/analisis"
                                className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
                            >
                                <FileText className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                                <span className="font-medium text-sm tracking-wide">Análisis</span>
                            </Link>
                        </>
                    )}


                </nav>

                <div className="pt-4 border-t border-gray-100">
                    {/* User Mini Profile */}
                    <div className="flex items-center px-3 py-2 mb-2 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs mr-3">
                            {session?.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                                {session?.user?.name?.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content Info */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header (simplified) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
                    {/* Mobile Branding removed to avoid duplication with Navbar */}
                    <div />
                    {/* Mobile menu trigger would go here */}
                </header>

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
