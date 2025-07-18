"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, Play, Pause, AlertCircle, MessageCircle, Bot, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { APIClient } from "@/lib/api"

interface ConversationalInterviewProps {
  questions: string[]
  sessionId: string
  candidateName: string
  onComplete: () => void
}

type ConversationState = "greeting" | "asking" | "listening" | "processing" | "responding" | "completed"

export function ConversationalInterview({
  questions,
  sessionId,
  candidateName,
  onComplete,
}: ConversationalInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1) // Start with -1 for greeting
  const [conversationState, setConversationState] = useState<ConversationState>("greeting")
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [transcription, setTranscription] = useState("")
  const [confidence, setConfidence] = useState<number>(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      speaker: "ai" | "user"
      message: string
      timestamp: Date
      confidence?: number
    }>
  >([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [autoMode, setAutoMode] = useState(true)
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null)
  const [useWebSpeech, setUseWebSpeech] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check Web Speech API support
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      console.warn("Web Speech API not supported")
    }
  }, [])

  // Auto-start conversation when component mounts
  useEffect(() => {
    if (conversationState === "greeting") {
      startConversation()
    }
  }, [])

  // Auto-play audio when it's ready
  useEffect(() => {
    if (audioUrl && autoMode && (conversationState === "asking" || conversationState === "greeting")) {
      setTimeout(() => {
        playAudio()
      }, 500) // Small delay for better UX
    }
  }, [audioUrl, conversationState, autoMode])

  // Start the conversation with greeting
  const startConversation = async () => {
    const greetingText = `Xin chào ${candidateName}! Tôi là trợ lý AI sẽ phỏng vấn bạn hôm nay. Chúng ta sẽ có ${questions.length} câu hỏi. Bạn đã sẵn sàng chưa?`

    addToConversation("ai", greetingText)
    await generateAndPlayAudio(greetingText)

    // Auto start listening after greeting
    setTimeout(() => {
      if (autoMode) {
        startListening()
      }
    }, 3000) // Increased delay for speech
  }

  // Generate audio with fallback to Web Speech API
  const generateAndPlayAudio = async (text: string) => {
    try {
      setLoading(true)
      setError("")

      // Try FPT.AI TTS first
      if (!useWebSpeech) {
        try {
          const result = await APIClient.textToSpeech(text)
          console.log("TTS Response:", result)

          let audioUrl = ""

          // Handle different response formats
          if (result.status && result.data?.audioUrl) {
            audioUrl = result.data.audioUrl
          } else if (result.audioUrl) {
            audioUrl = result.audioUrl
          } else if (result.data) {
            audioUrl = result.data
          } else if (typeof result === "string") {
            audioUrl = result
          }

          if (audioUrl) {
            console.log("Audio URL:", audioUrl)

            // Try to use proxied audio URL through backend
            const proxiedUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/speech/proxy-audio?url=${encodeURIComponent(audioUrl)}`

            try {
              const testResponse = await fetch(proxiedUrl, { method: "HEAD" })
              if (testResponse.ok) {
                setAudioUrl(proxiedUrl)
                return
              }
            } catch (proxyError) {
              console.log("Proxy failed, trying direct URL")
            }

            // Try direct URL
            setAudioUrl(audioUrl)
            return
          }
        } catch (apiError) {
          console.error("FPT.AI TTS failed:", apiError)
        }
      }

      // Fallback to Web Speech API
      console.log("Using Web Speech API fallback")
      await playWithWebSpeech(text)
    } catch (err) {
      console.error("Error generating audio:", err)
      setError(`Không thể tạo audio. Sử dụng Web Speech API.`)
      await playWithWebSpeech(text)
    } finally {
      setLoading(false)
    }
  }

  // Web Speech API fallback
  const playWithWebSpeech = async (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Web Speech API not supported"))
        return
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      speechSynthRef.current = utterance

      // Configure voice
      const voices = window.speechSynthesis.getVoices()
      const vietnameseVoice = voices.find((voice) => voice.lang.includes("vi") || voice.name.includes("Vietnamese"))

      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice
      }

      utterance.lang = "vi-VN"
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => {
        console.log("Web Speech started")
        setIsPlaying(true)
        setUseWebSpeech(true)
      }

      utterance.onend = () => {
        console.log("Web Speech ended")
        setIsPlaying(false)
        resolve()
      }

      utterance.onerror = (event) => {
        console.error("Web Speech error:", event)
        setIsPlaying(false)
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      // Start speaking
      window.speechSynthesis.speak(utterance)
    })
  }

  // Play audio with fallback handling
  const playAudio = async () => {
    if (useWebSpeech || !audioUrl) {
      // Already using Web Speech or no audio URL
      return
    }

    if (!audioRef.current) {
      console.error("No audio element")
      return
    }

    try {
      console.log("Attempting to play audio:", audioUrl)

      // Reset audio element
      audioRef.current.currentTime = 0
      audioRef.current.crossOrigin = "anonymous"

      // Load and play
      audioRef.current.load()

      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        await playPromise
        setIsPlaying(true)
        console.log("Audio playing successfully")
      }
    } catch (err) {
      console.error("Error playing audio:", err)

      // Fallback to Web Speech
      const lastMessage = conversationHistory[conversationHistory.length - 1]
      if (lastMessage && lastMessage.speaker === "ai") {
        console.log("Falling back to Web Speech API")
        await playWithWebSpeech(lastMessage.message)
      }
    }
  }

  // Add message to conversation history
  const addToConversation = (speaker: "ai" | "user", message: string, confidence?: number) => {
    setConversationHistory((prev) => [
      ...prev,
      {
        speaker,
        message,
        timestamp: new Date(),
        confidence,
      },
    ])
  }

  // Start listening for user response
  const startListening = async () => {
    try {
      setError("")
      setConversationState("listening")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await processUserResponse(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000)
      setIsRecording(true)

      // Auto-stop recording after silence (optional)
      if (autoMode) {
        const timer = setTimeout(() => {
          if (isRecording) {
            stopListening()
          }
        }, 30000) // 30 seconds max
        setSilenceTimer(timer)
      }
    } catch (err) {
      setError("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập.")
      console.error("Error accessing microphone:", err)
    }
  }

  // Stop listening
  const stopListening = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setConversationState("processing")

      if (silenceTimer) {
        clearTimeout(silenceTimer)
        setSilenceTimer(null)
      }
    }
  }

  // Process user response
  const processUserResponse = async (audioBlob: Blob) => {
    try {
      setLoading(true)
      const audioFile = new File([audioBlob], "response.webm", { type: "audio/webm" })
      const result = await APIClient.transcribeAudio(audioFile)

      if (result.status && result.data?.hypotheses && result.data.hypotheses.length > 0) {
        const hypothesis = result.data.hypotheses[0]
        const userResponse = hypothesis.utterance
        const confidence = Math.round(hypothesis.confidence)

        setTranscription(userResponse)
        setConfidence(confidence)

        // Add user response to conversation
        addToConversation("user", userResponse, confidence)

        // Handle the response based on current state
        if (currentQuestionIndex === -1) {
          // This was response to greeting
          await handleGreetingResponse(userResponse)
        } else {
          // This was response to interview question
          await handleQuestionResponse(userResponse)
        }
      } else {
        throw new Error("No transcription found")
      }
    } catch (err) {
      setError("Không thể chuyển đổi giọng nói. Vui lòng thử lại.")
      console.error("Error processing response:", err)

      // Retry listening
      setTimeout(() => {
        if (autoMode) {
          startListening()
        }
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  // Handle response to greeting
  const handleGreetingResponse = async (response: string) => {
    const isReady =
      response.toLowerCase().includes("sẵn sàng") ||
      response.toLowerCase().includes("ok") ||
      response.toLowerCase().includes("được") ||
      response.toLowerCase().includes("bắt đầu") ||
      response.toLowerCase().includes("yes") ||
      response.toLowerCase().includes("ready")

    if (isReady) {
      // Start first question
      setCurrentQuestionIndex(0)
      await askNextQuestion(0)
    } else {
      // Encourage and ask again
      const encourageText = "Không sao, bạn hãy thư giãn. Khi nào sẵn sàng thì chúng ta bắt đầu nhé!"
      addToConversation("ai", encourageText)
      await generateAndPlayAudio(encourageText)

      setTimeout(() => {
        if (autoMode) {
          startListening()
        }
      }, 4000)
    }
  }

  // Handle response to interview question
  const handleQuestionResponse = async (response: string) => {
    try {
      // Save the answer
      await APIClient.saveInterviewQA(sessionId, questions[currentQuestionIndex], response)

      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = response
      setAnswers(newAnswers)

      // AI acknowledgment
      const acknowledgments = ["Cảm ơn bạn đã chia sẻ. ", "Rất hay! ", "Tôi hiểu rồi. ", "Thú vị! "]
      const randomAck = acknowledgments[Math.floor(Math.random() * acknowledgments.length)]

      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        const nextIndex = currentQuestionIndex + 1
        const transitionText = `${randomAck}Chúng ta chuyển sang câu hỏi tiếp theo nhé.`

        addToConversation("ai", transitionText)
        await generateAndPlayAudio(transitionText)

        // Wait a bit then ask next question
        setTimeout(async () => {
          setCurrentQuestionIndex(nextIndex)
          await askNextQuestion(nextIndex)
        }, 3000)
      } else {
        // Interview completed
        const completionText = `${randomAck}Vậy là chúng ta đã hoàn thành cuộc phỏng vấn. Cảm ơn ${candidateName} đã dành thời gian. Chúc bạn may mắn!`

        addToConversation("ai", completionText)
        await generateAndPlayAudio(completionText)

        setTimeout(() => {
          setConversationState("completed")
          onComplete()
        }, 4000)
      }
    } catch (err) {
      setError("Có lỗi khi lưu câu trả lời")
      console.error(err)
    }
  }

  // Ask next question
  const askNextQuestion = async (questionIndex: number) => {
    setConversationState("asking")
    const questionText = questions[questionIndex]

    addToConversation("ai", questionText)
    await generateAndPlayAudio(questionText)

    // Auto start listening after question
    setTimeout(() => {
      if (autoMode) {
        startListening()
      }
    }, 3000)
  }

  // Toggle auto mode
  const toggleAutoMode = () => {
    setAutoMode(!autoMode)
    if (autoMode && isRecording) {
      stopListening()
    }
  }

  // Manual controls
  const manualStartListening = () => {
    if (!isRecording) {
      startListening()
    } else {
      stopListening()
    }
  }

  // Stop all audio
  const stopAllAudio = () => {
    // Stop Web Speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    // Stop HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setIsPlaying(false)
  }

  const getStateMessage = () => {
    switch (conversationState) {
      case "greeting":
        return "Đang chào hỏi..."
      case "asking":
        return "AI đang hỏi câu hỏi"
      case "listening":
        return "Đang lắng nghe câu trả lời của bạn..."
      case "processing":
        return "Đang xử lý câu trả lời..."
      case "responding":
        return "AI đang phản hồi..."
      case "completed":
        return "Hoàn thành phỏng vấn"
      default:
        return ""
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-900" />
              Phỏng vấn trò chuyện với AI
              {useWebSpeech && (
                <Badge variant="outline" className="text-xs">
                  Web Speech
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentQuestionIndex >= 0 && (
                <Badge variant="secondary">
                  Câu {currentQuestionIndex + 1}/{questions.length}
                </Badge>
              )}
              <Button onClick={toggleAutoMode} variant={autoMode ? "default" : "outline"} size="sm">
                {autoMode ? "Tự động" : "Thủ công"}
              </Button>
            </div>
          </div>
          {currentQuestionIndex >= 0 && (
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
          )}
        </CardHeader>
      </Card>

      {/* Conversation Display */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Cuộc trò chuyện</CardTitle>
            <Badge variant="outline" className="text-sm">
              {getStateMessage()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {conversationHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${entry.speaker === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${entry.speaker === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      entry.speaker === "ai" ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    {entry.speaker === "ai" ? (
                      <Bot className="h-4 w-4 text-blue-600" />
                    ) : (
                      <User className="h-4 w-4 text-green-600" />
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-lg ${
                      entry.speaker === "ai"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <p className="text-sm">{entry.message}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{entry.timestamp.toLocaleTimeString("vi-VN")}</span>
                      {entry.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {entry.confidence}% tin cậy
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
                <span className="text-sm text-gray-600">
                  {conversationState === "processing" ? "Đang xử lý..." : "Đang tạo phản hồi..."}
                </span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            {/* Recording Button */}
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ repeat: isRecording ? Number.POSITIVE_INFINITY : 0, duration: 1 }}
            >
              <Button
                onClick={manualStartListening}
                size="lg"
                className={`w-16 h-16 rounded-full ${
                  isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-900 hover:bg-blue-800"
                }`}
                disabled={loading || conversationState === "completed"}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>
            </motion.div>

            {/* Audio Control */}
            <Button onClick={isPlaying ? stopAllAudio : playAudio} variant="outline" size="lg" disabled={loading}>
              {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isPlaying ? "Dừng" : "Phát lại"}
            </Button>

            {/* Test Audio Button */}
            <Button
              onClick={async () => {
                await generateAndPlayAudio("Đây là test audio. Bạn có nghe được không?")
              }}
              variant="outline"
              size="lg"
              disabled={loading}
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Test
            </Button>

            {/* Force Web Speech */}
            <Button
              onClick={() => {
                setUseWebSpeech(!useWebSpeech)
                if (useWebSpeech) {
                  stopAllAudio()
                }
              }}
              variant={useWebSpeech ? "default" : "outline"}
              size="sm"
            >
              Web Speech
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {autoMode ? "Chế độ tự động: AI sẽ tự động hỏi và lắng nghe" : "Chế độ thủ công: Nhấn nút để điều khiển"}
            </p>
            {useWebSpeech && <p className="text-xs text-blue-600 mt-1">Đang sử dụng Web Speech API của trình duyệt</p>}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced audio element with error handling */}
      {audioUrl && !useWebSpeech && (
        <audio
          ref={audioRef}
          src={audioUrl}
          crossOrigin="anonymous"
          preload="auto"
          onEnded={() => {
            console.log("Audio ended")
            setIsPlaying(false)
          }}
          onPlay={() => {
            console.log("Audio started playing")
            setIsPlaying(true)
          }}
          onPause={() => {
            console.log("Audio paused")
            setIsPlaying(false)
          }}
          onError={(e) => {
            console.error("Audio error:", e)
            setError("Lỗi phát audio. Chuyển sang Web Speech API.")

            // Auto fallback to Web Speech
            const lastMessage = conversationHistory[conversationHistory.length - 1]
            if (lastMessage && lastMessage.speaker === "ai") {
              playWithWebSpeech(lastMessage.message)
            }
          }}
          style={{ display: "none" }}
        />
      )}

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Hướng dẫn trò chuyện:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Tự động:</strong> AI sẽ tự động hỏi và lắng nghe
            </li>
            <li>
              • <strong>Web Speech:</strong> Sử dụng giọng nói của trình duyệt khi API lỗi
            </li>
            <li>
              • <strong>Test Audio:</strong> Kiểm tra xem có nghe được AI không
            </li>
            <li>• Nói tự nhiên như đang trò chuyện thật</li>
            <li>• Có thể chuyển giữa chế độ tự động và thủ công</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
