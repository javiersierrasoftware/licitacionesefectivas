"use client";

import { logout } from "@/lib/actions"; // We'll assume logout action handles redirect or we do it client side?
// Actually signOut in server actions redirects by default.
import { LogOut } from "lucide-react";

export function LogoutButton() {
    return (
        <button
            onClick={() => logout()}
            className="group flex w-full items-center space-x-3 px-4 py-3 text-gray-500 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-sm ring-1 ring-transparent hover:ring-gray-100 transition-all duration-200 mt-1"
        >
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span className="font-medium text-sm tracking-wide">Cerrar Sesión</span>
        </button>
    );
}
