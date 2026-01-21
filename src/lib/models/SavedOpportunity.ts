import mongoose from 'mongoose';

const SavedOpportunitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tenderId: {
        type: String, // referencia_del_proceso
        required: true,
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        default: "",
    },
    // We store a snapshot of the tender data so we can display it in the Interests page
    // without re-fetching from the external API (which might change or be unavailable)
    tenderData: {
        type: Object,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can only have one entry per tender
SavedOpportunitySchema.index({ userId: 1, tenderId: 1 }, { unique: true });

export default mongoose.models.SavedOpportunity || mongoose.model('SavedOpportunity', SavedOpportunitySchema);
