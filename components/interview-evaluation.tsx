"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { APIClient } from "@/lib/api"
import { 
  Star, 
  StarHalf,
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown,
  User,
  Bot,
  Clock,
  MessageSquare,
  Award,
  Target,
  Lightbulb,
  FileText,
  Download
} from "lucide-react"

interface InterviewEvaluationProps {
  candidateName: string
  sessionId: string
  jobDescription: string
  questions: string[]
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>
  interviewDuration: number
  onComplete: () => void
}

interface EvaluationResult {
  overallScore: number
  technicalSkills: number
  communication: number
  problemSolving: number
  experience: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  recommendation: 'strong_hire' | 'hire' | 'maybe' | 'no_hire'
}

export default function InterviewEvaluation({
  candidateName,
  sessionId,
  jobDescription,
  questions,
  conversationHistory,
  interviewDuration,
  onComplete
}: InterviewEvaluationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [showDetailedView, setShowDetailedView] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    analyzeInterview()
  }, [])

  const analyzeInterview = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis of conversation
    setTimeout(async () => {
      const mockEvaluation: EvaluationResult = {
        overallScore: 78,
        technicalSkills: 82,
        communication: 75,
        problemSolving: 80,
        experience: 76,
        strengths: [
          "Strong technical knowledge in core areas",
          "Clear communication and articulation",
          "Good problem-solving approach",
          "Relevant experience with mentioned technologies",
          "Confident in explaining complex concepts"
        ],
        improvements: [
          "Could provide more specific examples from past projects",
          "Consider elaborating on team collaboration experiences",
          "Prepare more detailed answers for behavioral questions"
        ],
        detailedFeedback: `${candidateName} demonstrated solid technical competencies throughout the interview. Their responses showed good understanding of fundamental concepts and practical application. Communication was clear and professional. There are opportunities to strengthen responses with more concrete examples and deeper insights into past experiences.`,
        recommendation: 'hire'
      }
      
      setEvaluation(mockEvaluation)
      setIsAnalyzing(false)
      
      // Auto-save evaluation
      await saveEvaluation(mockEvaluation)
    }, 3000)
  }

  const saveEvaluation = async (evalResult: EvaluationResult) => {
    try {
      const evaluationData = {
        sessionId,
        candidateName,
        jobDescription,
        questions,
        conversationHistory,
        interviewDuration,
        scores: {
          technicalSkills: evalResult.technicalSkills,
          communication: evalResult.communication,
          problemSolving: evalResult.problemSolving,
          culturalFit: evalResult.experience,
          overall: evalResult.overallScore
        },
        feedback: {
          strengths: evalResult.strengths,
          improvements: evalResult.improvements,
          recommendation: evalResult.recommendation,
          detailedFeedback: evalResult.detailedFeedback
        }
      }

      await APIClient.saveEvaluation(evaluationData)
      console.log('Evaluation saved successfully')
    } catch (error) {
      console.error('Failed to save evaluation:', error)
    }
  }

  const handleExportReport = async () => {
    try {
      setIsSaving(true)
      const blob = await APIClient.exportEvaluationReport(sessionId, 'html')
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `interview-evaluation-${candidateName}-${sessionId}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export report:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 70) return "bg-yellow-100"
    if (score >= 60) return "bg-orange-100"
    return "bg-red-100"
  }

  const getRecommendationInfo = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_hire':
        return { text: "Strong Hire", color: "bg-green-500", icon: Award }
      case 'hire':
        return { text: "Hire", color: "bg-blue-500", icon: CheckCircle }
      case 'maybe':
        return { text: "Maybe", color: "bg-yellow-500", icon: AlertCircle }
      case 'no_hire':
        return { text: "No Hire", color: "bg-red-500", icon: TrendingDown }
      default:
        return { text: "Pending", color: "bg-gray-500", icon: Clock }
    }
  }

  const renderStars = (score: number) => {
    const stars = Math.floor(score / 20) // Convert to 5-star scale
    const halfStar = (score % 20) >= 10
    
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < stars) {
            return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          } else if (i === stars && halfStar) {
            return <StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          } else {
            return <Star key={i} className="w-4 h-4 text-gray-300" />
          }
        })}
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Analyzing Interview Performance</h3>
            <p className="text-gray-600 mb-4">
              Our AI is evaluating {candidateName}'s responses and providing detailed feedback...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Analyzing technical responses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}} />
                <span>Evaluating communication skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '1s'}} />
                <span>Generating recommendations</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (!evaluation) return null

  const recommendationInfo = getRecommendationInfo(evaluation.recommendation)
  const RecommendationIcon = recommendationInfo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Evaluation</h1>
          <p className="text-gray-600">
            AI-powered analysis of {candidateName}'s interview performance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${evaluation.overallScore * 2.83} 283`}
                      className={getScoreColor(evaluation.overallScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
                      {evaluation.overallScore}
                    </span>
                  </div>
                </div>
                {renderStars(evaluation.overallScore)}
                <Badge className={`mt-4 ${recommendationInfo.color} text-white`}>
                  <RecommendationIcon className="w-4 h-4 mr-1" />
                  {recommendationInfo.text}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skill Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Skill Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Technical Skills", score: evaluation.technicalSkills, icon: Bot },
                  { name: "Communication", score: evaluation.communication, icon: MessageSquare },
                  { name: "Problem Solving", score: evaluation.problemSolving, icon: Lightbulb },
                  { name: "Experience", score: evaluation.experience, icon: User }
                ].map((skill, index) => {
                  const SkillIcon = skill.icon
                  return (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className={`p-2 rounded-full ${getScoreBackground(skill.score)}`}>
                        <SkillIcon className={`w-4 h-4 ${getScoreColor(skill.score)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{skill.name}</span>
                          <span className={`font-bold ${getScoreColor(skill.score)}`}>
                            {skill.score}%
                          </span>
                        </div>
                        <Progress value={skill.score} className="h-2" />
                      </div>
                    </motion.div>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Interview Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Interview Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">
                    {Math.floor(interviewDuration / 60)}m {interviewDuration % 60}s
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions</span>
                  <span className="font-semibold">
                    {conversationHistory.filter(msg => msg.role === 'assistant').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Responses</span>
                  <span className="font-semibold">
                    {conversationHistory.filter(msg => msg.role === 'user').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-semibold">8.5s</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Areas for Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Lightbulb className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {evaluation.detailedFeedback}
                  </p>
                </div>
                
                {showDetailedView && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 border-t pt-4"
                  >
                    <h4 className="font-semibold mb-3">Interview Transcript Summary</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {conversationHistory.slice(0, 6).map((msg, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === 'assistant' ? (
                              <Bot className="w-3 h-3 text-blue-500" />
                            ) : (
                              <User className="w-3 h-3 text-green-500" />
                            )}
                            <span className="font-medium capitalize">
                              {msg.role === 'assistant' ? 'AI' : candidateName}
                            </span>
                          </div>
                          <p className="text-gray-600 ml-5 truncate">
                            {msg.text.length > 100 ? `${msg.text.substring(0, 100)}...` : msg.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Button
            variant="outline"
            onClick={() => setShowDetailedView(!showDetailedView)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showDetailedView ? 'Hide' : 'Show'} Detailed View
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={isSaving}
          >
            <Download className="w-4 h-4 mr-2" />
            {isSaving ? 'Generating...' : 'Download Report'}
          </Button>
          
          <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Evaluation
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
