import mongoose from "mongoose";

const TenderSchema = new mongoose.Schema({
    // Identificadores Clave
    referencia_proceso: { type: String, required: true, unique: true, index: true }, // El ID unico del proceso
    entidad: { type: String, required: true, index: true },

    // Descripción
    descripcion: String,
    objeto: String,
    modalidad: String,

    // Económico
    precio_base: Number,
    moneda: String,

    // Fechas
    fecha_publicacion: Date,
    fecha_recepcion_ofertas: Date,
    fecha_apertura_ofertas: Date,

    // Ubicación
    departamento: String,
    ciudad: String,
    region: String,

    // Clasificación
    codigos_unspsc: [String],

    // URLs y Contacto
    url_proceso: String, // Link al SECOP
    contacto_nombre: String,
    contacto_email: String,

    // Estado interno SECOP
    fase: String,
    estado: String,

    // Data cruda completa (Backup por si hay campos raros que no mapeamos explícitamente)
    raw_data: { type: mongoose.Schema.Types.Mixed },

    // Metadata nuestra
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Tender || mongoose.model("Tender", TenderSchema);
