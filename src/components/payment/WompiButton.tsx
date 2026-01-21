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

    useEffect(() => {
        const form = document.getElementById('wompi-form');
        if (form && !form.querySelector('script')) {
            const script = document.createElement('script');
            script.src = "https://checkout.wompi.co/widget.js";
            script.setAttribute("data-render", "button");
            script.setAttribute("data-public-key", publicKey);
            script.setAttribute("data-currency", "COP");
            script.setAttribute("data-amount-in-cents", amountInCents.toString());
            script.setAttribute("data-reference", reference);

            if (signature) {
                script.setAttribute("data-signature:integrity", signature);
            }

            if (redirectUrl) {
                script.setAttribute("data-redirect-url", redirectUrl);
            }

            form.appendChild(script);
        }
    }, [amountInCents, publicKey, reference, redirectUrl, signature]);

    return (
        <form id="wompi-form">
            {/* The widget will inject the button here */}
            <style jsx global>{`
                .wompi-button {
                    background-color: #2563eb !important; /* blue-600 */
                    color: white !important;
                    font-weight: bold !important;
                    padding: 12px 24px !important;
                    border-radius: 8px !important;
                    width: 100% !important;
                    font-size: 1.125rem !important; /* text-lg */
                    border: none !important;
                    cursor: pointer !important;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                    transition: background-color 0.2s !important;
                }
                .wompi-button:hover {
                    background-color: #1d4ed8 !important; /* blue-700 */
                }
            `}</style>
            <p className="text-xs text-center mt-2 text-muted-foreground">
                Pagos seguros procesados por Bancolombia / Wompi
            </p>
        </form>
    );
}
