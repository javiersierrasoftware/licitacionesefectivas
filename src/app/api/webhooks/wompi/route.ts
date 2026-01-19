import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import User from "@/lib/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, data, signature, timestamp, environment } = body;

        console.log("Wompi Webhook Received:", event, data.transaction.status);

        // 1. Verify Signature (Recommended for production)
        // const isValid = verifyWompiSignature(data, signature, timestamp);
        // if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

        if (event === "transaction.updated") {
            const transactionData = data.transaction;
            const {
                id: wompiId,
                reference,
                amount_in_cents: amount,
                status,
                payment_method_type: paymentMethod,
                customer_email
            } = transactionData;

            // 2. Parse Reference to get Metadata (Format: PAY_userId_planId_timestamp)
            // Example: PAY_65a1b2c3d4e5f6g7h8i9j0k1_65z9y8x7w6v5u4t3s2r1q0p2_1700000000000
            const parts = reference.split('_');
            if (parts.length < 4 || parts[0] !== 'PAY') {
                console.warn("Invalid reference format:", reference);
                // Try to find user by email as fallback?
                // For now, return OK to acknowledge hook, but log error.
                return NextResponse.json({ message: "Ignored: Invalid reference format" });
            }

            const userId = parts[1];
            const planId = parts[2];

            await dbConnect();

            // 3. Save/Update Transaction
            // We use findOneAndUpdate with upsert to avoid duplicates if Wompi retries
            await Transaction.findOneAndUpdate(
                { reference },
                {
                    userId,
                    planId,
                    reference,
                    amount,
                    status,
                    wompiId,
                    paymentMethod,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );

            // 4. Update User Subscription if APPROVED
            if (status === "APPROVED") {
                const subscriptionEndDate = new Date();
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 Days Access

                await User.findByIdAndUpdate(userId, {
                    subscriptionStatus: 'active',
                    planId: planId,
                    subscriptionEndDate: subscriptionEndDate
                });

                console.log(`User ${userId} upgraded to Plan ${planId}`);
            }
        }

        return NextResponse.json({ message: "Webhook processed" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Helper (Optional for now)
function verifyWompiSignature(data: any, signature: any, timestamp: any) {
    const secret = process.env.WOMPI_INTEGRITY_KEY;
    if (!secret) return true; // Skip if no secret configured
    // Implementation depends on Wompi's specific signature algo
    return true;
}
