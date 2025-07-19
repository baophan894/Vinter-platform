"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  MessageSquare,
  Clock,
  User,
  Bot,
  Share2,
  Monitor,
  Users
} from "lucide-react"
import Vapi from "@vapi-ai/web"

interface AIInterviewRoomProps {
  assistantId?: string
  apiKey?: string
  questions?: string[]
  sessionId?: string
  candidateName?: string
  onCallEnd?: () => void
  onComplete?: () => void
  onEvaluationReady?: (data: {
    conversationHistory: Array<{role: 'user' | 'assistant', text: string, timestamp: Date}>
    duration: number
  }) => void
}

export default function AIInterviewRoom({ 
  assistantId = "", // Will be generated dynamically
  apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "your_public_api_key",
  questions = [],
  sessionId = "",
  candidateName = "",
  onCallEnd,
  onComplete,
  onEvaluationReady
}: AIInterviewRoomProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>>([])
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  
  const vapiRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const callTimerRef = useRef<NodeJS.Timeout>()

  // Initialize Vapi
  useEffect(() => {
    if (apiKey && apiKey !== "your_public_api_key") {
      vapiRef.current = new Vapi(apiKey)
      
      // Setup event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started')
        setIsCallActive(true)
        setConnectionStatus('connected')
        setStartTime(new Date())
        startCallTimer()
      })
      
      vapiRef.current.on('call-end', () => {
        console.log('Call ended')
        setIsCallActive(false)
        setConnectionStatus('disconnected')
        stopCallTimer()
        
        // Prepare evaluation data
        if (onEvaluationReady && startTime) {
          const endTime = new Date()
          const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
          
          onEvaluationReady({
            conversationHistory,
            duration
          })
        }
        
        onCallEnd?.()
        // Nếu cuộc phỏng vấn kết thúc, gọi onComplete để chuyển sang bước tiếp theo
        if (onComplete) {
          setTimeout(() => {
            onComplete()
          }, 1000) // Delay 1 giây để người dùng thấy call đã kết thúc
        }
      })
      
      vapiRef.current.on('message', (message: any) => {
        console.log('Message received:', message)
        
        if (message.type === 'transcript') {
          const newEntry = {
            role: message.role,
            text: message.transcript,
            timestamp: new Date()
          }
          setConversationHistory(prev => [...prev, newEntry])
          
          if (message.role === 'assistant') {
            setCurrentTranscript(message.transcript)
          }
        }
        
        if (message.type === 'speech-update') {
          setVolumeLevel(message.level || 0)
        }
      })
      
      vapiRef.current.on('error', (error: any) => {
        console.error('Vapi error:', error)
        setConnectionStatus('disconnected')
      })
    }
    
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [apiKey, onCallEnd])

  // Setup user video
  useEffect(() => {
    if (isVideoOn && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.log('Error accessing camera:', err))
    }
  }, [isVideoOn])

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
  }

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current)
      setCallDuration(0)
    }
  }

  const startCall = async () => {
    if (!vapiRef.current || !assistantId || assistantId === "") {
      alert("Assistant is being created. Please wait for the assistant to be ready before starting the call.")
      return
    }
    
    try {
      setConnectionStatus('connecting')
      await vapiRef.current.start(assistantId)
    } catch (error) {
      console.error('Failed to start call:', error)
      setConnectionStatus('disconnected')
      alert("Failed to start interview. Please check your API keys and try again.")
    }
  }

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800" />
      
      {/* Main Interview Container */}
      <div className="relative h-screen flex flex-col">
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-xs font-medium text-gray-300">
                {assistantId ? (
                  connectionStatus === 'connected' ? 'Connected' : 
                  connectionStatus === 'connecting' ? 'Connecting...' : 'Ready to start'
                ) : 'Creating AI Interviewer...'}
              </span>
            </div>
            {isCallActive && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(callDuration)}
              </Badge>
            )}
          </div>
          
          <Badge variant="outline" className="text-gray-300 border-gray-600 text-xs">
            AI Interview Session
          </Badge>
        </div>

        {/* Video Grid - Optimized Layout */}
        <div className="flex-1 flex">
          {/* Main Video Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-3 p-3">
            {/* AI Avatar - Enhanced */}
            <Card className="relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-gray-700/50 overflow-hidden">
              <CardContent className="p-0 h-full flex items-center justify-center relative">
                {/* AI Avatar */}
                <motion.div
                  className="relative z-10 flex flex-col items-center"
                  animate={{ 
                    scale: volumeLevel > 0.1 ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-3 relative shadow-lg">
                    <Bot className="w-12 h-12 text-white" />
                    {isCallActive && volumeLevel > 0.1 && (
                      <div className="absolute inset-0 rounded-full border-2 border-blue-300/60 animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">AI Interviewer</h3>
                  <Badge variant="secondary" className={`text-xs ${
                    isCallActive ? 'bg-green-500/20 text-green-200' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    <Mic className="w-3 h-3 mr-1" />
                    {isCallActive ? 'Active' : 'Ready'}
                  </Badge>
                </motion.div>

                {/* Simple Label */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white">
                    AI Assistant
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Video - Clean Design */}
            <Card className="relative bg-gray-800/60 border-gray-700/50 overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700/60">
                    <div className="text-center">
                      <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Camera is off</p>
                    </div>
                  </div>
                )}

                {/* User Label */}
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{candidateName || 'You'}</span>
                    {!isMuted && isCallActive && (
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse ml-1" />
                    )}
                  </div>
                </div>

                {/* Mute Indicator */}
                {isMuted && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-red-500/80 p-1.5 rounded-full">
                      <MicOff className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transcript Panel - Always Visible */}
          <div className="w-80 bg-gray-900/90 backdrop-blur border-l border-gray-700/50 flex flex-col">
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h3 className="font-medium text-white text-sm">Live Transcript</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {conversationHistory.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm">Conversation will appear here</p>
                </div>
              ) : (
                conversationHistory.map((entry, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {entry.role === 'assistant' ? (
                        <Bot className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      ) : (
                        <User className="w-3 h-3 text-green-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-xs text-gray-300 capitalize">
                        {entry.role === 'assistant' ? 'AI' : 'You'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`ml-5 p-2 rounded text-xs leading-relaxed ${
                      entry.role === 'assistant' 
                        ? 'bg-blue-500/10 text-blue-100 border-l-2 border-blue-500/30' 
                        : 'bg-green-500/10 text-green-100 border-l-2 border-green-500/30'
                    }`}>
                      {entry.text}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Current Speaking Indicator */}
            {currentTranscript && isCallActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 border-t border-gray-700/50 bg-blue-500/5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-300 font-medium">AI speaking...</span>
                  <div className="flex gap-1 ml-auto">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">{currentTranscript}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Clean Control Bar */}
        <div className="p-4 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50">
          <div className="flex items-center justify-center gap-3">
            {/* Microphone */}
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className={`w-12 h-12 rounded-full transition-all ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
              }`}
              onClick={toggleMute}
              disabled={!isCallActive}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>

            {/* Video */}
            <Button
              variant={!isVideoOn ? "destructive" : "secondary"}
              size="lg"
              className={`w-12 h-12 rounded-full transition-all ${
                !isVideoOn 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                  : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
              }`}
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>

            {/* Main Call Button */}
            <Button
              variant={isCallActive ? "destructive" : "default"}
              size="lg"
              className={`w-16 h-16 rounded-full transition-all shadow-lg ${
                isCallActive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                  : assistantId 
                    ? 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                    : 'bg-gray-500 cursor-not-allowed'
              }`}
              onClick={isCallActive ? endCall : startCall}
              disabled={connectionStatus === 'connecting' || !assistantId}
            >
              {connectionStatus === 'connecting' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isCallActive ? (
                <PhoneOff className="w-6 h-6" />
              ) : assistantId ? (
                <Phone className="w-6 h-6" />
              ) : (
                <div className="text-xs text-center">
                  <div>Wait</div>
                  <div>AI</div>
                </div>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="secondary"
              size="lg"
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Status Info */}
          <div className="flex items-center justify-center mt-3 gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span>Audio: Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span>Connection: Stable</span>
            </div>
            {isCallActive && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>2 participants</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
