"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Bot, Play, FileText, CheckCircle, AlertCircle, Video, Mic, MicOff, Phone, PhoneOff } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"
import AssistantCreationProgress from "@/components/assistant-creation-progress"
import InterviewEvaluation from "@/components/interview-evaluation"
import Vapi from "@vapi-ai/web"

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

  // Vapi interview states
  const [vapiInstance, setVapiInstance] = useState<any>(null)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>>([])
  const [callDuration, setCallDuration] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Evaluation data
  const [evaluationData, setEvaluationData] = useState<{
    conversationHistory: Array<{role: 'user' | 'assistant', text: string, timestamp: Date}>
    duration: number
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Initialize Vapi when assistant is created
  useEffect(() => {
    if (dynamicAssistantId && currentStep === "interview") {
      initializeVapi()
    }
  }, [dynamicAssistantId, currentStep])

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container')
    if (chatContainer && conversationHistory.length > 0) {
      setTimeout(() => {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [conversationHistory])

  // Debug currentStep changes
  useEffect(() => {
    console.log('🔄 Current step changed to:', currentStep)
  }, [currentStep])

  const initializeVapi = () => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    console.log('🔑 Initializing Vapi with key:', !!apiKey)
    
    if (!apiKey || apiKey === "your_vapi_public_key_here") {
      setError('Vapi public key not configured. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local')
      return
    }

    try {
      const vapi = new Vapi(apiKey)
      setVapiInstance(vapi)
      
      // Setup event listeners
      vapi.on('call-start', () => {
        console.log('✅ Call started')
        setIsCallActive(true)
        setStartTime(new Date())
        startCallTimer()
      })
      
      vapi.on('call-end', () => {
        console.log('📞 Call ended')
        setIsCallActive(false)
        stopCallTimer()
        
        // Prepare evaluation data - always transition even without startTime
        const endTime = new Date()
        const duration = startTime 
          ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
          : elapsedTime // Use elapsed time as fallback
          
        console.log('📊 Preparing evaluation data:', {
          conversationHistory: conversationHistory.length,
          duration
        })
        
        setEvaluationData({
          conversationHistory,
          duration
        })
        
        // Force transition to evaluation step
        console.log('🔄 Transitioning to evaluation step')
        setCurrentStep("evaluation")
      })
      
      vapi.on('message', (message: any) => {
        console.log('📨 Vapi message:', message.type)
        
        if (message.type === 'transcript' && message.transcript) {
          const newEntry = {
            role: message.role as 'user' | 'assistant',
            text: message.transcript,
            timestamp: new Date()
          }
          setConversationHistory(prev => [...prev, newEntry])
        }
      })
      
      vapi.on('error', (error: any) => {
        console.error('❌ Vapi error:', error)
        setError(`Interview error: ${error.message || 'Unknown error'}`)
      })
      
    } catch (error) {
      console.error('❌ Failed to initialize Vapi:', error)
      setError('Failed to initialize voice interview')
    }
  }

  const startCall = async () => {
    if (!vapiInstance || !dynamicAssistantId) {
      setError('Interview not ready. Please try again.')
      return
    }

    try {
      console.log('🚀 Starting call with assistant:', dynamicAssistantId)
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start the call
      await vapiInstance.start(dynamicAssistantId)
      
    } catch (error) {
      console.error('❌ Failed to start call:', error)
      setError('Failed to start interview. Please check microphone permissions.')
    }
  }

  const endCall = () => {
    console.log('🔚 Manually ending call...')
    if (vapiInstance) {
      vapiInstance.stop()
    } else {
      // Fallback if vapiInstance not available
      console.log('⚠️ No vapi instance, forcing evaluation transition')
      setIsCallActive(false)
      stopCallTimer()
      
      const duration = elapsedTime || 0
      setEvaluationData({
        conversationHistory,
        duration
      })
      setCurrentStep("evaluation")
    }
  }

  const toggleMute = () => {
    if (vapiInstance) {
      vapiInstance.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  // Timer functions
  const startCallTimer = () => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    setTimerInterval(interval)
  }

  const stopCallTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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
      console.log('🚀 Starting comprehensive analysis process...')
      
      // Execute all API calls in parallel for better performance and data consistency
      console.log('⚡ Running parallel API calls: Checklist + CV Analysis + Question Generation')
      
      const startTime = Date.now()
      
      const [checklistResult, analysisResult, questionsResult] = await Promise.all([
        // 1. Generate checklist from JD
        APIClient.generateChecklist(jobDescription).then(result => {
          console.log('✅ Checklist generation completed')
          return result
        }),
        
        // 2. Analyze CV compatibility with JD  
        APIClient.analyzeCV(jobDescription, cvFile).then(result => {
          console.log('✅ CV analysis completed')
          return result
        }),
        
        // 3. Generate interview questions using your backend API (considers both JD + CV)
        APIClient.generateQuestions(jobDescription, cvFile, questionMode).then(result => {
          console.log('✅ Question generation completed')
          return result
        })
      ])

      const endTime = Date.now()
      console.log(`🚀 All parallel API calls completed in ${endTime - startTime}ms`)

      console.log('📋 Checklist result:', checklistResult)
      console.log('📄 Analysis result:', analysisResult)
      console.log('❓ Questions result:', questionsResult)

      // Process checklist result
      if (checklistResult.status && checklistResult.data) {
        setChecklist(checklistResult.data.checklist || checklistResult.data)
      } else {
        setChecklist(checklistResult.checklist || checklistResult)
      }

      // Process CV analysis result
      if (analysisResult.status && analysisResult.data) {
        setCvAnalysis(analysisResult.data)
      } else {
        setCvAnalysis(analysisResult)
      }

      // Process questions result from your backend API
      if (questionsResult.status && questionsResult.data) {
        setQuestions(questionsResult.data.questions || questionsResult.data)
      } else {
        setQuestions(questionsResult.questions || questionsResult)
      }

      console.log('✅ Upload process completed successfully')
      setCurrentStep("analysis")
    } catch (err) {
      console.error('❌ Upload process failed:', err)
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
      // Create session - ensure we have a sessionId
      let sessionId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      try {
        const result = await APIClient.startInterview(jobDescription, cvFile!, questionMode)
        console.log('📋 Start interview result:', result)
        
        if (result.status && result.data) {
          sessionId = result.data.sessionId || result.data.id || sessionId
        } else {
          sessionId = result.sessionId || result.id || sessionId
        }
      } catch (apiError) {
        console.warn('⚠️ Start interview API failed, using generated sessionId:', apiError)
      }
      
      console.log('🆔 Using sessionId:', sessionId)
      setSessionId(sessionId)

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
      
      // Stay on current page for interview
      setCurrentStep("interview")
      
      console.log('🎯 Ready for interview with assistant:', assistantId, 'sessionId:', sessionId)

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

          {/* Step 3: Interview - Google Meet Style Interface */}
          {currentStep === "interview" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden h-[85vh] flex flex-col">
                {/* Header Bar */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-blue-600" />
                    <h2 className="text-gray-900 font-semibold">AI Interview Session</h2>
                    {isCallActive && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {formatTime(elapsedTime)}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {candidateName} • Interview Room
                    {/* Test button for development */}
                    {process.env.NODE_ENV === 'development' && (
                      <button 
                        onClick={() => {
                          const testMessages = [
                            "Hello, welcome to your interview today!",
                            "Thank you, I'm excited to be here!",
                            "Can you tell me about your background?",
                            "I have 5 years of experience in software development...",
                            "What interests you about this position?",
                            "I'm passionate about creating user-friendly applications...",
                            "Describe a challenging project you've worked on.",
                            "Recently, I built a real-time chat application...",
                            "How do you handle working under pressure?",
                            "I prioritize tasks and maintain clear communication...",
                            "Do you have any questions for us?",
                            "Yes, what does a typical day look like in this role?"
                          ];
                          
                          testMessages.forEach((msg, index) => {
                            setTimeout(() => {
                              const newEntry = {
                                role: index % 2 === 0 ? 'assistant' as const : 'user' as const,
                                text: msg,
                                timestamp: new Date()
                              };
                              setConversationHistory(prev => [...prev, newEntry]);
                            }, index * 800);
                          });
                        }}
                        className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Test
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 flex min-h-0">
                  {/* Video Section */}
                  <div className="flex-1 bg-gray-50 relative flex items-center justify-center">
                    {/* AI Avatar/Video Placeholder */}
                    <div className="relative">
                      <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Bot className="h-24 w-24 text-white" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-gray-900 text-xl font-semibold mb-2">AI Interviewer</h3>
                        <p className="text-gray-600 text-sm">
                          {isCallActive ? "Listening..." : "Ready to start interview"}
                        </p>
                      </div>
                    </div>

                    {/* Call Status Overlay */}
                    {!isCallActive && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                          <Button
                            onClick={startCall}
                            className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg mb-4 rounded-full shadow-lg"
                            size="lg"
                          >
                            <Phone className="mr-3 h-6 w-6" />
                            Join Interview
                          </Button>
                          <p className="text-gray-600 text-sm">Click to start your AI interview session</p>
                        </div>
                      </div>
                    )}

                    {/* User Video Corner */}
                    {isCallActive && (
                      <div className="absolute bottom-6 right-6 w-36 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <span className="text-white text-sm font-semibold">
                              {candidateName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs font-medium">You</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Panel - Fixed width and height */}
                  <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                    {/* Chat Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Interview Transcript
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Live conversation log</p>
                    </div>

                    {/* Chat Messages - Scrollable area with fixed height */}
                    <div 
                      className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
                      id="chat-container"
                      style={{ 
                        maxHeight: 'calc(85vh - 220px)',
                        minHeight: '300px'
                      }}
                    >
                      {conversationHistory.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Conversation will appear here</p>
                        </div>
                      ) : (
                        conversationHistory.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-lg shadow-sm ${
                                message.role === "assistant"
                                  ? "bg-blue-50 text-gray-900 rounded-bl-sm border border-blue-100"
                                  : "bg-blue-600 text-white rounded-br-sm"
                              }`}
                            >
                              <div className="text-xs font-medium mb-1 opacity-75">
                                {message.role === "assistant" ? "AI Interviewer" : "You"}
                              </div>
                              <div className="text-sm leading-relaxed">{message.text}</div>
                              <div className="text-xs opacity-50 mt-1">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Interview Tips - Fixed at bottom */}
                    <div className="p-4 border-t border-gray-200 bg-blue-50 flex-shrink-0">
                      <h4 className="font-medium text-blue-900 text-sm mb-2">💡 Interview Tips</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Speak clearly and naturally</li>
                        <li>• Take time to think before answering</li>
                        <li>• Ask for clarification if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Control Bar */}
                {isCallActive && (
                  <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center gap-6 flex-shrink-0">
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="lg"
                      className={`rounded-full w-14 h-14 p-0 shadow-lg border-2 ${
                        isMuted 
                          ? "bg-red-100 hover:bg-red-200 text-red-600 border-red-300" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                      }`}
                    >
                      {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                    </Button>
                    
                    <Button
                      onClick={endCall}
                      variant="ghost"
                      size="lg"
                      className="rounded-full w-14 h-14 p-0 bg-red-100 hover:bg-red-200 text-red-600 border-2 border-red-300 shadow-lg"
                    >
                      <PhoneOff className="h-6 w-6" />
                    </Button>
                    
                    {/* Additional controls like Google Meet */}
                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-green-600 text-sm font-medium">
                        🔴 Recording
                      </div>
                      <div className="text-gray-400 text-sm">
                        |
                      </div>
                      <div className="text-gray-600 text-sm">
                        {conversationHistory.length} messages
                      </div>
                      
                      {/* Test button for development */}
                      {process.env.NODE_ENV === 'development' && (
                        <>
                          <div className="text-gray-400 text-sm">|</div>
                          <button 
                            onClick={() => {
                              console.log('🧪 Force ending interview for testing')
                              setIsCallActive(false)
                              stopCallTimer()
                              
                              const duration = elapsedTime || 30
                              setEvaluationData({
                                conversationHistory,
                                duration
                              })
                              setCurrentStep("evaluation")
                            }}
                            className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded hover:bg-orange-200"
                          >
                            Force End
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg border border-red-600">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Evaluation */}
          {currentStep === "evaluation" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {(() => {
                console.log('🎯 Rendering evaluation step with data:', {
                  candidateName,
                  sessionId,
                  questionsCount: questions.length,
                  conversationCount: evaluationData?.conversationHistory?.length,
                  duration: evaluationData?.duration
                })
                return null
              })()}
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
