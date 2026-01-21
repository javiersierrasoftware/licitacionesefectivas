import mongoose from 'mongoose';

const CompanyProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    nit: {
        type: String,
        required: false, // Explicitly false
    },
    address: String,
    phone: String,
    website: String,
    unspscCodes: {
        type: [String], // Array of codes e.g. ["80101500"]
        default: [],
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    // New fields for Wizard Flow
    profileName: {
        type: String,
        required: false, // Optional for now to support legacy
    },
    description: String,
    sectors: {
        type: [String], // e.g., ["Public", "Private"]
        default: [],
    },
    departments: {
        type: [String], // e.g., ["Antioquia", "Cundinamarca"]
        default: [],
    },
    preferences: {
        emailNotifications: { type: Boolean, default: true }, // Legacy
        historyStart: { type: Date },
        tenderValueMin: { type: Number },
        tenderValueMax: { type: Number },
    },
    // Company Data for Wizard
    legalRepresentative: String,
    creationDate: Date,
    rutFile: String,
    // Enhanced Notification Settings
    notificationSettings: {
        enabled: { type: Boolean, default: true },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'realtime'],
            default: 'daily',
        },
        triggers: {
            newOpportunities: { type: Boolean, default: true },
            statusChanges: { type: Boolean, default: true },
            expiring: { type: Boolean, default: false },
        },
        channels: {
            email: { type: Boolean, default: true },
            whatsapp: { type: Boolean, default: false },
        }
    }
});

export default mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', CompanyProfileSchema);
