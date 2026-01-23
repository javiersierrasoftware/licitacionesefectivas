
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function generateCoverLetterBlob(data: any): Promise<Blob> {
    const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: {
                            width: 12240, // 8.5in (Letter)
                            height: 15840, // 11in (Letter)
                        },
                        margin: {
                            top: 1440, // 1in
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                children: [
                    // City and Date
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `${data.company.city}, ${today}`,
                                size: 24, // 12pt
                                font: "Arial"
                            }),
                        ],
                        spacing: { after: 400 } // 20pt aka space
                    }),

                    // Recipient
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Señores", bold: true, size: 24, font: "Arial" }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.tender.entity ? data.tender.entity.toUpperCase() : "ENTIDAD", bold: true, size: 24, font: "Arial" }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Ciudad", size: 24, font: "Arial" }),
                        ],
                        spacing: { after: 400 }
                    }),

                    // Reference
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                text: `REFERENCIA: PROCESO No. ${data.tender.reference}`,
                                bold: true,
                                size: 24,
                                font: "Arial"
                            }),
                        ],
                        spacing: { after: 200 }
                    }),

                    // Object
                    new Paragraph({
                        children: [
                            new TextRun({ text: "OBJETO: ", bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: data.tender.object || "", size: 24, font: "Arial" }),
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Body Intro
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Yo, ", size: 24, font: "Arial" }),
                            new TextRun({ text: data.company.representative ? data.company.representative.toUpperCase() : "REPRESENTANTE", bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: ", identificado con cédula de ciudadanía, actuando en calidad de Representante Legal de ", size: 24, font: "Arial" }),
                            new TextRun({ text: data.company.name ? data.company.name.toUpperCase() : "EMPRESA", bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: ", identificada con NIT ", size: 24, font: "Arial" }),
                            new TextRun({ text: data.company.nit || "", bold: true, size: 24, font: "Arial" }),
                            new TextRun({ text: ", me permito presentar propuesta para el proceso de la referencia.", size: 24, font: "Arial" }),
                        ],
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED
                    }),

                    // Declaration
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Declaro bajo la gravedad de juramento que:", size: 24, font: "Arial" }),
                        ],
                        spacing: { after: 200 }
                    }),

                    // List Items
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "1. Conozco y acepto en su integridad los pliegos de condiciones y demás documentos del proceso.",
                                size: 24, font: "Arial"
                            })
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "2. La propuesta que presento cumple con todos y cada uno de los requisitos exigidos.",
                                size: 24, font: "Arial"
                            })
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "3. No me encuentro incurso en ninguna causal de inhabilidad o incompatibilidad para contratar con el Estado.",
                                size: 24, font: "Arial"
                            })
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "4. La sociedad y su representante legal no se encuentran reportados en el Boletín de Responsables Fiscales de la Contraloría General de la República.",
                                size: 24, font: "Arial"
                            })
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "5. Mi oferta económica tiene una validez mínima de noventa (90) días calendario.",
                                size: 24, font: "Arial"
                            })
                        ],
                        spacing: { after: 400 }
                    }),

                    // Contact Info
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Así mismo, informo los datos de contacto para efectos de notificaciones:", size: 24, font: "Arial" }),
                        ],
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `• Dirección: ${data.company.address || ""}`, size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `• Teléfono: ${data.company.phone || ""}`, size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `• Correo Electrónico: ${data.company.email || ""}`, size: 24, font: "Arial" })
                        ],
                        spacing: { after: 800 } // Big space for signature
                    }),

                    // Signature Line
                    new Paragraph({
                        children: [
                            new TextRun({ text: "__________________________", size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.company.representative ? data.company.representative.toUpperCase() : "FIRMA", bold: true, size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Representante Legal", size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.company.name || "", size: 24, font: "Arial" })
                        ]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: data.company.nit || "", size: 24, font: "Arial" })
                        ]
                    }),
                ],
            },
        ],
    });

    return await Packer.toBlob(doc);
}
