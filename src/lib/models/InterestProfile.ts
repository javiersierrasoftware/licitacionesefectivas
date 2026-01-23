import mongoose from 'mongoose';

const InterestProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    unspscCodes: {
        type: [String],
        default: []
    },
    modalities: {
        type: [String],
        default: []
    },
    departments: {
        type: [String],
        default: []
    },
    minValue: Number,
    maxValue: Number,
    historyStart: Date,
    emailNotification: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.InterestProfile || mongoose.model('InterestProfile', InterestProfileSchema);
