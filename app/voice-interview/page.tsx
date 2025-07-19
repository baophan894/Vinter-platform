"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Bot, Video, Settings, Play, FileText, Briefcase } from "lucide-react"
import AIInterviewRoom from "@/components/ai-interview-room"

export default function VoiceInterviewPage() {
  const [showInterviewRoom, setShowInterviewRoom] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [assistantId, setAssistantId] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [candidateName, setCandidateName] = useState("")
  const [interviewType, setInterviewType] = useState("technical")

  const handleStartInterview = () => {
    if (!apiKey || !assistantId) {
      alert("Please provide both API Key and Assistant ID to start the interview")
      return
    }
    setShowInterviewRoom(true)
  }

  const handleEndInterview = () => {
    setShowInterviewRoom(false)
  }

  if (showInterviewRoom) {
    return (
      <AIInterviewRoom
        apiKey={apiKey}
        assistantId={assistantId}
        onCallEnd={handleEndInterview}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Voice Interview</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thực hiện phỏng vấn 1-1 với AI thông qua voice interface như Google Meet
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Setup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Settings className="h-5 w-5" />
                  Cấu hình Vapi
                </CardTitle>
                <CardDescription>
                  Nhập thông tin Vapi để bắt đầu phỏng vấn voice với AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiKey" className="text-sm font-medium mb-2 block">
                      Vapi Public API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="your_public_api_key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Lấy từ Vapi Dashboard → API Keys
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="assistantId" className="text-sm font-medium mb-2 block">
                      Assistant ID
                    </Label>
                    <Input
                      id="assistantId"
                      placeholder="your_assistant_id"
                      value={assistantId}
                      onChange={(e) => setAssistantId(e.target.value)}
                      className="bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ID của AI assistant đã tạo trên Vapi
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Thông tin phỏng vấn (Tùy chọn)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="candidateName" className="text-sm font-medium mb-2 block">
                        Tên ứng viên
                      </Label>
                      <Input
                        id="candidateName"
                        placeholder="Nhập tên của bạn"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="interviewType" className="text-sm font-medium mb-2 block">
                        Loại phỏng vấn
                      </Label>
                      <select
                        id="interviewType"
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="technical">Technical Interview</option>
                        <option value="behavioral">Behavioral Interview</option>
                        <option value="hr">HR Interview</option>
                        <option value="general">General Interview</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobDescription" className="text-sm font-medium mb-2 block">
                    Job Description (Tùy chọn)
                  </Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Dán job description để AI có context phỏng vấn phù hợp..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[100px] bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-900" />
                  Tính năng Voice Interview
                </CardTitle>
                <CardDescription>
                  Trải nghiệm phỏng vấn chuyên nghiệp với AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI Interviewer</h3>
                    <p className="text-sm text-gray-600">
                      AI thông minh với khả năng hỏi đáp tự nhiên và đánh giá real-time
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Video className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Video Interface</h3>
                    <p className="text-sm text-gray-600">
                      Giao diện video call chuyên nghiệp giống Google Meet
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transcript & Report</h3>
                    <p className="text-sm text-gray-600">
                      Ghi lại toàn bộ cuộc hội thoại và tạo báo cáo đánh giá
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="mb-8 bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Briefcase className="h-5 w-5" />
                  Hướng dẫn sử dụng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-amber-900 min-w-[20px]">1.</span>
                    <span>Đăng ký tài khoản tại <a href="https://vapi.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">vapi.ai</a> và tạo Assistant AI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-amber-900 min-w-[20px]">2.</span>
                    <span>Lấy Public API Key từ Dashboard và nhập vào form trên</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-amber-900 min-w-[20px]">3.</span>
                    <span>Copy Assistant ID của AI đã tạo và nhập vào form</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-amber-900 min-w-[20px]">4.</span>
                    <span>Click "Bắt đầu phỏng vấn" để vào phòng voice interview</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-amber-900 min-w-[20px]">5.</span>
                    <span>Cho phép quyền microphone và camera khi được yêu cầu</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleStartInterview}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
              disabled={!apiKey || !assistantId}
            >
              <Play className="w-5 h-5 mr-2" />
              Bắt đầu phỏng vấn
            </Button>
            
            {(!apiKey || !assistantId) && (
              <p className="text-sm text-gray-500 mt-3">
                Vui lòng nhập API Key và Assistant ID để bắt đầu
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
