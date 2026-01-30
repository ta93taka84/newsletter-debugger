"use client"

import * as React from "react"
import { Smartphone, Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PreviewPanelProps {
    htmlContent: string
}

export function PreviewPanel({ htmlContent }: PreviewPanelProps) {
    const [mode, setMode] = React.useState<"pc" | "sp">("pc")
    const [darkMode, setDarkMode] = React.useState(false)

    // Use a blob URL or doc.write to render clean HTML
    // We use a ref to the iframe to manipulate it if needed, or just srcDoc
    // srcDoc is easiest for modern browsers.

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Preview</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md bg-muted/50 p-1">
                        <Button
                            variant={mode === "pc" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setMode("pc")}
                            className="h-7 px-2"
                        >
                            <Monitor className="h-4 w-4 mr-1" /> PC
                        </Button>
                        <Button
                            variant={mode === "sp" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setMode("sp")}
                            className="h-7 px-2"
                        >
                            <Smartphone className="h-4 w-4 mr-1" /> SP
                        </Button>
                    </div>

                    <Button
                        variant={darkMode ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 ml-2"
                        onClick={() => setDarkMode(!darkMode)}
                        title="Toggle Dark Mode Simulation"
                    >
                        {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 bg-zinc-100 dark:bg-zinc-900 p-4 flex justify-center items-start overflow-auto min-h-[500px]">
                <div
                    className={cn(
                        "transition-all duration-300 bg-white shadow-lg overflow-hidden relative",
                        mode === "sp" ? "w-[375px] h-[667px] rounded-[30px] border-8 border-zinc-800" : "w-full max-w-4xl h-[600px] border",
                        // Dark mode simulation using CSS filter for a rough "forced dark" check
                        darkMode && "invert hue-rotate-180"
                    )}
                >
                    <iframe
                        srcDoc={htmlContent}
                        className="w-full h-full border-none bg-white"
                        title="Email Preview"
                        sandbox="allow-same-origin allow-scripts"
                    />
                </div>
            </CardContent>
        </Card>
    )
}
