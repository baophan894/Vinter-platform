"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from "lucide-react"
import Vapi from "@vapi-ai/web"

interface InterviewRoomProps {
  assistantId: string
  candidateName: string
  questions: string[]
  sessionId: string
  onComplete: () => void
  onEvaluationReady?: (data: {
    conversationHistory: Array<{role: 'user' | 'assistant', text: string, timestamp: Date}>
    duration: number
  }) => void
}

export default function InterviewRoom() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get props from URL params
  const assistantId = searchParams?.get('assistantId') || ''
  const candidateName = searchParams?.get('candidateName') || ''
  const sessionId = searchParams?.get('sessionId') || ''
  const questions = JSON.parse(searchParams?.get('questions') || '[]')
  
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>>([])
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string>('')
  
  const vapiRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const callTimerRef = useRef<NodeJS.Timeout>()
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationHistory])

  // Initialize Vapi
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
    console.log('🔑 Vapi API Key available:', !!apiKey)
    console.log('🔑 API Key preview:', apiKey?.slice(0, 10) + '...')
    console.log('🤖 Assistant ID:', assistantId)
    
    if (!apiKey) {
      console.error('❌ No Vapi public key found')
      setError('Vapi public key not configured. Please set NEXT_PUBLIC_VAPI_PUBLIC_KEY in .env.local')
      return
    }

    if (apiKey === "your_vapi_public_key_here") {
      console.error('❌ Using placeholder public key')
      setError('Please set real Vapi public key in .env.local from dashboard.vapi.ai')
      return
    }
    
    // Validate key format - Accept both vapi_pk_ prefix and raw keys
    if (!apiKey.startsWith('vapi_pk_') && !apiKey.match(/^[a-f0-9-]{8,}/)) {
      console.error('❌ Invalid public key format. Expected: vapi_pk_... or valid key from dashboard, got:', apiKey.substring(0, 10) + '...')
      setError('Invalid Vapi public key format. Please check your key from dashboard.vapi.ai')
      return
    }

    if (!assistantId) {
      console.error('❌ No assistant ID provided')
      setError('No assistant ID provided. Please create assistant first.')
      return
    }

    try {
      vapiRef.current = new Vapi(apiKey)
      console.log('✅ Vapi instance created successfully')
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...')
      console.log('🤖 Will use assistant ID:', assistantId)
      
      // Setup event listeners
      vapiRef.current.on('call-start', () => {
        console.log('✅ Call started successfully')
        setIsCallActive(true)
        setConnectionStatus('connected')
        setStartTime(new Date())
        startCallTimer()
      })
      
      vapiRef.current.on('call-end', () => {
        console.log('📞 Call ended')
        setIsCallActive(false)
        setConnectionStatus('disconnected')
        stopCallTimer()
        
        // Prepare evaluation data
        if (startTime) {
          const endTime = new Date()
          const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
          
          // Navigate back with evaluation data
          router.push(`/mock-interview?step=evaluation&sessionId=${sessionId}&duration=${duration}`)
        }
      })
      
      vapiRef.current.on('message', (message: any) => {
        console.log('📨 Message received:', message.type, message)
        
        if (message.type === 'transcript' && message.transcript) {
          const newEntry = {
            role: message.role as 'user' | 'assistant',
            text: message.transcript,
            timestamp: new Date()
          }
          console.log('💬 Adding transcript:', newEntry)
          setConversationHistory(prev => [...prev, newEntry])
        }
        
        if (message.type === 'speech-update') {
          setVolumeLevel(message.level || 0)
        }
        
        // Handle function calls and responses
        if (message.type === 'function-call') {
          console.log('🔧 Function call:', message)
        }
        
        // Handle speech events for volume feedback
        if (message.type === 'speech-start') {
          console.log('🎤 AI started speaking')
          setVolumeLevel(0.5)
        }
        
        if (message.type === 'speech-end') {
          console.log('🔇 AI stopped speaking')
          setVolumeLevel(0)
        }
        
        // Handle conversation events
        if (message.type === 'conversation-update') {
          console.log('💭 Conversation update:', message)
        }
      })
      
      vapiRef.current.on('error', (error: any) => {
        console.error('❌ Vapi error:', error)
        setConnectionStatus('disconnected')
        setError(`Vapi error: ${error.message || 'Unknown error'}`)
      })
      
      vapiRef.current.on('volume-level', (level: number) => {
        setVolumeLevel(level)
      })
    } catch (error) {
      console.error('❌ Failed to create Vapi instance:', error)
      setError('Failed to initialize Vapi')
    }
    
    return () => {
      if (vapiRef.current) {
        console.log('🧹 Cleaning up Vapi instance')
        vapiRef.current.stop()
      }
    }
  }, [assistantId, startTime, sessionId, router])

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
    console.log('🔍 Checking prerequisites...')
    console.log('Assistant ID:', assistantId)
    console.log('Vapi instance:', !!vapiRef.current)
    console.log('📱 User clicked START CALL button')
    
    if (!vapiRef.current) {
      console.error('❌ Vapi instance not initialized')
      alert("Vapi not initialized. Please refresh the page and try again.")
      return
    }
    
    if (!assistantId) {
      console.error('❌ No assistant ID provided')
      alert("Assistant ID not found. Please go back and start the interview again.")
      return
    }
    
    try {
      setConnectionStatus('connecting')
      console.log('🚀 Starting call with assistant:', assistantId)
      console.log('🔑 Using public key from env:', process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY?.substring(0, 10) + '...')
      
      // Request microphone permission first
      console.log('🎤 Requesting microphone permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ Microphone permission granted')
      
      // Stop the stream since Vapi will handle audio
      stream.getTracks().forEach(track => track.stop())
      
      // Ensure audio context is ready for autoplay
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      if (audioContext.state === 'suspended') {
        console.log('🔊 Resuming audio context...')
        await audioContext.resume()
        console.log('✅ Audio context ready')
      }
      
      // Start the Vapi call
      console.log('📞 Starting Vapi call...')
      await vapiRef.current.start(assistantId)
      console.log('✅ Vapi call started successfully')
      
    } catch (error) {
      console.error('❌ Failed to start call:', error)
      setConnectionStatus('disconnected')
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert("Microphone access denied. Please allow microphone access and try again.")
        } else if (error.name === 'NotFoundError') {
          alert("No microphone found. Please connect a microphone and try again.")
        } else {
          alert(`Failed to start interview: ${error.message}. Please check your connection and try again.`)
        }
      } else {
        alert("Failed to start interview. Please check your microphone permissions and try again.")
      }
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

  const goBack = () => {
    if (isCallActive) {
      endCall()
    }
    router.push('/mock-interview')
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top Navigation Bar - Fixed Height */}
      <div className="h-16 flex items-center justify-between px-4 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'
            }`} />
            <span className="text-sm font-medium text-gray-300">
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Ready to start'}
            </span>
            {/* Debug info */}
            <span className="text-xs text-gray-500">
              {assistantId ? `AI: ${assistantId.slice(0, 8)}...` : 'No Assistant ID'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isCallActive && (
            <Badge variant="secondary" className="bg-red-500/20 text-red-200">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(callDuration)}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-gray-300 border-gray-600">
            AI Interview Session
          </Badge>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-500/20 border-b border-red-500/30">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-400 mt-0.5">⚠️</div>
            <div className="flex-1">
              <div className="text-red-200 font-medium mb-1">Configuration Error</div>
              <div className="text-red-200/80 text-sm mb-2">{error}</div>
              {error.includes('vapi_pk_') && (
                <div className="text-xs text-red-200/60 bg-red-500/10 rounded p-2 border border-red-500/20">
                  <div className="font-medium mb-1">🔧 To fix this:</div>
                  <div>1. Visit <a href="https://dashboard.vapi.ai" target="_blank" className="underline text-red-300">dashboard.vapi.ai</a></div>
                  <div>2. Get your API keys from the "API Keys" section</div>
                  <div>3. Update .env.local file with real keys</div>
                  <div>4. Restart the server: npm run dev</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Account for fixed header */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Call Area */}
        <div className={`transition-all duration-300 ${
          isTranscriptExpanded ? 'flex-1' : 'flex-[2]'
        } flex flex-col`}>
          {/* Video Grid - Remove mt-2, use proper flex layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 min-h-0">
            {/* AI Avatar */}
            <Card className="relative bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-gray-700/50 overflow-hidden">
              <CardContent className="p-0 h-full flex items-center justify-center relative">
                <motion.div
                  className="relative z-10 flex flex-col items-center"
                  animate={{ 
                    scale: volumeLevel > 0.1 ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 relative shadow-xl">
                    <Bot className="w-16 h-16 text-white" />
                    {isCallActive && volumeLevel > 0.1 && (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-300/60 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border-8 border-blue-200/30 animate-ping" />
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI Interviewer</h3>
                  <Badge variant="secondary" className={`${
                    isCallActive ? 'bg-green-500/20 text-green-200' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    <Mic className="w-3 h-3 mr-1" />
                    {isCallActive ? 'Speaking' : 'Ready'}
                  </Badge>
                </motion.div>

                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-sm text-white">
                    AI Assistant
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Video */}
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
                      <VideoOff className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full text-sm text-white flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>{candidateName || 'You'}</span>
                    {!isMuted && isCallActive && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>

                {isMuted && (
                  <div className="absolute top-4 right-4">
                    <div className="bg-red-500/80 p-2 rounded-full">
                      <MicOff className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Control Bar */}
          <div className="p-6 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-4">
              {/* Microphone */}
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className={`w-14 h-14 rounded-full transition-all ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                }`}
                onClick={toggleMute}
                disabled={!isCallActive}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              {/* Video */}
              <Button
                variant={!isVideoOn ? "destructive" : "secondary"}
                size="lg"
                className={`w-14 h-14 rounded-full transition-all ${
                  !isVideoOn 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25' 
                    : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                }`}
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>

              {/* Main Call Button */}
              <Button
                variant={isCallActive ? "destructive" : "default"}
                size="lg"
                className={`w-20 h-20 rounded-full transition-all shadow-xl ${
                  isCallActive 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                    : assistantId 
                      ? 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                      : 'bg-gray-500 cursor-not-allowed opacity-50'
                }`}
                onClick={isCallActive ? endCall : startCall}
                disabled={connectionStatus === 'connecting' || !assistantId}
              >
                {connectionStatus === 'connecting' ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isCallActive ? (
                  <PhoneOff className="w-8 h-8" />
                ) : assistantId ? (
                  <Phone className="w-8 h-8" />
                ) : (
                  <div className="text-xs text-center text-white">
                    <div>No</div>
                    <div>AI</div>
                  </div>
                )}
              </Button>

              {/* Settings */}
              <Button
                variant="secondary"
                size="lg"
                className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                <Settings className="w-6 h-6" />
              </Button>

              {/* Volume */}
              <Button
                variant="secondary"
                size="lg"
                className="w-14 h-14 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                {volumeLevel > 0.1 ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </Button>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-center mt-4 gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Audio: Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>Connection: Stable</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>2 participants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Panel */}
        <div className={`transition-all duration-300 ${
          isTranscriptExpanded ? 'flex-[2]' : 'w-96'
        } bg-gray-800/95 backdrop-blur border-l border-gray-700/50 flex flex-col`}>
          {/* Transcript Header */}
          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Live Transcript</h3>
              <Badge variant="secondary" className="text-xs">
                {conversationHistory.length} messages
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isTranscriptExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Transcript Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversationHistory.length === 0 ? (
              <div className="text-center text-gray-500 mt-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">Conversation will appear here</p>
                <p className="text-xs text-gray-600 mt-1">Start the interview to see live transcript</p>
              </div>
            ) : (
              <>
                {conversationHistory.map((entry, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%] ${entry.role === 'assistant' ? 'order-2' : 'order-1'}`}>
                      {/* Message Header */}
                      <div className={`flex items-center gap-2 mb-1 ${entry.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                        <span className="text-xs text-gray-400 font-medium">
                          {entry.role === 'assistant' ? 'AI Interviewer' : candidateName || 'You'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        entry.role === 'assistant' 
                          ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30' 
                          : 'bg-green-600/20 text-green-100 border border-green-500/30'
                      }`}>
                        {entry.text}
                      </div>
                    </div>
                    
                    {/* Avatar */}
                    <div className={`${entry.role === 'assistant' ? 'order-1' : 'order-2'} flex-shrink-0`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        entry.role === 'assistant' ? 'bg-blue-500' : 'bg-green-500'
                      }`}>
                        {entry.role === 'assistant' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={transcriptEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
