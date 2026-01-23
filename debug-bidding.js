
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define schemas explicitly to avoid loading issues
const TenderSchema = new mongoose.Schema({
    referencia_proceso: String,
    entidad: String,
    descripcion: String
}, { strict: false });

const BiddingProcessSchema = new mongoose.Schema({
    userId: String,
    tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender' },
    tenderRef: String,
    status: String,
    progress: Number,
    requiredDocuments: [Object],
    tasks: [Object]
}, { timestamps: true });

async function checkBiddingProcesses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const Tender = mongoose.model('Tender', TenderSchema);
        const BiddingProcess = mongoose.model('BiddingProcess', BiddingProcessSchema);

        const processes = await BiddingProcess.find({});
        console.log(`Found ${processes.length} bidding processes.`);

        if (processes.length === 0) {
            console.log("No bidding processes found. Let's check if Tenders exist.");
            const tenderCount = await Tender.countDocuments();
            console.log(`Total Tenders in DB: ${tenderCount}`);

            // Print a sample tender ref to verify format
            const sampleTender = await Tender.findOne();
            if (sampleTender) {
                console.log("Sample Tender Ref:", sampleTender.referencia_proceso);
            }
        } else {
            processes.forEach(p => {
                console.log('------------------------------------------------');
                console.log(`ID: ${p._id}`);
                console.log(`User: ${p.userId}`);
                console.log(`Ref: ${p.tenderRef}`);
                console.log(`Status: ${p.status}`);
                console.log(`Docs: ${p.requiredDocuments?.length}`);
                console.log(`Tasks: ${p.tasks?.length}`);
                console.log(`TenderID Linked: ${p.tenderId}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkBiddingProcesses();
