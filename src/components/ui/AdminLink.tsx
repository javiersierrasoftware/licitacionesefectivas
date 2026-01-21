"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function AdminLink({ userRole }: { userRole?: string }) {
    // Check role from session (Case insensitive for role)
    const isAdmin = userRole?.toLowerCase() === 'admin';

    if (!isAdmin) return null;

    return (
        <Link
            href="/dashboard/admin/planes"
            className="group flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-neutral hover:text-primary transition-all duration-200"
        >
            <ShieldAlert className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="font-medium text-sm tracking-wide">Administrar Planes</span>
        </Link>
    );
}
