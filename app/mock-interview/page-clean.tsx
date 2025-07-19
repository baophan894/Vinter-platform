"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Bot, Play, FileText, CheckCircle, AlertCircle, Video } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"
import AssistantCreationProgress from "@/components/assistant-creation-progress"
import InterviewEvaluation from "@/components/interview-evaluation"

type InterviewStep = "upload" | "analysis" | "questions" | "interview" | "evaluation" | "completed"

export default function MockInterviewPage() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<InterviewStep>("upload")
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
  const [dynamicAssistantId, setDynamicAssistantId] = useState<string>("")
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)

  // Evaluation data
  const [evaluationData, setEvaluationData] = useState<{
    conversationHistory: Array<{role: 'user' | 'assistant', text: string, timestamp: Date}>
    duration: number
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check for evaluation return from interview room
  useEffect(() => {
    const step = searchParams?.get('step')
    const returnedSessionId = searchParams?.get('sessionId')
    const duration = searchParams?.get('duration')
    
    if (step === 'evaluation' && returnedSessionId && duration) {
      setSessionId(returnedSessionId)
      setEvaluationData({
        conversationHistory: [], // Will be loaded from API if needed
        duration: parseInt(duration)
      })
      setCurrentStep('evaluation')
    }
  }, [searchParams])

  // Step 1: Upload JD and CV
  const handleUpload = async () => {
    if (!jobDescription.trim() || !cvFile || !candidateName.trim()) {
      setError("Please fill in all required information")
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
      setError("An error occurred during analysis. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Start interview session
  const startInterview = async () => {
    setLoading(true)
    setError("")
    
    try {
      // Create session
      const result = await APIClient.startInterview(jobDescription, cvFile!, questionMode)
      if (result.status && result.data) {
        setSessionId(result.data.sessionId || result.data.id)
      } else {
        setSessionId(result.sessionId || result.id)
      }

      // Create dynamic assistant and navigate to interview room
      setIsCreatingAssistant(true)
      const assistantId = await APIClient.createDynamicAssistant(
        candidateName,
        jobDescription,
        cvFile!,
        questions
      )
      setDynamicAssistantId(assistantId)
      setIsCreatingAssistant(false)
      
      // Navigate to dedicated interview room
      const sessionId = result.status ? (result.data.sessionId || result.data.id) : (result.sessionId || result.id)
      const interviewParams = new URLSearchParams({
        assistantId,
        candidateName,
        sessionId,
        questions: JSON.stringify(questions)
      })
      window.location.href = `/interview-room?${interviewParams.toString()}`
      return

    } catch (err) {
      setIsCreatingAssistant(false)
      setError("Failed to start interview. Please try again.")
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
    const steps = ["upload", "analysis", "questions", "interview", "evaluation", "completed"]
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Video Interview</h1>
          <div className="max-w-2xl mx-auto">
            <Progress value={getStepProgress()} className="h-2 mb-4" />
            <p className="text-gray-600">
              Step {["upload", "analysis", "questions", "interview", "evaluation", "completed"].indexOf(currentStep) + 1} / 6
            </p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Upload JD and CV */}
          {currentStep === "upload" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-900" />
                    Upload Job Description & CV
                  </CardTitle>
                  <CardDescription>
                    Provide your job description and CV to generate personalized interview questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      placeholder="Enter your full name"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job Description</label>
                    <Textarea
                      placeholder="Paste the job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Upload CV (PDF)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">
                          {cvFile ? cvFile.name : "Click to upload your CV (PDF format)"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Interview Difficulty</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { mode: "basic", label: "Basic", desc: "Entry-level questions", time: "15-20 min" },
                        { mode: "advanced", label: "Advanced", desc: "Technical deep-dive", time: "25-30 min" },
                        { mode: "challenge", label: "Challenge", desc: "Problem-solving focus", time: "30-40 min" }
                      ].map((option) => (
                        <div
                          key={option.mode}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            questionMode === option.mode ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => setQuestionMode(option.mode as any)}
                        >
                          <h3 className="font-semibold">{option.label}</h3>
                          <p className="text-sm text-gray-600">{option.desc}</p>
                          <p className="text-xs text-gray-500">{option.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Interview Format</label>
                    <div className="p-4 border border-blue-500 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">AI Video Interview</h3>
                        <Badge variant="secondary" className="text-xs">
                          Professional
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">Professional video call interview with AI like Google Meet</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Creates personalized AI interviewer based on your CV and JD
                      </p>
                      {dynamicAssistantId && (
                        <p className="text-xs text-green-600 mt-1 font-medium">
                          ✓ Custom AI interviewer ready
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    disabled={loading || !jobDescription.trim() || !cvFile || !candidateName.trim()}
                  >
                    {loading ? "Analyzing..." : "Analyze & Generate Questions"}
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
              {/* Assistant Creation Progress */}
              <AssistantCreationProgress
                candidateName={candidateName}
                isCreating={isCreatingAssistant}
                isComplete={!!dynamicAssistantId}
              />

              {/* Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-900" />
                    Preparation Checklist
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
                      CV Analysis
                      <Badge variant="secondary" className="ml-auto">
                        {cvAnalysis.score?.value || cvAnalysis.matchScore || 0}% match
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
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
                        <h4 className="font-semibold text-yellow-800 mb-2">Areas for Improvement</h4>
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
                    Interview Questions ({questions.length} questions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {questions.slice(0, 3).map((question, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium">Question {index + 1}: </span>
                        <span className="text-sm">{question}</span>
                      </div>
                    ))}
                    {questions.length > 3 && (
                      <p className="text-sm text-gray-500">... and {questions.length - 3} more questions</p>
                    )}
                  </div>
                  <Button 
                    onClick={startInterview} 
                    className="w-full bg-blue-900 hover:bg-blue-800" 
                    disabled={loading || isCreatingAssistant}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isCreatingAssistant 
                      ? "Creating AI Interviewer..."
                      : loading 
                        ? "Starting interview..."
                        : "Start AI Video Interview"
                    }
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Evaluation */}
          {currentStep === "evaluation" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <InterviewEvaluation
                candidateName={candidateName}
                jobDescription={jobDescription}
                questions={questions}
                conversationHistory={evaluationData?.conversationHistory || []}
                interviewDuration={evaluationData?.duration || 0}
                sessionId={sessionId}
                onComplete={() => setCurrentStep("completed")}
              />
            </motion.div>
          )}

          {/* Step 5: Completed */}
          {currentStep === "completed" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Card className="text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Complete!</h2>
                  <p className="text-gray-600 mb-8">
                    You have successfully completed your {questions.length} question AI video interview.
                    Your evaluation has been completed and is ready for review.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={exportReport} className="bg-blue-900 hover:bg-blue-800">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      New Interview
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
