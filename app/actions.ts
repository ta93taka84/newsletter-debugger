"use server"

import { analyzeHtml } from "@/lib/analyzer"
import { AnalysisResult } from "@/types"

export async function analyzeHtmlAction(html: string): Promise<AnalysisResult> {
    // Simple wrapper calling the library function
    // In a real app, successful link checking might happen here or be queued
    const result = await analyzeHtml(html);
    return result;
}
