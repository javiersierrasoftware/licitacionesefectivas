import dbConnect from "@/lib/db";
import Plan from "@/lib/models/plan";
import { WompiButton } from "@/components/payment/WompiButton";
import { CheckoutRegisterForm } from "@/components/auth/CheckoutRegisterForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Lock } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

// Next.js 15+ convention: params is a Promise
export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const session = await auth();
    const { id } = await params;

    // Fetch fresh user data to check subscription status
    let dbUser = null;
    if (session?.user?.email) {
        // We import User model dynamically or ensure it is imported at top
        const User = require("@/lib/models/User").default;
        dbUser = await User.findOne({ email: session.user.email }).lean();
    }

    // Redirect active subscribers to dashboard
    if (dbUser?.subscriptionStatus === 'active' && dbUser?.subscriptionEndDate > new Date()) {
        redirect("/dashboard?message=already_subscribed");
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return <div className="p-10 text-center text-red-500">ID de plan inválido</div>;
    }

    const plan = await Plan.findById(id).lean();

    if (!plan) {
        return <div className="p-10 text-center text-red-500">Plan no encontrado en la base de datos</div>;
    }

    // Parse price to cents.
    const numericPrice = parseInt(plan.price.replace(/\D/g, "") || "0");
    const amountInCents = numericPrice * 100;

    // Generate a reference
    // Generate a reference with embedded metadata for Webhook parsing
    // Format: PAY_userId_planId_timestamp
    // NOTE: session.user.id is required. If not strictly typed, ensure session exists.
    const userId = session?.user?.id ?? "guest";
    const reference = `PAY_${userId}_${plan._id}_${Date.now()}`;
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUB_KEY || process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_XXXXXX";

    // Integrity Signature Generation
    const integritySecret = process.env.WOMPI_INTEGRITY_KEY;
    let integritySignature = "";

    if (integritySecret) {
        const currency = "COP";
        const chain = `${reference}${amountInCents}${currency}${integritySecret}`;
        const crypto = require('crypto');
        integritySignature = crypto.createHash('sha256').update(chain).digest('hex');
        console.log("DEBUG WOMPI:", { reference, amountInCents, currency, integritySecret, chain, integritySignature, publicKey, id: plan._id });
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar handled by layout */}

            <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
                    {session ? "Confirma tu Suscripción" : "Crea tu cuenta y comienza a ganar"}
                </h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Plan Summary (Always visible) */}
                    <Card className="border-blue-100 shadow-md h-fit">
                        <CardHeader className="bg-blue-50/50 border-b border-blue-100">
                            <CardTitle className="text-xl text-blue-900">Plan Seleccionado</CardTitle>
                            <CardDescription>Estás a un paso de potenciar tu empresa</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                            <p className="text-4xl font-bold text-blue-600 mb-4">
                                {plan.price} <span className="text-base text-gray-500 font-normal">/mes</span>
                            </p>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start text-sm text-gray-700">
                                        <Check className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="text-xs text-center text-gray-500 mt-4 bg-gray-100 p-2 rounded">
                                <Lock className="inline h-3 w-3 mr-1" /> Sin contratos forzosos. Cancela cuando quieras.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Register OR Payment */}
                    <div className="space-y-6">
                        {!session ? (
                            // State 1: User NOT logged in -> Show Register Form
                            <CheckoutRegisterForm />
                        ) : (
                            // State 2: User Logged in -> Show Payment
                            <Card className="shadow-lg border-2 border-blue-500 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <CardHeader>
                                    <CardTitle>Detalles del Pago</CardTitle>
                                    <CardDescription>Transacción segura con Wompi Bancolombia</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium">{plan.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Impuestos (IVA)</span>
                                            <span className="font-medium text-gray-500">Incluido</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-bold">
                                            <span>Total a Pagar</span>
                                            <span className="text-blue-700">{plan.price}</span>
                                        </div>
                                    </div>

                                    {/* PROVISIONAL BYPASS BUTTON */}
                                    <div className="space-y-4">
                                        <div className="text-xs text-justify text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                                            <p className="font-semibold mb-1">Modo Provisional:</p>
                                            Debido a intermitencia en la pasarela de pagos, puedes activar tu plan temporalmente sin costo inmediato.
                                        </div>

                                        <ManualActivationButton planId={plan._id.toString()} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer handled by layout */}
        </div>
    );
}

// Small client component for the button to access the action
import { activateManualSubscription } from "@/lib/actions/subscription";

function ManualActivationButton({ planId }: { planId: string }) {
    return (
        <form action={async () => {
            "use server";
            await activateManualSubscription(planId);
        }}>
            <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 text-lg h-auto shadow-lg rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                Confirmar y Activar Plan
            </button>
            <p className="text-xs text-center mt-2 text-muted-foreground">
                Acceso inmediato por 30 días
            </p>
        </form>
    );
}
