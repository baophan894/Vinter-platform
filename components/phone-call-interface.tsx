"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  MessageSquare,
  User,
  Bot,
  Download,
} from "lucide-react"

interface Props {
  questions: string[]
  sessionId: string
  candidateName: string
  onComplete: () => void
}

type CallStatus = "idle" | "connecting" | "ringing" | "connected" | "ended" | "error"

declare global {
  interface Window {
    Vapi: any
  }
}

export function PhoneCallInterface({ questions, sessionId, candidateName, onComplete }: Props) {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [transcript, setTranscript] = useState<
    Array<{ speaker: "assistant" | "user"; message: string; timestamp: Date }>
  >([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const vapiRef = useRef<any>(null)

  // Load Vapi Web SDK
  useEffect(() => {
    if (window.Vapi) return

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js"
    script.onload = () => {
      console.log("Vapi SDK loaded")
    }
    script.onerror = () => {
      setError("Không thể tải SDK Vapi")
    }
    document.head.appendChild(script)
  }, [])

  // Initialize Vapi SDK
  useEffect(() => {
    if (!window.Vapi || vapiRef.current) return

    try {
      vapiRef.current = new window.Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)

      vapiRef.current.on("call-start", () => {
        setCallStatus("connected")
        startCallTimer()
      })

      vapiRef.current.on("call-end", () => {
        setCallStatus("ended")
        stopCallTimer()
        handleCallEnd()
      })

      vapiRef.current.on("speech-start", () => setIsRecording(true))
      vapiRef.current.on("speech-end", () => setIsRecording(false))
      vapiRef.current.on("volume-level", (vol: number) => setVolumeLevel(vol))

      vapiRef.current.on("message", (msg: any) => {
        if (msg.type === "transcript") {
          setTranscript((prev) => [
            ...prev,
            {
              speaker: msg.role,
              message: msg.transcript,
              timestamp: new Date(),
            },
          ])
        }
      })

      vapiRef.current.on("error", (err: any) => {
        setCallStatus("error")
        setError(err.message || "Lỗi không xác định")
      })
    } catch (err: any) {
      console.error("Vapi init error", err)
      setError(err.message || "Không thể khởi tạo Vapi")
    }
  }, [])

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const stopCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current)
  }

  const handleCallEnd = () => {
    setTimeout(onComplete, 3000)
  }

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  const getStatusText = () => {
    switch (callStatus) {
      case "idle":
        return "Sẵn sàng gọi"
      case "connecting":
        return "Đang kết nối..."
      case "ringing":
        return "Đang gọi..."
      case "connected":
        return `Đang gọi - ${formatDuration(callDuration)}`
      case "ended":
        return "Đã kết thúc"
      case "error":
        return "Lỗi cuộc gọi"
      default:
        return ""
    }
  }

  const getStatusColor = () => {
    switch (callStatus) {
      case "connected":
        return "bg-green-500"
      case "ringing":
      case "connecting":
        return "bg-yellow-500"
      case "ended":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const startCall = async () => {
    try {
      setLoading(true)
      setCallStatus("connecting")

      const res = await fetch("/api/vapi/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateName, questions }),
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const assistantId = data.data.assistantId

      setCallStatus("ringing")

      setTimeout(() => {
        vapiRef.current.connect({
          assistant: assistantId,
          conversation: {
            start: {
              type: "text",
              text: `Chào ${candidateName}, bắt đầu nhé!`,
            },
          },
        })
      }, 1000)
    } catch (err: any) {
      setCallStatus("error")
      setError(err.message || "Lỗi không xác định khi gọi")
    } finally {
      setLoading(false)
    }
  }

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.disconnect()
    }
    setCallStatus("ended")
    stopCallTimer()
    handleCallEnd()
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-gray-700">
        <CardContent className="p-8">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-sm text-gray-300">{getStatusText()}</span>
            </div>
            <Badge variant="outline" className="text-gray-400 border-gray-600">
              AI Interview
            </Badge>
          </div>

          {/* Avatar */}
          <div className="text-center mb-6">
            <motion.div
              animate={callStatus === "ringing" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: callStatus === "ringing" ? Infinity : 0, duration: 1 }}
            >
              <Avatar className="w-28 h-28 mx-auto border-4 border-gray-600">
                <AvatarImage src="/ai-interviewer.png" />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  <Bot className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <h2 className="text-xl font-bold mt-2">AI Interviewer</h2>
            <p className="text-sm text-gray-400">Phỏng vấn {candidateName}</p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {callStatus === "idle" && (
              <Button onClick={startCall} disabled={loading} className="bg-green-500 rounded-full w-14 h-14">
                {loading ? <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full" /> : <Phone />}
              </Button>
            )}

            {(callStatus === "connected" || callStatus === "ringing") && (
              <>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  className={`rounded-full w-12 h-12 ${
                    isMuted ? "bg-red-500" : "bg-gray-700"
                  } text-white border-gray-600`}
                >
                  {isMuted ? <MicOff /> : <Mic />}
                </Button>

                <Button
                  onClick={endCall}
                  className="bg-red-500 rounded-full w-14 h-14 text-white hover:bg-red-600"
                >
                  <PhoneOff />
                </Button>

                <Button variant="outline" className="rounded-full w-12 h-12 bg-gray-700 text-white border-gray-600">
                  <Volume2 />
                </Button>
              </>
            )}
          </div>

          {/* Transcript */}
          {callStatus === "connected" && (
            <div className="mt-6 text-sm text-gray-400 text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex gap-1 items-center">
                  <MessageSquare className="w-4 h-4" />
                  {transcript.length} tin nhắn
                </div>
                <div className="flex gap-1 items-center">
                  <User className="w-4 h-4" />
                  {questions.length} câu hỏi
                </div>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-300 text-center">{error}</p>}
        </CardContent>
      </Card>

      {/* Live Transcript (Short view) */}
      {callStatus === "connected" && transcript.length > 0 && (
        <Card className="mt-4 bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <h3 className="text-white font-medium">Transcript</h3>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2 text-sm">
              <AnimatePresence>
                {transcript.slice(-5).map((entry, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <span
                      className={entry.speaker === "assistant" ? "text-blue-400" : "text-green-400"}
                    >
                      {entry.speaker === "assistant" ? "AI" : "Bạn"}:
                    </span>{" "}
                    <span className="text-gray-300">{entry.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
