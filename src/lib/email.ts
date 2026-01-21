

import nodemailer from "nodemailer";
import { WelcomeEmail } from "@/emails/WelcomeEmail";
import { render } from "@react-email/render";

export async function sendWelcomeEmail(email: string, name: string) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn("GMAIL credentials are not defined. Email sending skipped.");
        return;
    }

    try {
        const emailHtml = await render(WelcomeEmail({ name }));

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Licitaciones Efectivas" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Bienvenido a Licitaciones Efectivas",
            html: emailHtml,
        });

        console.log("Welcome email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return { error };
    }
}

