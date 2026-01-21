"use client";

import { useState } from "react";
import { INITIAL_WIZARD_DATA, WizardData } from "./WizardParams";
import { StepWelcome } from "./StepWelcome";
import { StepActivity } from "./StepActivity";
import { StepModality } from "./StepModality";
import { StepLocation } from "./StepLocation";
import { StepPreferences } from "./StepPreferences";
import { StepCompanyData } from "./StepCompanyData";
import { updateProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

export function ProfileWizard({ user, existingProfile }: { user: any, existingProfile: any }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<WizardData>(() => {
        if (existingProfile) {
            return {
                ...INITIAL_WIZARD_DATA,
                // New Fields mapping
                nit: existingProfile.nit || "",
                legalRepresentative: existingProfile.legalRepresentative || "",
                creationDate: existingProfile.creationDate ? new Date(existingProfile.creationDate).toISOString().split('T')[0] : "",
                rutFile: existingProfile.rutFile || "",

                unspscCodes: existingProfile.unspscCodes || [],
                profileName: existingProfile.profileName || existingProfile.companyName || "",
                description: existingProfile.description || "",
                sectors: existingProfile.sectors || [],
                departments: existingProfile.departments || [],
                preferences: {
                    emailNotifications: existingProfile.preferences?.emailNotifications ?? true,
                    historyStart: existingProfile.preferences?.historyStart
                        ? new Date(existingProfile.preferences.historyStart).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    tenderValueMin: existingProfile.preferences?.tenderValueMin || "",
                    tenderValueMax: existingProfile.preferences?.tenderValueMax || ""
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
            const formData = new FormData();
            formData.append("name", user.name || "");
            formData.append("companyName", data.profileName || "Mi Empresa");
            formData.append("description", data.description || "");

            // New Fields - ensure strings/fallbacks
            formData.append("nit", data.nit || "");
            formData.append("legalRepresentative", data.legalRepresentative || "");
            formData.append("creationDate", data.creationDate || "");
            formData.append("rutFile", data.rutFile || "");

            formData.append("unspscCodes", JSON.stringify(data.unspscCodes));
            formData.append("sectors", JSON.stringify(data.sectors));
            formData.append("departments", JSON.stringify(data.departments));
            formData.append("profileName", data.profileName);
            formData.append("preferences", JSON.stringify(data.preferences));

            const result = await updateProfile(undefined, formData);

            if (result && result.includes("Error")) {
                alert("Error updating: " + result);
            } else {
                router.refresh();
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
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-premium border border-white/60 overflow-hidden min-h-[600px] flex flex-col p-8 md:p-12 relative">

            {/* Progress Indicator */}
            {step > 1 && (
                <div className="flex items-center justify-center space-x-2 text-xs md:text-sm font-medium text-gray-400 mb-8 overflow-x-auto">
                    <span className={step >= 2 ? "text-primary font-bold" : ""}>1/5 Datos</span>
                    <div className={`w-4 h-0.5 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-100'}`} />
                    <span className={step >= 3 ? "text-primary font-bold" : ""}>2/5 Actividad</span>
                    <div className={`w-4 h-0.5 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-100'}`} />
                    <span className={step >= 4 ? "text-primary font-bold" : ""}>3/5 Modalidad</span>
                    <div className={`w-4 h-0.5 rounded-full ${step >= 4 ? 'bg-primary' : 'bg-gray-100'}`} />
                    <span className={step >= 5 ? "text-primary font-bold" : ""}>4/5 Ubicación</span>
                    <div className={`w-4 h-0.5 rounded-full ${step >= 5 ? 'bg-primary' : 'bg-gray-100'}`} />
                    <span className={step === 6 ? "text-primary font-bold" : ""}>5/5 Preferencias</span>
                </div>
            )}

            {/* Step Content */}
            <div className="flex-1 flex flex-col">
                {step === 1 && <StepWelcome userName={user.name?.split(' ')[0] || "Usuario"} onNext={next} />}

                {step === 2 && (
                    <StepCompanyData
                        data={data}
                        onChange={updateData}
                        onNext={next}
                    />
                )}

                {step === 3 && (
                    <StepActivity
                        selectedCodes={data.unspscCodes}
                        onChange={(codes) => updateData({ unspscCodes: codes })}
                        onNext={next}
                        onBack={back}
                    />
                )}

                {step === 4 && (
                    <StepModality
                        selectedSectors={data.sectors}
                        onChange={(sectors) => updateData({ sectors })}
                        onNext={next}
                        onBack={back}
                    />
                )}

                {step === 5 && (
                    <StepLocation
                        selectedDepartments={data.departments}
                        onChange={(departments) => updateData({ departments })}
                        onNext={next}
                        onBack={back}
                    />
                )}

                {step === 6 && (
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
