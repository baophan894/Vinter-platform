"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Scan, AlertCircle, CheckCircle, TrendingUp, Download } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"

export default function CVScannerPage() {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [jd, setJd] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleScan = async () => {
    if (!cvFile || !jd.trim()) {
      setError("Vui lòng upload CV và nhập job description")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await APIClient.analyzeCV(jd, cvFile)
      // Handle the new response format with nested data
      if (result.status && result.data) {
        setAnalysisResult(result.data)
      } else {
        setAnalysisResult(result)
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi phân tích CV. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, text: "Rất phù hợp", color: "bg-green-600" }
    if (score >= 60) return { variant: "secondary" as const, text: "Khá phù hợp", color: "bg-yellow-600" }
    return { variant: "destructive" as const, text: "Cần cải thiện", color: "bg-red-600" }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CV Scanner</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Phân tích độ phù hợp giữa CV và JD với AI, nhận gợi ý cải thiện chi tiết
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* CV Upload */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-900" />
                    Upload CV
                  </CardTitle>
                  <CardDescription>Upload file CV (PDF, DOC, DOCX)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {cvFile && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{cvFile.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Lưu ý:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Hỗ trợ file PDF, DOC, DOCX, TXT</li>
                      <li>• Kích thước tối đa: 10MB</li>
                      <li>• Đảm bảo CV có định dạng rõ ràng</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* JD Input */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-900" />
                    Job Description
                  </CardTitle>
                  <CardDescription>Dán JD của vị trí bạn muốn ứng tuyển</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Dán job description tại đây..."
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="min-h-[300px] resize-none"
                  />
                  <Button
                    onClick={handleScan}
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    disabled={loading || !cvFile || !jd.trim()}
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    {loading ? "Đang phân tích..." : "Phân tích độ phù hợp"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-8"
            >
              {/* Overall Score */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <TrendingUp className="h-5 w-5" />
                    Điểm tổng thể
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-3xl font-bold ${getScoreColor(analysisResult.score?.value || 0)}`}>
                      {analysisResult.score?.value || 0}%
                    </span>
                    <Badge variant={getScoreBadge(analysisResult.score?.value || 0).variant} className="text-sm">
                      {getScoreBadge(analysisResult.score?.value || 0).text}
                    </Badge>
                  </div>
                  <Progress value={analysisResult.score?.value || 0} className="h-3" />
                  <p className="text-sm text-blue-800 mt-2">
                    CV của bạn phù hợp {analysisResult.score?.value || 0}% với yêu cầu công việc
                  </p>
                  {analysisResult.score?.explanation && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium">Giải thích:</p>
                      <p className="text-sm text-blue-800 mt-1">{analysisResult.score.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {analysisResult && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Phân tích hoàn thành</span>
                      <span>{new Date().toLocaleString("vi-VN")}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Positive Points */}
                {analysisResult.positivePoints && analysisResult.positivePoints.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-900">
                        <CheckCircle className="h-5 w-5" />
                        Điểm mạnh
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.positivePoints.map((point: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-green-800">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Improvement Areas */}
                {analysisResult.improvementAreas && analysisResult.improvementAreas.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-900">
                        <AlertCircle className="h-5 w-5" />
                        Cần cải thiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.improvementAreas.map((area: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-yellow-800">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Missing Skills */}
              {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <AlertCircle className="h-5 w-5" />
                      Kỹ năng còn thiếu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-red-300 text-red-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <TrendingUp className="h-5 w-5" />
                      Gợi ý cải thiện
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-purple-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-blue-900 hover:bg-blue-800 flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống báo cáo
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Tối ưu hóa CV
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Luyện phỏng vấn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
