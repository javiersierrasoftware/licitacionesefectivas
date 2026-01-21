export type WizardData = {
    step: number;
    profileName: string;
    unspscCodes: string[];
    sectors: string[]; // 'Public' | 'Private' | 'International' | 'Decentralized'
    departments: string[];
    preferences: {
        emailNotifications: boolean;
        historyStart: string; // ISO Date string
    };
    // Legacy fields that might be pre-filled
    companyName?: string;
    nit?: string;
    phone?: string;
    address?: string;
    website?: string;
};

export const INITIAL_WIZARD_DATA: WizardData = {
    step: 1,
    profileName: "",
    unspscCodes: [],
    sectors: [],
    departments: [],
    preferences: {
        emailNotifications: true,
        historyStart: new Date().toISOString().split('T')[0],
    },
};
