"use client";

import { logout } from "@/lib/actions"; // We'll assume logout action handles redirect or we do it client side?
// Actually signOut in server actions redirects by default.
import { LogOut } from "lucide-react";

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="flex w-full items-center space-x-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
        </button>
    );
}
