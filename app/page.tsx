"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { analyzeHtmlAction } from "@/app/actions"
import { AnalysisResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalysisReport } from "@/components/AnalysisReport"
import { PreviewPanel } from "@/components/PreviewPanel"

const INITIAL_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Newsletter</title>
</head>
<body style="margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <h1>Welcome to our Newsletter!</h1>
        <p>This is a sample text.</p>
        <img src="https://via.placeholder.com/300" />
        <br/>
        <a href="#">Click here</a> to unsubscribe.
        <br/>
        <p>機種依存文字 check: ① ㈱</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

export default function Home() {
  const [htmlInput, setHtmlInput] = React.useState(INITIAL_HTML)
  const [result, setResult] = React.useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("report")

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const res = await analyzeHtmlAction(htmlInput)
      setResult(res)
      setActiveTab("report") // Switch to report on analysis
    } catch (error) {
      console.error("Analysis failed", error)
      // Ideally show toast error
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-analyze on load for demo purposes? Or wait for user?
  // Let's wait for user, but we can do a quick check if needed.

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-md">
            <Play className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            メルマガQAツール
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6 h-[calc(100vh-64px)]">
        {/* Left Column: Input */}
        <section className="flex flex-col gap-4 min-h-[500px]">
          <Card className="flex-1 flex flex-col shadow-md">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-sm font-medium flex justify-between items-center">
                <span>ソースコード</span>
                <div className="text-xs text-muted-foreground font-normal">
                  {htmlInput.length} 文字
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative">
              <Textarea
                className="w-full h-full min-h-[400px] border-0 rounded-none resize-none font-mono text-sm p-4 focus-visible:ring-0"
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder="ここにHTMLを貼り付けてください..."
              />
              <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-300">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="shadow-lg hover:shadow-xl transition-all"
                >
                  {isAnalyzing ? "解析中..." : "HTMLを解析する"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right Column: Dashboard */}
        <section className="flex flex-col min-h-[500px] overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <TabsList>
                <TabsTrigger value="report">解析レポート</TabsTrigger>
                <TabsTrigger value="preview">表示シミュレーション</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="report" className="h-full mt-0">
                <AnalysisReport result={result} isAnalyzing={isAnalyzing} />
              </TabsContent>
              <TabsContent value="preview" className="h-full mt-0">
                <PreviewPanel htmlContent={htmlInput} />
              </TabsContent>
            </div>
          </Tabs>
        </section>
      </main>
    </div>
  )
}
