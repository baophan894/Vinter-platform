"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Bot, Phone, Code, ExternalLink, Copy, CheckCircle } from "lucide-react"

export default function VapiDemoPage() {
  const [apiKey, setApiKey] = useState("")
  const [assistantId, setAssistantId] = useState("")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const assistantConfig = `{
  "name": "Interview Assistant",
  "firstMessage": "Hello! I'm your AI interviewer. I'm excited to learn more about you and your experience. Shall we begin with you telling me a bit about yourself?",
  "model": {
    "provider": "openai",
    "model": "gpt-4o",
    "temperature": 0.7,
    "messages": [
      {
        "role": "system",
        "content": "You are a professional interview assistant. Conduct a friendly but thorough interview. Ask follow-up questions based on responses. Keep responses concise and natural. Focus on the candidate's experience, skills, and motivation."
      }
    ]
  },
  "voice": {
    "provider": "11labs",
    "voiceId": "21m00Tcm4TlvDq8ikWAM"
  },
  "transcriber": {
    "provider": "deepgram",
    "model": "nova-2",
    "language": "en"
  }
}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vapi Setup Guide</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hướng dẫn thiết lập Vapi AI để tạo voice interview assistant
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1: Account Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Đăng ký tài khoản Vapi
                </CardTitle>
                <CardDescription>
                  Tạo tài khoản miễn phí tại Vapi.ai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Truy cập <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 inline-flex">
                      vapi.ai <ExternalLink className="w-4 h-4" />
                    </a> và đăng ký tài khoản mới.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Vapi cung cấp $10 credit miễn phí cho người dùng mới - đủ để test voice interview!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Get API Key */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Lấy Public API Key
                </CardTitle>
                <CardDescription>
                  Tạo và copy API key từ dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Đăng nhập vào Vapi Dashboard</li>
                    <li>Vào mục "API Keys" trong sidebar</li>
                    <li>Click "Create New Key"</li>
                    <li>Chọn loại "Public Key" (dành cho web client)</li>
                    <li>Copy key và paste vào form dưới đây</li>
                  </ol>
                  
                  <div className="mt-4">
                    <Label htmlFor="testApiKey" className="text-sm font-medium mb-2 block">
                      Test API Key của bạn:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="testApiKey"
                        type="password"
                        placeholder="Paste your public API key here..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Badge variant={apiKey ? "default" : "secondary"}>
                        {apiKey ? "Có key" : "Chưa có"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Create Assistant */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Tạo AI Assistant
                </CardTitle>
                <CardDescription>
                  Tạo AI assistant cho voice interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Vào mục "Assistants" trong dashboard và tạo assistant mới với config sau:
                  </p>
                  
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(assistantConfig)}
                    >
                      {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <pre className="text-sm overflow-x-auto">
                      <code>{assistantConfig}</code>
                    </pre>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>Lưu ý:</strong> Sau khi tạo assistant, copy Assistant ID để sử dụng trong ứng dụng.
                    </p>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="testAssistantId" className="text-sm font-medium mb-2 block">
                      Test Assistant ID của bạn:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="testAssistantId"
                        placeholder="Paste your assistant ID here..."
                        value={assistantId}
                        onChange={(e) => setAssistantId(e.target.value)}
                        className="flex-1"
                      />
                      <Badge variant={assistantId ? "default" : "secondary"}>
                        {assistantId ? "Có ID" : "Chưa có"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 4: Test Connection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Test và Sử dụng
                </CardTitle>
                <CardDescription>
                  Kiểm tra kết nối và bắt đầu voice interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Voice Providers</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• ElevenLabs (Recommended)</div>
                        <div>• OpenAI TTS</div>
                        <div>• Azure Speech</div>
                        <div>• Cartesia</div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Transcription</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Deepgram (Fast)</div>
                        <div>• AssemblyAI</div>
                        <div>• Whisper</div>
                        <div>• Gladia</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      asChild 
                      className="bg-green-600 hover:bg-green-700"
                      disabled={!apiKey || !assistantId}
                    >
                      <a href="/voice-interview">
                        <Phone className="w-4 h-4 mr-2" />
                        Bắt đầu Voice Interview
                      </a>
                    </Button>
                    
                    <Button variant="outline" asChild>
                      <a href="https://docs.vapi.ai" target="_blank" rel="noopener noreferrer">
                        <Code className="w-4 h-4 mr-2" />
                        Xem Documentation
                      </a>
                    </Button>
                  </div>

                  {(!apiKey || !assistantId) && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-800">
                        ❌ Vui lòng nhập đầy đủ API Key và Assistant ID để tiếp tục
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Bot className="h-5 w-5" />
                  Tính năng Voice Interview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interviewer AI</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Real-time voice conversation</li>
                      <li>• Natural language processing</li>
                      <li>• Context-aware questions</li>
                      <li>• Professional interview flow</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Video Interface</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Google Meet-like UI</li>
                      <li>• Video call controls</li>
                      <li>• Real-time transcription</li>
                      <li>• Interview recording</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
