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
    city: String, // Added city
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
    // Nuevo Campos: Perfil Básico Extendido
    personType: {
        type: String,
        enum: ['Natural', 'Juridica'],
        default: 'Juridica'
    },
    companyType: {
        type: String, // 'Pyme', 'Grande', 'Personal', 'Otro'
    },

    // Perfil Detallado: Archivos y Datos Legales
    camaraComercioFile: String,
    cedulaRepLegalFile: String,
    actividadesCamara: String, // Descripción de actividades registradas

    // Perfil Detallado: Experiencia
    experiences: [{
        title: String, // Característica de experiencia
        durationMonths: Number,
        contractValue: Number, // Added: Valor del contrato
        contractType: {        // Added: Tipo de experiencia (Publica/Privada)
            type: String,
            enum: ['Publica', 'Privada'],
            default: 'Publica'
        },
        fileUrl: String, // Certificado
        experienceTypes: [String], // Tags seleccionados
        createdAt: { type: Date, default: Date.now }
    }],

    // Keep legacy fields for backward compatibility where needed, 
    // but users should migrate to InterestProfile for search settings.
    preferences: {
        emailNotifications: { type: Boolean, default: true },
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
