// Force re-compile
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import BiddingProcess from "@/lib/models/BiddingProcess";
import CompanyProfile from "@/lib/models/CompanyProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Users,
    FileWarning,
    CheckSquare,
    ArrowRight,
    Building2,
    AlertTriangle,
    Clock,
    FileText
} from "lucide-react";
import Link from "next/link";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default async function AdminBiddingPage() {
    const session = await auth();
    // RBAC Check
    if ((session?.user as any)?.role?.toLowerCase() !== 'admin') {
        redirect("/dashboard");
    }

    await dbConnect();

    // 1. Fetch all processes
    const allProcesses = await BiddingProcess.find({})
        .populate('tenderId')
        .sort({ updatedAt: -1 })
        .lean();

    // 2. Group by User/Company
    const userIds = Array.from(new Set(allProcesses.map(p => p.userId)));
    const profiles = await CompanyProfile.find({ userId: { $in: userIds } }).lean();

    // Create a map for quick lookup: userId -> Company Name
    const profileMap: Record<string, string> = {};
    profiles.forEach(p => {
        profileMap[p.userId] = p.companyName || "Empresa Sin Nombre";
    });

    // 3. Calculate Global Stats
    let stats = {
        enProceso: 0,
        radicados: 0,
        ganados: 0,
        total: allProcesses.length
    };

    allProcesses.forEach(p => {
        if (p.status === 'EN_PROCESO') stats.enProceso++;
        if (p.status === 'RADICADO') stats.radicados++;
        if (p.status === 'GANADO' || p.status === 'ADJUDICADO') stats.ganados++;
    });

    // Grouping
    const groupedProcesses: Record<string, any[]> = {};
    allProcesses.forEach(proc => {
        if (!groupedProcesses[proc.userId]) {
            groupedProcesses[proc.userId] = [];
        }
        groupedProcesses[proc.userId].push(proc);
    });

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Tablero de Control :: Licitaciones</h1>
                    <p className="text-muted-foreground">
                        Supervisión operativa de procesos en curso.
                    </p>
                </div>
                {/* Global Summary Cards */}
                <div className="flex gap-4">
                    <Card className="px-4 py-2 border-l-4 border-l-blue-500 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-bold">En Proceso</div>
                        <div className="text-2xl font-bold text-blue-600">{stats.enProceso}</div>
                    </Card>
                    <Card className="px-4 py-2 border-l-4 border-l-purple-500 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-bold">Radicados</div>
                        <div className="text-2xl font-bold text-purple-600">{stats.radicados || 0}</div>
                    </Card>
                    <Card className="px-4 py-2 border-l-4 border-l-gray-300 shadow-sm">
                        <div className="text-xs text-gray-500 uppercase font-bold">Total</div>
                        <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
                    </Card>
                </div>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedProcesses).map(([userId, processes]) => {
                    const companyName = profileMap[userId] || `Cliente ${userId.substring(0, 6)}`;

                    return (
                        <div key={userId} className="space-y-4">
                            {/* Company Header */}
                            <div className="flex items-center gap-3 px-2">
                                <Building2 className="h-5 w-5 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-800">{companyName}</h3>
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                    {processes.length} Procesos
                                </Badge>
                            </div>

                            {/* Process Grid */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {processes.map((proc: any) => {
                                    // Calculate Detailed Stats
                                    const pendingDocs = proc.requiredDocuments?.filter((d: any) => d.status === 'PENDING') || [];
                                    const pendingTasks = proc.tasks?.filter((t: any) => !t.isCompleted) || [];

                                    const totalItems = (proc.requiredDocuments?.length || 0) + (proc.tasks?.length || 0);
                                    const completedItems = ((proc.requiredDocuments?.length || 0) - pendingDocs.length) + ((proc.tasks?.length || 0) - pendingTasks.length);
                                    const progressRaw = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                                    return (
                                        <Card key={proc._id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
                                            <CardContent className="p-0">
                                                <div className="flex h-full">
                                                    {/* Left Status Stripe */}
                                                    <div className={`w-2 flex-shrink-0 ${progressRaw === 100 ? 'bg-green-500' :
                                                        progressRaw > 50 ? 'bg-blue-500' : 'bg-amber-400'
                                                        }`} />

                                                    <div className="flex-1 p-4 flex flex-col gap-3">
                                                        {/* Header Line */}
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        {proc.tenderRef}
                                                                    </span>
                                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${proc.status === 'RADICADO' ? 'text-purple-600' :
                                                                        proc.status === 'GANADO' ? 'text-green-600' : 'text-blue-600'
                                                                        }`}>
                                                                        {proc.status.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                <h4 className="font-semibold text-gray-900 text-sm line-clamp-1" title={proc.tenderId?.descripcion}>
                                                                    {proc.tenderId?.descripcion}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 truncate">{proc.tenderId?.entidad}</p>
                                                            </div>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2 text-gray-400 hover:text-blue-600" asChild>
                                                                <Link href={`/dashboard/bidding/${proc._id}`}>
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </div>

                                                        <div className="h-px bg-gray-100 w-full" />

                                                        {/* Missing Items Section (Direct Visibility) */}
                                                        <div className="flex-1 min-h-[60px]">
                                                            {(pendingDocs.length > 0 || pendingTasks.length > 0) ? (
                                                                <div className="space-y-2">
                                                                    <div className="text-[10px] uppercase font-bold text-red-500 flex items-center gap-1">
                                                                        <AlertTriangle className="h-3 w-3" />
                                                                        Faltantes ({pendingDocs.length + pendingTasks.length})
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {pendingDocs.slice(0, 2).map((d: any) => (
                                                                            <span key={d._id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100 truncate max-w-[150px]">
                                                                                <FileWarning className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                                {d.name.substring(0, 15)}...
                                                                            </span>
                                                                        ))}
                                                                        {pendingTasks.slice(0, 1).map((t: any) => (
                                                                            <span key={t._id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 truncate max-w-[150px]">
                                                                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                                                                {t.title.substring(0, 15)}...
                                                                            </span>
                                                                        ))}
                                                                        {(pendingDocs.length + pendingTasks.length) > 3 && (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                                                                                +{(pendingDocs.length + pendingTasks.length) - 3} más
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-green-600 text-xs font-medium bg-green-50/50 rounded-lg">
                                                                    <CheckSquare className="h-4 w-4 mr-1.5" />
                                                                    Sin pendientes
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar Footer */}
                                                        <div className="flex items-center gap-2 pt-1">
                                                            <Progress value={progressRaw} className="h-1.5 flex-1" />
                                                            <span className="text-[10px] font-bold text-gray-600 w-8 text-right">{Math.round(progressRaw)}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {Object.keys(groupedProcesses).length === 0 && (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
                        <p>Sin Procesos</p>
                    </div>
                )}
            </div>
        </div>
    );
}
