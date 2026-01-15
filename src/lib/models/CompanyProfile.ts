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
        required: true,
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
});

export default mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', CompanyProfileSchema);
