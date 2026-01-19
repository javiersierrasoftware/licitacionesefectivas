import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String, // String to allow "Gratis", "Personalizado", or formatted currency
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    features: {
        type: [String],
        default: [],
    },
    color: {
        type: String,
        default: "bg-gray-100 text-gray-900", // Default tailwind classes
    },
    buttonVariant: {
        type: String,
        enum: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
        default: 'default',
    },
    order: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
