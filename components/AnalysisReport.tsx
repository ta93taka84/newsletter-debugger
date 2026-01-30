"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"
import { AnalysisResult, AnalysisError } from "@/types" // Ensure this path is correct based on your setup
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnalysisReportProps {
    result: AnalysisResult | null
    isAnalyzing: boolean
}

export function AnalysisReport({ result, isAnalyzing }: AnalysisReportProps) {
    if (isAnalyzing) {
        return (
            <Card className="h-full flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    Analyzing...
                </div>
            </Card>
        )
    }

    if (!result) {
        return (
            <Card className="h-full flex items-center justify-center p-12 bg-muted/20 border-dashed">
                <div className="text-muted-foreground text-center">
                    <Info className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Paste HTML code to generate a report.</p>
                </div>
            </Card>
        )
    }

    const criticalErrors = result.errors.filter(e => e.severity === 'critical');
    const warningErrors = result.errors.filter(e => e.severity === 'warning');
    const infoErrors = result.errors.filter(e => e.severity === 'info');

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600 dark:text-green-400";
        if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <div className="space-y-4">
            {/* Score Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Health Score</CardTitle>
                    <CardDescription>Overall quality of your HTML email</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className={cn("text-5xl font-bold font-mono", getScoreColor(result.score))}>
                            {result.score}
                            <span className="text-xl text-muted-foreground ml-1">/100</span>
                        </div>
                        <div className="flex gap-2 text-sm">
                            <Badge variant="destructive" className="flex gap-1">
                                <XCircle className="h-3 w-3" /> {criticalErrors.length} Critical
                            </Badge>
                            <Badge variant="secondary" className="flex gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100">
                                <AlertTriangle className="h-3 w-3" /> {warningErrors.length} Warning
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Tabs */}
            <Card>
                <Tabs defaultValue="all" className="w-full">
                    <div className="p-4 pb-0">
                        <TabsList className="w-full justify-start overflow-x-auto">
                            <TabsTrigger value="all">All Issues ({result.errors.length})</TabsTrigger>
                            <TabsTrigger value="critical">Critical ({criticalErrors.length})</TabsTrigger>
                            <TabsTrigger value="warning">Warnings ({warningErrors.length})</TabsTrigger>
                            <TabsTrigger value="links">Links ({result.links.length})</TabsTrigger>
                            <TabsTrigger value="images">Images ({result.images.length})</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-4 max-h-[500px] overflow-y-auto">
                        <TabsContent value="all" className="space-y-2 mt-0">
                            {result.errors.length === 0 ? (
                                <SuccessMessage />
                            ) : (
                                result.errors.map((e, i) => <ErrorItem key={i} error={e} />)
                            )}
                        </TabsContent>

                        <TabsContent value="critical" className="space-y-2 mt-0">
                            {criticalErrors.length === 0 ? <SuccessMessage /> : criticalErrors.map((e, i) => <ErrorItem key={i} error={e} />)}
                        </TabsContent>

                        <TabsContent value="warning" className="space-y-2 mt-0">
                            {warningErrors.length === 0 ? <SuccessMessage /> : warningErrors.map((e, i) => <ErrorItem key={i} error={e} />)}
                        </TabsContent>

                        <TabsContent value="links" className="space-y-2 mt-0">
                            {result.links.length === 0 ? <div className="text-muted-foreground text-sm">No links found.</div> : (
                                <div className="grid gap-2">
                                    {result.links.map((l, i) => (
                                        <div key={i} className="flex flex-col text-sm border p-2 rounded bg-muted/50">
                                            <span className="font-medium truncate">{l.text}</span>
                                            <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate text-xs">{l.href}</a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="images" className="space-y-2 mt-0">
                            {result.images.length === 0 ? <div className="text-muted-foreground text-sm">No images found.</div> : (
                                <div className="grid gap-2">
                                    {result.images.map((img, i) => (
                                        <div key={i} className="flex gap-2 text-sm border p-2 rounded bg-muted/50 items-center">
                                            <div className="h-10 w-10 bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden rounded">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate font-mono text-xs text-muted-foreground">src: {img.src}</div>
                                                <div className="truncate">alt: <span className={!img.alt ? "text-red-500 font-bold" : "text-green-600"}>{img.alt || "MISSING"}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    )
}

function ErrorItem({ error }: { error: AnalysisError }) {
    const isCritical = error.severity === 'critical';
    return (
        <div className={cn(
            "flex gap-3 p-3 rounded-md border text-sm",
            isCritical ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30" : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30"
        )}>
            {isCritical ? <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" /> : <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />}
            <div className="space-y-1 overflow-hidden">
                <div className="font-medium">{error.message}</div>
                {error.tag && <div className="font-mono text-xs bg-black/5 p-1 rounded w-fit truncate max-w-full">{error.tag}</div>}
                {error.snippet && <div className="font-mono text-xs bg-black/5 p-1 rounded w-fit truncate max-w-full">{error.snippet}</div>}
            </div>
        </div>
    )
}

function SuccessMessage() {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-green-600 text-sm">
            <CheckCircle className="h-8 w-8 mb-2" />
            <p>No issues found in this category!</p>
        </div>
    )
}
