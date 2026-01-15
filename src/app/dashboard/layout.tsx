import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, LogOut, CheckSquare } from "lucide-react";
import { LogoutButton } from "@/components/ui/LogoutButton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 h-16 flex items-center border-b border-gray-100">
                    <Link href="/dashboard">
                        <span className="text-xl font-bold text-primary tracking-tight">
                            Licitaciones<span className="text-secondary">.app</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-primary transition-colors"
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="font-medium">Resumen</span>
                    </Link>

                    <Link
                        href="/dashboard/opportunities"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-primary transition-colors"
                    >
                        <CheckSquare className="h-5 w-5" />
                        <span className="font-medium">Oportunidades</span>
                    </Link>

                    <Link
                        href="/dashboard/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-primary transition-colors"
                    >
                        <Users className="h-5 w-5" />
                        <span className="font-medium">Perfil de Empresa</span>
                    </Link>

                    <Link
                        href="/dashboard/settings"
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-primary transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Configuración</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content Info */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header (simplified) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:hidden">
                    <span className="font-bold text-primary">Licitaciones.app</span>
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
