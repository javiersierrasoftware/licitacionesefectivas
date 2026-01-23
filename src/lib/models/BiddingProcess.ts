
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['TEMPLATE', 'LEGAL', 'TECHNICAL', 'FINANCIAL'], default: 'LEGAL' },
    status: { type: String, enum: ['PENDING', 'UPLOADED', 'REVIEWED'], default: 'PENDING' },
    fileUrl: { type: String },
    uploadedAt: { type: Date }
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    dueDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
});

const BiddingProcessSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    tenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender',
        required: true
    },
    tenderRef: { type: String },

    status: {
        type: String,
        enum: ['EN_PROCESO', 'RADICADO', 'GANADO', 'NO_GANADO', 'DESCARTADO'],
        default: 'EN_PROCESO'
    },
    statusDate: { type: Date },

    progress: { type: Number, default: 0 },

    requiredDocuments: [DocumentSchema],

    tasks: [TaskSchema],

    notes: { type: String },

}, { timestamps: true });

// FORCE Mongoose to delete the old model from cache so it rebuilds with the new Schema
// This fixes the "next is not a function" error caused by the lingering pre-save hook in memory
if (mongoose.models && mongoose.models.BiddingProcess) {
    delete mongoose.models.BiddingProcess;
}

export default mongoose.model("BiddingProcess", BiddingProcessSchema);
