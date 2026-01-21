"use server";

import { z } from "zod";
import { sendContactEmail } from "@/lib/email";

const ContactSchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z.string().email("Ingresa un correo electrónico válido."),
    subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres."),
    message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
});

export async function sendContactMessage(prevState: any, formData: FormData) {
    const validatedFields = ContactSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Por favor revisa los campos del formulario.",
        };
    }

    const { name, email, subject, message } = validatedFields.data;

    try {
        const result = await sendContactEmail({ name, email, subject, message });

        if (!result.success) {
            return {
                message: "Hubo un error al enviar el mensaje. Intenta nuevamente más tarde.",
            };
        }

        return {
            success: true,
            message: "¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.",
        };
    } catch (error) {
        return {
            message: "Ocurrió un error inesperado.",
        };
    }
}
