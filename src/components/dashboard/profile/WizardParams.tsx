export type WizardData = {
    step: number;
    profileName: string;
    description?: string;
    // Step 1: Company Data
    nit: string;
    legalRepresentative: string;
    creationDate: string; // ISO Date string
    rutFile?: string; // Placeholder for file path/name

    unspscCodes: string[];
    sectors: string[]; // 'Public' | 'Private' | 'International' | 'Decentralized'
    departments: string[];
    preferences: {
        emailNotifications: boolean;
        historyStart: string; // ISO Date string
        tenderValueMin?: string;
        tenderValueMax?: string;
    };
    // Legacy fields that might be pre-filled
    companyName?: string;
    phone?: string;
    address?: string;
    website?: string;
};

export const INITIAL_WIZARD_DATA: WizardData = {
    step: 1,
    profileName: "",
    nit: "",
    legalRepresentative: "",
    creationDate: "",
    unspscCodes: [],
    sectors: [],
    departments: [],
    preferences: {
        emailNotifications: true,
        historyStart: new Date().toISOString().split('T')[0],
        tenderValueMin: "",
        tenderValueMax: ""
    },
};
