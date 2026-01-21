"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import CompanyProfile from "@/lib/models/CompanyProfile";
import bcrypt from "bcryptjs";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        const data = Object.fromEntries(formData);
        await signIn("credentials", { ...data, redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Credenciales inválidas.";
                default:
                    return "Algo salió mal.";
            }
        }
        throw error;
    }
}

export async function logout() {
    await signOut();
}

export async function register(
    prevState: string | undefined,
    formData: FormData
) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;
    const nit = formData.get("nit") as string;

    if (!name || !email || !password || !companyName || !nit) {
        return "Faltan campos obligatorios.";
    }

    try {
        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return "El correo electrónico ya está registrado.";
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });

        // Create Company Profile linked to user
        await CompanyProfile.create({
            userId: user._id,
            companyName,
            nit,
            unspscCodes: [], // Init empty
        });

        // Send Welcome Email
        // We import dynamically to avoid issues if email fails, or just call it.
        const { sendWelcomeEmail } = await import("@/lib/email");
        await sendWelcomeEmail(email, name);

        // We can't auto-login easily with credentials in server actions without redirecting to login logic
        // or reusing signIn. For simplicity, we'll try to sign them in or just return success.
        // Let's redirect to login for now or try signIn directly.
        // await signIn("credentials", { email, password, redirect: false });

    } catch (error) {
        console.error("Registration error:", error);
        return "Error al crear la cuenta.";
    }

    // Return success indicator (or redirect in the component)
    return "success";
}
export async function quickRegister(
    prevState: string | undefined,
    formData: FormData
) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const companyName = formData.get("companyName") as string;

    if (!name || !email || !password || !companyName) {
        return "Faltan campos obligatorios.";
    }

    let createdUserId = null;

    try {
        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return "El correo electrónico ya está registrado.";
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
        });
        createdUserId = user._id;

        // Create Partial Company Profile
        await CompanyProfile.create({
            userId: user._id,
            companyName,
            // nit is now optional
        });

    } catch (error: any) {
        console.error("Quick registration error:", error);

        // Rollback: Delete user if created to maintain consistency
        if (createdUserId) {
            try {
                await User.findByIdAndDelete(createdUserId);
            } catch (cleanupError) {
                console.error("Failed to cleanup user:", cleanupError);
            }
        }

        // Return specific error message for debugging
        return `Error: ${error.message}`;
    }

    return "success";
}
