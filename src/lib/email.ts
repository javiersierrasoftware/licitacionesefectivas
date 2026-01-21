

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

export async function sendContactEmail(data: { name: string; email: string; subject: string; message: string }) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
        console.warn("GMAIL credentials are not defined. Contact email sending skipped.");
        return { success: false, error: "Server configuration error" };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        // Email to Admin
        await transporter.sendMail({
            from: `"Formulario Contacto" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER, // Send to self/admin
            replyTo: data.email,
            subject: `[Contacto Web] ${data.subject}`,
            html: `
                <h3>Nuevo mensaje de contacto</h3>
                <p><strong>Nombre:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Asunto:</strong> ${data.subject}</p>
                <br/>
                <p><strong>Mensaje:</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending contact email:", error);
        return { success: false, error };
    }
}

