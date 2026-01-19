"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface WompiButtonProps {
    planName: string;
    amountInCents: number;
    reference: string;
    publicKey: string;
    redirectUrl?: string; // URL to return to after payment
    signature?: string;
}

export function WompiButton({ planName, amountInCents, reference, publicKey, redirectUrl, signature }: WompiButtonProps) {
    // Generate a unique reference if not provided or ensure it's unique
    // For now we trust the passed reference (e.g., PLAN-ID-TIMESTAMP)

    return (
        <form action="https://checkout.wompi.co/p/" method="GET">
            {/* Essential Wompi Parameters */}
            <input type="hidden" name="public-key" value={publicKey} />
            <input type="hidden" name="currency" value="COP" />
            <input type="hidden" name="amount-in-cents" value={amountInCents} />
            <input type="hidden" name="reference" value={reference} />

            {/* Integrity Signature (Required if Integrity Key is set in Wompi Dashboard) */}
            {signature && <input type="hidden" name="signature:integrity" value={signature} />}

            {/* Optional / User Experience */}
            {redirectUrl && <input type="hidden" name="redirect-url" value={redirectUrl} />}

            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg h-auto shadow-lg"
            >
                Pagar con Wompi
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">
                Pagos seguros procesados por Bancolombia / Wompi
            </p>
        </form>
    );
}
