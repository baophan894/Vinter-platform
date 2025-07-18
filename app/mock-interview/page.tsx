"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Bot, Play, FileText, CheckCircle, AlertCircle, Mic, MessageCircle, Zap, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"
import { ConversationalInterview } from "@/components/conversational-interview"
import { VapiInterview } from "@/components/vapi-interview"
import { PhoneCallInterface } from "@/components/phone-call-interface"

type InterviewStep = "upload" | "analysis" | "questions" | "interview" | "completed"
type InterviewMode = "text" | "voice" | "conversation" | "vapi" | "phone"

export default function MockInterviewPage() {
  const [currentStep, setCurrentStep] = useState<InterviewStep>("upload")
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("phone")
  const [jobDescription, setJobDescription] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [candidateName, setCandidateName] = useState("")
  const [questionMode, setQuestionMode] = useState<"basic" | "advanced" | "challenge">("basic")

  // Analysis results
  const [checklist, setChecklist] = useState<string[]>([])
  const [cvAnalysis, setCvAnalysis] = useState<any>(null)
  const [questions, setQuestions] = useState<string[]>([])

  // Interview session
  const [sessionId, setSessionId] = useState<string>("")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Step 1: Upload JD and CV
  const handleUpload = async () => {
    if (!jobDescription.trim() || !cvFile || !candidateName.trim()) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Generate checklist from JD
      const checklistResult = await APIClient.generateChecklist(jobDescription)
      if (checklistResult.status && checklistResult.data) {
        setChecklist(checklistResult.data.checklist || checklistResult.data)
      } else {
        setChecklist(checklistResult.checklist || checklistResult)
      }

      // Analyze CV compatibility
      const analysisResult = await APIClient.analyzeCV(jobDescription, cvFile)
      if (analysisResult.status && analysisResult.data) {
        setCvAnalysis(analysisResult.data)
      } else {
        setCvAnalysis(analysisResult)
      }

      // Generate questions using interview-session endpoint
      const questionsResult = await APIClient.generateQuestions(jobDescription, cvFile, questionMode)
      if (questionsResult.status && questionsResult.data) {
        setQuestions(questionsResult.data.questions || questionsResult.data)
      } else {
        setQuestions(questionsResult.questions || questionsResult)
      }

      setCurrentStep("analysis")
    } catch (err) {
      setError("Có lỗi xảy ra khi phân tích. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Start interview session
  const startInterview = async () => {
    setLoading(true)
    try {
      // Use the start-interview endpoint which returns sessionId
      const result = await APIClient.startInterview(jobDescription, cvFile!, questionMode)
      if (result.status && result.data) {
        setSessionId(result.data.sessionId || result.data.id)
      } else {
        setSessionId(result.sessionId || result.id)
      }
      setCurrentStep("interview")
    } catch (err) {
      setError("Không thể bắt đầu phỏng vấn. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Save answer and move to next question (for text mode)
  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) {
      setError("Vui lòng trả lời câu hỏi")
      return
    }

    setLoading(true)
    try {
      await APIClient.saveInterviewQA(sessionId, questions[currentQuestionIndex], currentAnswer)

      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = currentAnswer
      setAnswers(newAnswers)

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setCurrentAnswer("")
      } else {
        setCurrentStep("completed")
      }
    } catch (err) {
      setError("Có lỗi khi lưu câu trả lời")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Export report
  const exportReport = async () => {
    try {
      const blob = await APIClient.exportInterviewReport(sessionId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `interview-report-${sessionId}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Không thể tải báo cáo")
      console.error(err)
    }
  }

  const getStepProgress = () => {
    const steps = ["upload", "analysis", "questions", "interview", "completed"]
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
  }

  const getModeDescription = (mode: InterviewMode) => {
    switch (mode) {
      case "phone":
        return "Giao diện giống điện thoại thật với AI thông minh"
      case "vapi":
        return "AI thông minh với giọng nói tự nhiên, có thể gọi điện hoặc web call"
      case "conversation":
        return "AI tự động hỏi và lắng nghe như cuộc trò chuyện thật"
      case "voice":
        return "AI đọc câu hỏi, bạn trả lời bằng giọng nói"
      case "text":
        return "Đọc câu hỏi và trả lời bằng văn bản"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mock Interview với AI</h1>
          <div className="max-w-2xl mx-auto">
            <Progress value={getStepProgress()} className="h-2 mb-4" />
            <p className="text-gray-600">
              Bước {["upload", "analysis", "questions", "interview", "completed"].indexOf(currentStep) + 1} / 5
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
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

          {/* Step 1: Upload JD and CV */}
          {currentStep === "upload" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-900" />
                    Thông tin chuẩn bị phỏng vấn
                  </CardTitle>
                  <CardDescription>Cung cấp thông tin để AI tạo câu hỏi phỏng vấn phù hợp</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Họ tên ứng viên</label>
                    <Input
                      placeholder="Nhập họ tên của bạn"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description</label>
                    <Textarea
                      placeholder="Dán nội dung JD tại đây..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload CV (PDF)</label>
                    <Input
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Chế độ phỏng vấn</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { mode: "basic", title: "Cơ bản", desc: "5-7 câu hỏi", time: "15-20 phút" },
                        { mode: "advanced", title: "Nâng cao", desc: "10-12 câu hỏi", time: "30-45 phút" },
                        { mode: "challenge", title: "Thử thách", desc: "8-10 câu hỏi", time: "45-60 phút" },
                      ].map((option) => (
                        <div
                          key={option.mode}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            questionMode === option.mode
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => setQuestionMode(option.mode as any)}
                        >
                          <h3 className="font-semibold">{option.title}</h3>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                          <p className="text-xs text-gray-500">{option.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Hình thức phỏng vấn</label>
                    <div className="grid grid-cols-1 gap-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          interviewMode === "phone" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setInterviewMode("phone")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">Phone Call Interface</h3>
                          <Badge variant="secondary" className="text-xs">
                            Mới nhất
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{getModeDescription("phone")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          interviewMode === "vapi" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setInterviewMode("vapi")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">Vapi AI</h3>
                        </div>
                        <p className="text-sm text-gray-600">{getModeDescription("vapi")}</p>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          interviewMode === "conversation"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setInterviewMode("conversation")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">Trò chuyện tự nhiên</h3>
                        </div>
                        <p className="text-sm text-gray-600">{getModeDescription("conversation")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          interviewMode === "voice" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setInterviewMode("voice")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Mic className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">Phỏng vấn giọng nói</h3>
                        </div>
                        <p className="text-sm text-gray-600">{getModeDescription("voice")}</p>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          interviewMode === "text" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setInterviewMode("text")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">Phỏng vấn văn bản</h3>
                        </div>
                        <p className="text-sm text-gray-600">{getModeDescription("text")}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    disabled={loading || !jobDescription.trim() || !cvFile || !candidateName.trim()}
                  >
                    {loading ? "Đang phân tích..." : "Phân tích và tạo câu hỏi"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Analysis Results */}
          {currentStep === "analysis" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-900" />
                    Checklist chuẩn bị
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {checklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* CV Analysis */}
              {cvAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-900" />
                      Phân tích CV
                      <Badge variant="secondary" className="ml-auto">
                        {cvAnalysis.score?.value || cvAnalysis.matchScore || 0}% phù hợp
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">Điểm mạnh</h4>
                        <ul className="space-y-1">
                          {cvAnalysis.positivePoints?.map((point: string, index: number) => (
                            <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-1 text-green-600" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-2">Cần cải thiện</h4>
                        <ul className="space-y-1">
                          {cvAnalysis.improvementAreas?.map((area: string, index: number) => (
                            <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 mt-1 text-yellow-600" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Questions Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-900" />
                    Câu hỏi phỏng vấn ({questions.length} câu)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {questions.slice(0, 3).map((question, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Câu {index + 1}: </span>
                        <span className="text-sm">{question}</span>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <p className="text-sm text-gray-500">... và {questions.length - 3} câu hỏi khác</p>
                    )}
                  </div>
                  <Button onClick={startInterview} className="w-full bg-blue-900 hover:bg-blue-800">
                    <Play className="mr-2 h-4 w-4" />
                    Bắt đầu phỏng vấn{" "}
                    {interviewMode === "phone"
                      ? "với Phone Interface"
                      : interviewMode === "vapi"
                        ? "với Vapi AI"
                        : interviewMode === "conversation"
                          ? "trò chuyện"
                          : interviewMode === "voice"
                            ? "bằng giọng nói"
                            : "bằng văn bản"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Interview Session */}
          {currentStep === "interview" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {interviewMode === "phone" ? (
                <PhoneCallInterface
                  questions={questions}
                  sessionId={sessionId}
                  candidateName={candidateName}
                  onComplete={() => setCurrentStep("completed")}
                />
              ) : interviewMode === "vapi" ? (
                <VapiInterview
                  questions={questions}
                  sessionId={sessionId}
                  candidateName={candidateName}
                  onComplete={() => setCurrentStep("completed")}
                />
              ) : interviewMode === "conversation" ? (
                <ConversationalInterview
                  questions={questions}
                  sessionId={sessionId}
                  candidateName={candidateName}
                  onComplete={() => setCurrentStep("completed")}
                />
              ) : (
                // Keep existing text/voice interview components
                <div>Other interview modes...</div>
              )}
            </motion.div>
          )}

          {/* Step 4: Completed */}
          {currentStep === "completed" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Hoàn thành phỏng vấn!</h2>
                  <p className="text-gray-600 mb-8">
                    Bạn đã hoàn thành {questions.length} câu hỏi phỏng vấn{" "}
                    {interviewMode === "phone"
                      ? "với Phone Interface"
                      : interviewMode === "vapi"
                        ? "với Vapi AI"
                        : interviewMode === "conversation"
                          ? "trò chuyện"
                          : interviewMode === "voice"
                            ? "bằng giọng nói"
                            : "bằng văn bản"}
                    . AI đang tạo báo cáo đánh giá chi tiết cho bạn.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={exportReport} className="bg-blue-900 hover:bg-blue-800">
                      <FileText className="mr-2 h-4 w-4" />
                      Tải báo cáo
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      Phỏng vấn mới
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
