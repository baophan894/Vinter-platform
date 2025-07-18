"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mic,
  Volume2,
  VolumeX,
  Square,
  Download,
  MessageCircle,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { APIClient } from "@/lib/api"

interface VapiInterviewProps {
  questions: string[]
  sessionId: string
  candidateName: string
  onComplete: () => void
}

type CallStatus = "idle" | "connecting" | "connected" | "ended" | "error"

// Extend Window interface for Vapi
declare global {
  interface Window {
    Vapi: any
  }
}

export function VapiInterview({ questions, sessionId, candidateName, onComplete }: VapiInterviewProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [transcript, setTranscript] = useState<
    Array<{
      speaker: "assistant" | "user"
      message: string
      timestamp: Date
    }>
  >([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [vapiLoaded, setVapiLoaded] = useState(false)

  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const vapiRef = useRef<any>(null)

  // Load Vapi Web SDK
  useEffect(() => {
    const loadVapiSDK = () => {
      if (window.Vapi) {
        setVapiLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
      script.onload = () => {
        setVapiLoaded(true)
        console.log("Vapi SDK loaded successfully")
      }
      script.onerror = () => {
        setError("Không thể tải Vapi SDK")
      }
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    loadVapiSDK()
  }, [])

  // Initialize Vapi when SDK is loaded
  useEffect(() => {
    if (vapiLoaded && window.Vapi && !vapiRef.current) {
      try {
        vapiRef.current = new window.Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)

        // Set up event listeners
        vapiRef.current.on("call-start", () => {
          console.log("Call started")
          setCallStatus("connected")
          startCallTimer()
          addToTranscript("assistant", `Xin chào ${candidateName}! Tôi là AI interviewer sẽ phỏng vấn bạn hôm nay.`)
        })

        vapiRef.current.on("call-end", () => {
          console.log("Call ended")
          setCallStatus("ended")
          stopCallTimer()
          handleCallEnd()
        })

        vapiRef.current.on("speech-start", () => {
          console.log("User started speaking")
          setIsRecording(true)
        })

        vapiRef.current.on("speech-end", () => {
          console.log("User stopped speaking")
          setIsRecording(false)
        })

        vapiRef.current.on("message", (message: any) => {
          console.log("Vapi message:", message)

          if (message.type === "transcript") {
            addToTranscript(message.role, message.transcript)
          }

          if (message.type === "conversation-update") {
            // Handle conversation updates
            console.log("Conversation update:", message)
          }
        })

        vapiRef.current.on("error", (error: any) => {
          console.error("Vapi error:", error)
          setError(`Lỗi cuộc gọi: ${error.message || "Unknown error"}`)
          setCallStatus("error")
        })

        vapiRef.current.on("volume-level", (volume: number) => {
          // Handle volume level for visual feedback
          console.log("Volume level:", volume)
        })
      } catch (err: any) {
        console.error("Error initializing Vapi:", err)
        setError(`Không thể khởi tạo Vapi: ${err.message}`)
      }
    }

    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop()
        } catch (err) {
          console.error("Error stopping Vapi:", err)
        }
      }
    }
  }, [vapiLoaded, candidateName])

  // Start call timer
  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  // Stop call timer
  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      callTimerRef.current = null
    }
  }

  // Add message to transcript
  const addToTranscript = (speaker: "assistant" | "user", message: string) => {
    setTranscript((prev) => [
      ...prev,
      {
        speaker,
        message,
        timestamp: new Date(),
      },
    ])
  }

  // Create assistant configuration
  const createAssistant = () => {
    return {
      name: `Interview Assistant for ${candidateName}`,
      firstMessage: `Xin chào ${candidateName}! Tôi là AI interviewer sẽ phỏng vấn bạn hôm nay. Chúng ta sẽ có ${questions.length} câu hỏi. Bạn đã sẵn sàng chưa?`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Bạn là một AI interviewer chuyên nghiệp đang phỏng vấn ứng viên tên ${candidateName}.

NHIỆM VỤ:
- Tiến hành phỏng vấn một cách tự nhiên và thân thiện
- Hỏi từng câu một theo thứ tự
- Lắng nghe và phản hồi phù hợp
- Chuyển sang câu hỏi tiếp theo sau khi ứng viên trả lời xong
- Kết thúc phỏng vấn khi hết câu hỏi

CÁC CÂU HỎI PHỎNG VẤN:
${questions.map((q, index) => `${index + 1}. ${q}`).join("\n")}

HƯỚNG DẪN:
- Bắt đầu bằng lời chào thân thiện
- Hỏi từng câu một cách tự nhiên
- Có thể hỏi thêm để làm rõ nếu cần
- Phản hồi tích cực với câu trả lời
- Sử dụng tiếng Việt tự nhiên
- Giữ giọng điệu chuyên nghiệp nhưng thân thiện
- Mỗi phản hồi không quá 50 từ

Hãy bắt đầu cuộc phỏng vấn một cách tự nhiên!`,
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Adam voice - professional
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.2,
        useSpeakerBoost: true,
      },
      recordingEnabled: true,
      endCallMessage: `Cảm ơn ${candidateName} đã tham gia phỏng vấn. Chúc bạn may mắn!`,
      endCallPhrases: ["kết thúc", "tạm biệt", "cảm ơn", "bye", "goodbye", "hoàn thành"],
      maxDurationSeconds: 1800, // 30 minutes max
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 1,
      llmRequestDelaySeconds: 0.1,
      numWordsToInterruptAssistant: 2,
      backgroundSound: "office",
    }
  }

  // Start web call
  const startWebCall = async () => {
    if (!vapiRef.current) {
      setError("Vapi chưa được khởi tạo")
      return
    }

    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      setError("Vapi Public Key chưa được cấu hình")
      return
    }

    try {
      setLoading(true)
      setCallStatus("connecting")
      setError("")

      const assistant = createAssistant()

      console.log("Starting Vapi call with assistant:", assistant)

      await vapiRef.current.start(assistant)

      // The call status will be updated by event listeners
    } catch (err: any) {
      console.error("Error starting web call:", err)
      setError(`Không thể bắt đầu cuộc gọi: ${err.message}`)
      setCallStatus("error")
    } finally {
      setLoading(false)
    }
  }

  // End call
  const endCall = async () => {
    try {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
      setCallStatus("ended")
      stopCallTimer()
      handleCallEnd()
    } catch (error) {
      console.error("Error ending call:", error)
    }
  }

  // Handle call end
  const handleCallEnd = async () => {
    try {
      // Save transcript to backend
      if (transcript.length > 0) {
        const transcriptText = transcript.map((entry) => `${entry.speaker}: ${entry.message}`).join("\n")

        await APIClient.saveInterviewQA(sessionId, "Vapi AI Interview Transcript", transcriptText)
      }

      // Complete the interview
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error) {
      console.error("Error handling call end:", error)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    if (vapiRef.current) {
      if (isMuted) {
        vapiRef.current.setMuted(false)
      } else {
        vapiRef.current.setMuted(true)
      }
      setIsMuted(!isMuted)
    }
  }

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Download transcript
  const downloadTranscript = () => {
    const transcriptText = transcript
      .map((entry) => `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker.toUpperCase()}: ${entry.message}`)
      .join("\n")

    const blob = new Blob([transcriptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vapi-interview-transcript-${sessionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!vapiLoaded) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            <span className="ml-2">Đang tải Vapi SDK...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vapi Public Key chưa được cấu hình. Vui lòng thêm NEXT_PUBLIC_VAPI_PUBLIC_KEY vào environment variables.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-900" />
              Phỏng vấn với Vapi AI
              <Badge variant="outline" className="text-xs">
                Web Call
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={callStatus === "connected" ? "default" : "secondary"}>
                {callStatus === "idle" && "Chưa bắt đầu"}
                {callStatus === "connecting" && "Đang kết nối..."}
                {callStatus === "connected" && `Đang gọi - ${formatDuration(callDuration)}`}
                {callStatus === "ended" && "Đã kết thúc"}
                {callStatus === "error" && "Lỗi"}
              </Badge>
            </div>
          </div>
          <Progress value={callStatus === "ended" ? 100 : callStatus === "connected" ? 50 : 0} className="h-2" />
        </CardHeader>
      </Card>

      {/* Start Call */}
      {callStatus === "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu phỏng vấn với Vapi AI</CardTitle>
            <CardDescription>AI sẽ phỏng vấn bạn trực tiếp qua microphone với giọng nói tự nhiên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin phỏng vấn:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Ứng viên: <strong>{candidateName}</strong>
                </li>
                <li>
                  • Số câu hỏi: <strong>{questions.length} câu</strong>
                </li>
                <li>
                  • Thời gian dự kiến: <strong>15-30 phút</strong>
                </li>
                <li>
                  • AI sử dụng: <strong>GPT-4 + ElevenLabs Voice</strong>
                </li>
              </ul>
            </div>

            <Button onClick={startWebCall} className="w-full bg-blue-900 hover:bg-blue-800" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang kết nối...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Bắt đầu phỏng vấn với AI
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Call Controls */}
      {(callStatus === "connected" || callStatus === "connecting") && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              {/* Mute Button */}
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="w-16 h-16 rounded-full"
                title={isMuted ? "Bật mic" : "Tắt mic"}
              >
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              {/* Recording Indicator */}
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ repeat: isRecording ? Number.POSITIVE_INFINITY : 0, duration: 1 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isRecording ? "bg-red-100 border-2 border-red-300" : "bg-gray-100"
                }`}
                title={isRecording ? "Đang ghi âm" : "Không ghi âm"}
              >
                <Mic className={`h-6 w-6 ${isRecording ? "text-red-600" : "text-gray-400"}`} />
              </motion.div>

              {/* End Call Button */}
              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="w-16 h-16 rounded-full"
                title="Kết thúc cuộc gọi"
              >
                <Square className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">Đang phỏng vấn với Vapi AI qua microphone</p>
              <p className="text-xs text-gray-500 mt-1">Thời gian: {formatDuration(callDuration)}</p>
              {isRecording && <p className="text-xs text-red-600 mt-1 font-medium">🔴 Đang ghi âm - Bạn có thể nói</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Transcript */}
      {transcript.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Transcript trực tiếp</CardTitle>
              <Button onClick={downloadTranscript} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Tải xuống
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {transcript.map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-3 ${entry.speaker === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${entry.speaker === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.speaker === "assistant" ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      {entry.speaker === "assistant" ? (
                        <Bot className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-green-600" />
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        entry.speaker === "assistant"
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <p className="text-sm">{entry.message}</p>
                      <div className="text-xs text-gray-500 mt-1">{entry.timestamp.toLocaleTimeString("vi-VN")}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Call Ended */}
      {callStatus === "ended" && (
        <Card className="text-center">
          <CardContent className="pt-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hoàn thành phỏng vấn!</h2>
            <p className="text-gray-600 mb-8">
              Cuộc phỏng vấn với Vapi AI đã kết thúc. Thời gian: {formatDuration(callDuration)}
            </p>
            <div className="flex gap-4 justify-center">
              {transcript.length > 0 && (
                <Button onClick={downloadTranscript} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Tải transcript
                </Button>
              )}
              <Button onClick={() => window.location.reload()}>Phỏng vấn mới</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Hướng dẫn sử dụng Vapi AI Web Call:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Microphone:</strong> Cho phép truy cập microphone khi được yêu cầu
            </li>
            <li>
              • <strong>Tự động ghi âm:</strong> AI sẽ tự động phát hiện khi bạn nói
            </li>
            <li>
              • <strong>Transcript realtime:</strong> Xem transcript trong lúc nói chuyện
            </li>
            <li>
              • <strong>AI thông minh:</strong> Sử dụng GPT-4 và ElevenLabs voice chất lượng cao
            </li>
            <li>
              • <strong>Điều khiển:</strong> Có thể mute/unmute và kết thúc cuộc gọi bất kỳ lúc nào
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
