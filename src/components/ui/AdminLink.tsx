"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function AdminLink({ userEmail }: { userEmail?: string | null }) {
    // Check email directly from prop
    const isAdmin = userEmail === "javiersierrac@gmail.com";

    if (!isAdmin) return null;

    return (
        <Link
            href="/dashboard/admin/planes"
            className="flex items-center space-x-3 px-4 py-3 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors mt-4"
        >
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">Administrar Planes</span>
        </Link>
    );
}
