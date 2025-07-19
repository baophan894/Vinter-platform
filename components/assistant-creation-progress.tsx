"use client"

import { motion } from "framer-motion"
import { Bot, CheckCircle, Loader } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AssistantCreationProgressProps {
  candidateName: string
  isCreating: boolean
  isComplete: boolean
}

export default function AssistantCreationProgress({ 
  candidateName, 
  isCreating, 
  isComplete 
}: AssistantCreationProgressProps) {
  if (!isCreating && !isComplete) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {isCreating ? (
              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  {isCreating ? "Creating Your Personal AI Interviewer" : "AI Interviewer Ready"}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600">
                {isCreating 
                  ? `Generating a customized AI interviewer for ${candidateName} based on the job requirements and CV...`
                  : `Your personalized AI interviewer has been created and is ready to conduct the interview.`
                }
              </p>

              {isCreating && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-xs text-green-700 bg-green-100 p-2 rounded"
            >
              <strong>What's been customized:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Interview questions tailored to the job description</li>
                <li>Conversation style adapted to your experience level</li>
                <li>Follow-up questions based on your CV highlights</li>
                <li>Professional tone matching the company culture</li>
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
