"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, Play, Pause, RotateCcw, CheckCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"

interface VoiceInterviewEnhancedProps {
  questions: string[]
  sessionId: string
  onComplete: () => void
}

export function VoiceInterviewEnhanced({ questions, sessionId, onComplete }: VoiceInterviewEnhancedProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [transcription, setTranscription] = useState("")
  const [confidence, setConfidence] = useState<number>(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [audioGenerating, setAudioGenerating] = useState(false)
  const [transcribing, setTranscribing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio for current question
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      generateQuestionAudio(questions[currentQuestionIndex])
    }
  }, [currentQuestionIndex, questions])

  // Generate audio for question using TTS
  const generateQuestionAudio = async (questionText: string) => {
    try {
      setAudioGenerating(true)
      setError("")
      const result = await APIClient.textToSpeech(questionText)

      // Handle response format: { status: true, data: { audioUrl: "..." } }
      if (result.status && result.data?.audioUrl) {
        setAudioUrl(result.data.audioUrl)
      } else {
        throw new Error("Invalid TTS response format")
      }
    } catch (err) {
      console.error("Error generating audio:", err)
      setError("Không thể tạo audio cho câu hỏi. Vui lòng thử lại.")
    } finally {
      setAudioGenerating(false)
    }
  }

  // Play question audio
  const playQuestion = () => {
    if (audioUrl && audioRef.current) {
      setIsPlaying(true)
      audioRef.current.play()
    }
  }

  // Pause question audio
  const pauseQuestion = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Start recording user's answer
  const startRecording = async () => {
    try {
      setError("")
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
        await transcribeAnswer(audioBlob)

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
    } catch (err) {
      setError("Không thể truy cập microphone. Vui lòng cho phép quyền truy cập và thử lại.")
      console.error("Error accessing microphone:", err)
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Transcribe user's answer
  const transcribeAnswer = async (audioBlob: Blob) => {
    try {
      setTranscribing(true)
      setError("")

      // Convert webm to wav for better compatibility
      const audioFile = new File([audioBlob], "answer.webm", { type: "audio/webm" })
      const result = await APIClient.transcribeAudio(audioFile)

      // Handle response format: { status: true, data: { hypotheses: [{ utterance, confidence }] } }
      if (result.status && result.data?.hypotheses && result.data.hypotheses.length > 0) {
        const hypothesis = result.data.hypotheses[0]
        setTranscription(hypothesis.utterance)
        setConfidence(Math.round(hypothesis.confidence))
      } else {
        throw new Error("No transcription found in response")
      }
    } catch (err) {
      setError("Không thể chuyển đổi giọng nói thành text. Vui lòng thử ghi lại.")
      console.error("Error transcribing audio:", err)
    } finally {
      setTranscribing(false)
    }
  }

  // Save answer and move to next question
  const handleNextQuestion = async () => {
    if (!transcription.trim()) {
      setError("Vui lòng trả lời câu hỏi")
      return
    }

    try {
      setLoading(true)
      await APIClient.saveInterviewQA(sessionId, questions[currentQuestionIndex], transcription)

      const newAnswers = [...answers]
      newAnswers[currentQuestionIndex] = transcription
      setAnswers(newAnswers)

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setTranscription("")
        setConfidence(0)
        setAudioUrl("")
      } else {
        onComplete()
      }
    } catch (err) {
      setError("Có lỗi khi lưu câu trả lời")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Retry recording
  const retryRecording = () => {
    setTranscription("")
    setConfidence(0)
    setError("")
  }

  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 70) return "text-green-600"
    if (conf >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-900" />
              Phỏng vấn bằng giọng nói với FPT.AI
            </CardTitle>
            <Badge variant="secondary">
              Câu {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-900">Câu hỏi {currentQuestionIndex + 1}:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <p className="text-lg font-medium text-blue-900 mb-4">{questions[currentQuestionIndex]}</p>

            {/* Audio Controls */}
            <div className="flex items-center gap-4">
              {audioGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
                  <span className="text-sm text-gray-600">Đang tạo audio...</span>
                </div>
              ) : audioUrl ? (
                <div className="flex items-center gap-2">
                  <Button onClick={isPlaying ? pauseQuestion : playQuestion} variant="outline" size="sm">
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Tạm dừng
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Nghe câu hỏi
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => generateQuestionAudio(questions[currentQuestionIndex])}
                    variant="ghost"
                    size="sm"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Tạo lại audio
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => generateQuestionAudio(questions[currentQuestionIndex])}
                  variant="outline"
                  size="sm"
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Tạo audio
                </Button>
              )}
            </div>

            {/* Hidden audio element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{ display: "none" }}
              />
            )}
          </div>

          {/* Recording Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ repeat: isRecording ? Number.POSITIVE_INFINITY : 0, duration: 1 }}
              >
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  className={`w-20 h-20 rounded-full ${
                    isRecording ? "bg-red-600 hover:bg-red-700" : "bg-blue-900 hover:bg-blue-800"
                  }`}
                  disabled={transcribing}
                >
                  {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isRecording
                  ? "Đang ghi âm... Nhấn để dừng"
                  : transcribing
                    ? "Đang chuyển đổi giọng nói..."
                    : "Nhấn để bắt đầu trả lời"}
              </p>
            </div>
          </div>

          {/* Transcription Result */}
          {transcription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-900">Câu trả lời của bạn:</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getConfidenceColor(confidence)}>
                    Độ tin cậy: {confidence}%
                  </Badge>
                  {confidence >= 70 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
              <p className="text-green-800 mb-4">{transcription}</p>

              {confidence < 50 && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Độ tin cậy thấp. Bạn có thể ghi lại để có kết quả tốt hơn.</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button onClick={handleNextQuestion} className="bg-blue-900 hover:bg-blue-800" disabled={loading}>
                  {loading
                    ? "Đang lưu..."
                    : currentQuestionIndex < questions.length - 1
                      ? "Câu tiếp theo"
                      : "Hoàn thành phỏng vấn"}
                </Button>
                <Button onClick={retryRecording} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Ghi lại
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {(transcribing || loading) && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-900"></div>
                <span className="text-sm text-gray-600">
                  {transcribing ? "Đang chuyển đổi giọng nói..." : "Đang xử lý..."}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Hướng dẫn sử dụng FPT.AI Speech:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Nhấn "Nghe câu hỏi" để nghe AI đọc câu hỏi bằng giọng Việt</li>
            <li>• Nhấn nút microphone màu xanh để bắt đầu ghi âm câu trả lời</li>
            <li>• Nói rõ ràng bằng tiếng Việt và nhấn nút đỏ để dừng ghi âm</li>
            <li>• Hệ thống sẽ tự động chuyển giọng nói thành văn bản</li>
            <li>• Kiểm tra độ tin cậy và có thể ghi lại nếu cần thiết</li>
            <li>• Nhấn "Câu tiếp theo" để tiếp tục phỏng vấn</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
