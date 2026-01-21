"use client";

import { useState } from "react";
import { INITIAL_WIZARD_DATA, WizardData } from "./WizardParams";
import { StepWelcome } from "./StepWelcome";
import { StepActivity } from "./StepActivity";
import { StepModality } from "./StepModality";
import { StepLocation } from "./StepLocation";
import { StepPreferences } from "./StepPreferences";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

export function ProfileWizard({ user, existingProfile }: { user: any, existingProfile: any }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>(() => {
        if (existingProfile) {
            return {
                ...INITIAL_WIZARD_DATA,
                unspscCodes: existingProfile.unspscCodes || [],
                profileName: existingProfile.profileName || existingProfile.companyName || "",
                // Map other existing fields
                sectors: existingProfile.sectors || [],
                departments: existingProfile.departments || [],
                preferences: existingProfile.preferences || {
                    emailNotifications: true,
                    historyStart: new Date()
                },
            };
        }
        return INITIAL_WIZARD_DATA;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => s - 1);

    const updateData = (newData: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create FormData object to match the server action expectation
            // Note: updateProfile likely expects a FormData object based on the previous form implementation using useActionState
            // We need to adapt it or create a new server action that accepts JSON.
            // Given the previous file was using useActionState with FormData, let's verify if we can call it directly or if we need to wrap it.

            // Inspecting profile-form.tsx: const [message, formAction, isPending] = useActionState(updateProfile, undefined);
            // updateProfile signature typically: (prevState: any, formData: FormData)

            const formData = new FormData();
            formData.append("name", user.name || ""); // Required by backend validation likely
            formData.append("companyName", data.profileName || "Mi Empresa"); // Fallback
            // We need to pass the complex arrays as JSON strings or multiple entries depending on how the backend parses it.
            // Based on UnspscSelector, it used a hidden input with JSON.stringify

            formData.append("unspscCodes", JSON.stringify(data.unspscCodes));
            formData.append("sectors", JSON.stringify(data.sectors));
            formData.append("departments", JSON.stringify(data.departments));
            formData.append("profileName", data.profileName);
            formData.append("preferences", JSON.stringify(data.preferences));

            // Call the action
            const result = await updateProfile(undefined, formData);

            if (result && result.includes("Error")) {
                alert("Error updating: " + result);
            } else {
                // Success
                router.refresh();
                // Maybe redirect to dashboard/opportunities
                router.push("/dashboard/opportunities");
            }

        } catch (err) {
            console.error(err);
            alert("Unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col p-8 md:p-12 relative">

            {/* Progress Indicator (only show after step 1) */}
            {step > 1 && (
                <div className="flex items-center justify-center space-x-4 mb-8 text-sm font-medium text-gray-400">
                    <span className={step === 2 ? "text-green-500 font-bold" : step > 2 ? "text-green-500" : ""}>1/4 Actividad económica</span>
                    <div className="w-8 h-px bg-gray-200" />
                    <span className={step === 3 ? "text-green-500 font-bold" : step > 3 ? "text-green-500" : ""}>2/4 Modalidad</span>
                    <div className="w-8 h-px bg-gray-200" />
                    <span className={step === 4 ? "text-green-500 font-bold" : step > 4 ? "text-green-500" : ""}>3/4 Ubicación</span>
                    <div className="w-8 h-px bg-gray-200" />
                    <span className={step === 5 ? "text-green-500 font-bold" : ""}>4/4 Preferencias</span>
                </div>
            )}

            {/* Step Content */}
            <div className="flex-1 flex flex-col">
                {step === 1 && <StepWelcome userName={user.name?.split(' ')[0] || "Usuario"} onNext={next} />}

                {step === 2 && (
                    <StepActivity
                        selectedCodes={data.unspscCodes}
                        onChange={(codes) => updateData({ unspscCodes: codes })}
                        onNext={next}
                        onBack={() => setStep(1)} // Back to step 1 explicitly
                    />
                )}

                {step === 3 && (
                    <StepModality
                        selectedSectors={data.sectors}
                        onChange={(sectors) => updateData({ sectors })}
                        onNext={next}
                        onBack={back}
                    />
                )}

                {step === 4 && (
                    <StepLocation
                        selectedDepartments={data.departments}
                        onChange={(departments) => updateData({ departments })}
                        onNext={next}
                        onBack={back}
                    />
                )}

                {step === 5 && (
                    <StepPreferences
                        data={data}
                        onChange={updateData}
                        onBack={back}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
}
