"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FileText,
    CheckSquare,
    Upload,
    ExternalLink,
    Clock,
    AlertCircle,
    CheckCircle2,
    Printer,
    Download,
    FileCheck,
    Loader2,
    Briefcase
} from "lucide-react";
import { updateTaskStatus, updateDocumentStatus, getCoverLetterData, updateProcessStatus } from "@/lib/actions/process-actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateCoverLetterBlob } from "@/lib/utils/docx-generator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Assuming sonner or generic toast, if not present I'll remove or use alert

export function BiddingManager({ process, companyProfile }: { process: any, companyProfile: any }) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [fileMap, setFileMap] = useState<Record<string, File>>({});
    // Track if we are using the profile version for a document
    const [profileUsageMap, setProfileUsageMap] = useState<Record<string, boolean>>({});
    const [isZipping, setIsZipping] = useState(false);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Status Update State
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(process.status);
    const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    // Helper to find matching profile document
    const getProfileDoc = (docName: string, docType: string) => {
        if (!companyProfile) return null;

        const name = docName.toLowerCase();

        if (name.includes("existencia") || name.includes("camara") || name.includes("comercio")) {
            return companyProfile.camaraComercioFile;
        }
        if (name.includes("cedula") || name.includes("representante")) {
            return companyProfile.cedulaRepLegalFile;
        }
        if (name.includes("rut")) {
            return companyProfile.rutFile;
        }
        if (name.includes("experiencia")) {
            // Find first experience with file
            // Ideally we should list all experiences, but for now just pick the first available one
            // or return 'HAS_EXPERIENCE_MODULE'
            const expWithFile = companyProfile.experiences?.find((e: any) => e.fileUrl);
            return expWithFile?.fileUrl;
        }

        return null;
    };

    // Calculate progress (updated logic)
    const totalItems = (process.tasks?.length || 0) + (process.requiredDocuments?.length || 0);
    const completedItems = (process.tasks?.filter((t: any) => t.isCompleted).length || 0) +
        (process.requiredDocuments?.filter((d: any) => d.status === 'UPLOADED' || d.status === 'REVIEWED' || fileMap[d._id] || profileUsageMap[d._id]).length || 0);

    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
        await updateTaskStatus(process._id, taskId, !currentStatus);
        router.refresh();
    };

    const handleDocStatus = async (docId: string, status: string) => {
        await updateDocumentStatus(process._id, docId, status);
        router.refresh();
    };

    const handleFileSelect = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFileMap(prev => ({ ...prev, [docId]: file }));
            // If selecting manual file, disable profile usage
            setProfileUsageMap(prev => ({ ...prev, [docId]: false }));
            handleDocStatus(docId, 'UPLOADED');
        }
    };

    const toggleProfileUsage = (docId: string, url: string) => {
        const isUsing = !profileUsageMap[docId];
        setProfileUsageMap(prev => ({ ...prev, [docId]: isUsing }));

        if (isUsing) {
            // Remove manual file if switching to profile
            setFileMap(prev => {
                const newMap = { ...prev };
                delete newMap[docId];
                return newMap;
            });
            handleDocStatus(docId, 'UPLOADED');
        } else {
            handleDocStatus(docId, 'PENDING');
        }
    };

    const triggerFileInput = (docId: string) => {
        fileInputRefs.current[docId]?.click();
    };

    const handleDownloadZip = async () => {
        setIsZipping(true);
        try {
            const zip = new JSZip();
            const processFolder = zip.folder(`Proceso ${process.tenderRef}`);

            // 1. Add Generate Cover Letter
            const coverLetterDoc = process.requiredDocuments.find((d: any) => d.name.includes("Carta de Presentación") || d.type === 'TEMPLATE');
            if (coverLetterDoc) {
                const data = await getCoverLetterData(process._id);
                if (data) {
                    const blob = await generateCoverLetterBlob(data);
                    processFolder?.file(`Carta_Presentacion_${process.tenderRef}.docx`, blob);
                }
            }

            // 2. Add Files (Uploaded or Profile)
            for (const doc of process.requiredDocuments) {
                const typeFolder = processFolder?.folder(doc.type || "OTROS");

                // Priority 1: User Uploaded File in this session
                if (fileMap[doc._id]) {
                    typeFolder?.file(fileMap[doc._id].name, fileMap[doc._id]);
                    continue;
                }

                // Priority 2: Used Profile Document
                if (profileUsageMap[doc._id]) {
                    const profileUrl = getProfileDoc(doc.name, doc.type);
                    if (profileUrl) {
                        try {
                            // Fetch content from URL
                            // Note: This requires CORS enabled on the storage bucket if client-side
                            // If fails, we might need a proxy. Assuming standard fetch works for now.
                            // If fileUrl is a path relative to public, prepend location.origin
                            const fetchUrl = profileUrl.startsWith('http') ? profileUrl : profileUrl;

                            const response = await fetch(fetchUrl);
                            if (response.ok) {
                                const blob = await response.blob();
                                // Try to guess filename from URL or default
                                const filename = profileUrl.split('/').pop() || `${doc.name}.pdf`;
                                typeFolder?.file(filename, blob);
                            } else {
                                console.error(`Failed to fetch profile doc: ${profileUrl}`);
                            }
                        } catch (e) {
                            console.error(`Error fetching profile doc ${doc.name}`, e);
                        }
                    }
                }
            }

            // 3. Generate and Download
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `Expediente_Licitacion_${process.tenderRef}.zip`);

        } catch (error) {
            console.error("Error creating zip:", error);
            alert("Hubo un error al generar el archivo ZIP. Verifique los permisos de los archivos.");
        } finally {
            setIsZipping(false);
        }
    };

    const handleStatusSave = async () => {
        setIsUpdatingStatus(true);
        try {
            await updateProcessStatus(process._id, newStatus, statusDate);
            setIsStatusOpen(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar estado");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress}%</div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Card with Edit Dialog */}
                <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-slate-50 transition-colors group relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="outline" className="bg-white">Cambiar</Badge>
                            </div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Estado</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold uppercase text-blue-600">{process.status.replace('_', ' ')}</div>
                                <p className="text-xs text-muted-foreground">
                                    {process.statusDate
                                        ? `Desde: ${format(new Date(process.statusDate), "dd MMM yyyy", { locale: es })}`
                                        : "Etapa actual"}
                                </p>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Actualizar Estado del Proceso</DialogTitle>
                            <DialogDescription>
                                Registra el cambio de etapa y la fecha en que ocurrió.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Estado
                                </Label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                                        <SelectItem value="RADICADO">Radicado</SelectItem>
                                        <SelectItem value="GANADO">Ganado / Adjudicado</SelectItem>
                                        <SelectItem value="NO_GANADO">No Ganado</SelectItem>
                                        <SelectItem value="DESCARTADO">Descartado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="date" className="text-right">
                                    Fecha
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={statusDate}
                                    onChange={(e) => setStatusDate(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>Cancelar</Button>
                            <Button onClick={handleStatusSave} disabled={isUpdatingStatus}>
                                {isUpdatingStatus ? "Guardando..." : "Guardar Cambio"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tareas</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {process.tasks?.filter((t: any) => t.isCompleted).length} / {process.tasks?.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Completadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {process.requiredDocuments?.filter((d: any) => d.status !== 'PENDING').length} / {process.requiredDocuments?.length}
                        </div>
                        <p className="text-xs text-muted-foreground">Gestionados</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Process Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-l-4 border-l-blue-600">
                        <CardHeader>
                            <CardTitle className="text-lg">Información del Proceso</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Referencia</span>
                                <p className="font-mono font-bold text-gray-800">{process.tenderRef}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Objeto</span>
                                <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                                    {process.tenderId?.descripcion || "Sin descripción"}
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase">Entidad</span>
                                <p className="text-sm font-medium text-blue-800">
                                    {process.tenderId?.entidad}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                <Link href={process.tenderId?.url_proceso || "#"} target="_blank">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Ver en SECOP II
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Download ZIP Card */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-base">Descargar Expediente</CardTitle>
                            <CardDescription className="text-xs">
                                Genera un archivo ZIP con todos los documentos cargados y generados, organizados por carpetas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleDownloadZip}
                                disabled={isZipping}
                            >
                                {isZipping ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generando ZIP...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Descargar Todo (.zip)
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Manager */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="documents" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="documents">Documentación</TabsTrigger>
                            <TabsTrigger value="tasks">Lista de Tareas</TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plan de Trabajo</CardTitle>
                                    <CardDescription>Hitos clave para la presentación de la oferta</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {process.tasks?.map((task: any) => (
                                            <div key={task._id} className="flex items-start space-x-3 p-3 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={task.isCompleted}
                                                    onChange={() => handleTaskToggle(task._id, task.isCompleted)}
                                                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${task.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                        {task.title}
                                                    </p>
                                                    {task.dueDate && (
                                                        <p className="text-xs text-red-500 mt-1">
                                                            Vence: {format(new Date(task.dueDate), "dd MMM yyyy", { locale: es })}
                                                        </p>
                                                    )}
                                                </div>
                                                {task.isCompleted && <Badge variant="secondary" className="bg-green-100 text-green-800">Completado</Badge>}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documents" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Checklist Documental</CardTitle>
                                    <CardDescription>
                                        Carga tus archivos o usa los de tu perfil de empresa.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {process.requiredDocuments?.map((doc: any) => {
                                            const isTemplate = doc.name.includes("Carta de Presentación") || doc.type === 'TEMPLATE';
                                            const hasFile = !!fileMap[doc._id];
                                            const isUsingProfile = !!profileUsageMap[doc._id];
                                            const profileDocUrl = getProfileDoc(doc.name, doc.type);
                                            const isUploaded = doc.status === 'UPLOADED' || doc.status === 'REVIEWED';

                                            return (
                                                <div key={doc._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-white gap-4 sm:gap-0">
                                                    <div className="flex items-center space-x-3 truncate w-full sm:w-auto">
                                                        <div className={`p-2 rounded-full flex-shrink-0 ${isUploaded || hasFile || isUsingProfile ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            {isUploaded || hasFile || isUsingProfile ? <FileCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                                        </div>
                                                        <div className="truncate flex-1">
                                                            <p className="text-sm font-medium text-gray-900 truncate pr-4" title={doc.name}>{doc.name}</p>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="text-xs text-gray-500 uppercase tracking-wider">{doc.type}</p>
                                                                {fileMap[doc._id] && (
                                                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 truncate max-w-[150px]">
                                                                        {fileMap[doc._id].name}
                                                                    </Badge>
                                                                )}
                                                                {isUsingProfile && (
                                                                    <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">
                                                                        Usando Perfil
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                                                        {isTemplate ? (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                asChild
                                                            >
                                                                <Link href={`/dashboard/bidding/${process._id}/letter`} target="_blank">
                                                                    <Printer className="h-3 w-3 mr-1" />
                                                                    Generar
                                                                </Link>
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                {/* Profile Toggle */}
                                                                {profileDocUrl && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant={isUsingProfile ? "default" : "secondary"}
                                                                        className={isUsingProfile ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-purple-100 text-purple-800 hover:bg-purple-200"}
                                                                        onClick={() => toggleProfileUsage(doc._id, profileDocUrl)}
                                                                        title="Usar documento guardado en perfil"
                                                                    >
                                                                        <Briefcase className="h-3 w-3 mr-1" />
                                                                        {isUsingProfile ? "En Uso" : "Usar Perfil"}
                                                                    </Button>
                                                                )}

                                                                {/* File Upload */}
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    ref={el => { fileInputRefs.current[doc._id] = el }}
                                                                    onChange={(e) => handleFileSelect(doc._id, e)}
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    variant={(isUploaded && !isUsingProfile) || hasFile ? "secondary" : "outline"}
                                                                    className={(isUploaded && !isUsingProfile) || hasFile ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                                                                    onClick={() => triggerFileInput(doc._id)}
                                                                >
                                                                    <Upload className="h-3 w-3 mr-1" />
                                                                    {(isUploaded && !isUsingProfile) || hasFile ? "Cambiar" : "Cargar"}
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
