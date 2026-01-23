"use client";

import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generateCoverLetterBlob } from "@/lib/utils/docx-generator";

interface DownloadWordButtonProps {
    data: any;
}

export function DownloadWordButton({ data }: DownloadWordButtonProps) {
    const generateDoc = async () => {
        const blob = await generateCoverLetterBlob(data);
        saveAs(blob, `Carta_Presentacion_${data.tender.reference}.docx`);
    };

    return (
        <Button
            onClick={generateDoc}
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded shadow transition-colors"
        >
            <FileDown className="h-4 w-4 mr-2" />
            Descargar Word (.docx)
        </Button>
    );
}
