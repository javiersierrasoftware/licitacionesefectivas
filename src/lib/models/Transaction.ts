import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    reference: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true, // in cents
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'],
        default: 'PENDING',
    },
    wompiId: {
        type: String,
        default: null,
    },
    paymentMethod: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
