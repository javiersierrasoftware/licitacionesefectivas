import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    href?: string;
    linkText?: string;
    className?: string;
}

export function ServiceCard({
    title,
    description,
    icon: Icon,
    href = "#",
    linkText = "Conocer más",
    className,
}: ServiceCardProps) {
    return (
        <div
            className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-gray-100",
                className
            )}
        >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity group-hover:opacity-100" />

            <div>
                {Icon && (
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon className="h-6 w-6" />
                    </div>
                )}
                <h3 className="mb-2 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {description}
                </p>
            </div>

            <Link
                href={href}
                className="inline-flex items-center text-sm font-semibold text-primary hover:text-secondary transition-colors"
            >
                {linkText}
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
    );
}
