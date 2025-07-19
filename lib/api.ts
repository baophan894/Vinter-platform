// API client utilities
import { VapiAssistantService, CreateAssistantRequest } from './vapi-assistant'

const API_BASE_URL = "api" // Use Next.js API routes

export class APIClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `http://localhost:5010${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // 1. Generate checklist from JD
  static async generateChecklist(jd: string) {
    return this.request("/ai/generate-checklist", {
      method: "POST",
      body: JSON.stringify({ jd }),
    })
  }

  // 2. Generate questions from JD + CV (using your AI interview-session API)
  static async generateQuestions(jd: string, cvFile: File, mode: "basic" | "advanced" | "challenge" = "basic") {
    try {
      const formData = new FormData()
      formData.append("jd", jd)
      formData.append("cv", cvFile)
      formData.append("mode", mode)

      console.log('🎯 Calling your interview-session API for question generation...')

      const response = await fetch(`/${API_BASE_URL}/ai/interview-session`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Interview-session API failed:', errorText)
        throw new Error(`Interview-session API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Interview-session API successful:', result)
      
      // Your API should return questions in the expected format
      return result
      
    } catch (error) {
      console.error('💥 Interview-session API call failed:', error)
      throw error
    }
  }

  // 3. Analyze CV compatibility with JD
  static async analyzeCV(jd: string, cvFile: File) {
    const formData = new FormData()
    formData.append("jd", jd)
    formData.append("cv", cvFile)

    return fetch(`${API_BASE_URL}/ai/analyze-cv`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  }

  // 4. Generate study plan from checklist
  static async generateStudyPlan(checklist: string[]) {
    return this.request("/ai/generate-study-plan", {
      method: "POST",
      body: JSON.stringify({ checklist }),
    })
  }

  // 4.1. Generate daily study plan from checklist
  static async generateDailyStudyPlan(checklist: string[], totalDays: number = 7) {
    return this.request("/ai/daily-study-plan", {
      method: "POST",
      body: JSON.stringify({ checklist, totalDays }),
    })
  }

  // 5. Start interview session (updated to use start-interview endpoint)
  static async startInterview(jd: string, cvFile: File, mode: "basic" | "advanced" | "challenge" = "basic") {
    const formData = new FormData()
    formData.append("jd", jd)
    formData.append("cv", cvFile)
    formData.append("mode", mode)

    return fetch(`${API_BASE_URL}/ai/start-interview`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  }

  // 6. Save interview Q&A (updated to use answer endpoint)
  static async saveInterviewQA(sessionId: string, question: string, answer: string) {
    return this.request("/ai/answer", {
      method: "POST",
      body: JSON.stringify({ sessionId, question, answer }),
    })
  }

  // 7. Export interview report (updated to use export endpoint)
  static async exportInterviewReport(sessionId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/ai/export/${sessionId}`)
    return response.blob()
  }

  // Additional helper methods
  static async getInterviewSession(sessionId: string) {
    return this.request(`/interview/session/${sessionId}`)
  }

  // Speech API methods with better error handling
  static async textToSpeech(text: string) {
    try {
      console.log("Calling TTS API with text:", text)

      const response = await fetch(`${API_BASE_URL}/speech/fpt-speak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      console.log("TTS Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("TTS API Error Response:", errorText)
        throw new Error(`TTS API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("TTS API Result:", result)

      return result
    } catch (error) {
      console.error("TTS API Call Failed:", error)
      throw error
    }
  }

  static async transcribeAudio(audioFile: File) {
    try {
      const formData = new FormData()
      formData.append("audio", audioFile)

      const response = await fetch(`${API_BASE_URL}/speech/fpt-transcribe`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`STT API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error("STT API Call Failed:", error)
      throw error
    }
  }

  // Proxy audio to avoid CORS issues
  static async getProxiedAudio(audioUrl: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/speech/proxy-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      })

      if (!response.ok) {
        throw new Error(`Proxy Error: ${response.status}`)
      }

      const blob = await response.blob()
      return URL.createObjectURL(blob)
    } catch (error) {
      console.error("Audio proxy failed:", error)
      throw error
    }
  }

  // Create dynamic Vapi Assistant
  static async createDynamicAssistant(
    candidateName: string,
    jobDescription: string,
    cvFile: File,
    questions: string[]
  ): Promise<string> {
    try {
      const response = await fetch('/api/vapi/create-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName,
          jobDescription,
          questions
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create assistant')
      }

      const result = await response.json()
      console.log('Created dynamic assistant:', result.assistantId)
      return result.assistantId
    } catch (error) {
      console.error('Failed to create dynamic assistant:', error)
      throw error
    }
  }

  // Extract CV summary for assistant prompt using your real API
  static async extractCVSummary(cvFile: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("cv", cvFile)

      // Use your real CV scanning API
      console.log('📄 Calling real CV scan API...')
      const response = await fetch(`/api/ai/real-cv-scan`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        console.warn('❌ Real CV scan failed, using fallback')
        // Fallback to extract-cv-summary if real API fails
        const fallbackResponse = await fetch(`/api/ai/extract-cv-summary`, {
          method: "POST",
          body: formData,
        })
        
        if (fallbackResponse.ok) {
          const result = await fallbackResponse.json()
          return result.summary || `CV file: ${cvFile.name}`
        }
        
        return `CV file: ${cvFile.name}`
      }

      const result = await response.json()
      console.log('✅ Real CV scan successful')
      
      // Return the detailed summary from your API
      return result.data?.summary || result.data?.extractedText || `CV file: ${cvFile.name}`
      
    } catch (error) {
      console.warn('CV summary extraction failed, using fallback:', error)
      return `CV file: ${cvFile.name}`
    }
  }

  // Evaluation API methods
  static async saveEvaluation(evaluationData: {
    sessionId: string
    candidateName: string
    jobDescription: string
    questions: string[]
    conversationHistory: Array<{
      role: 'user' | 'assistant'
      text: string
      timestamp: Date
    }>
    interviewDuration: number
    scores: {
      technicalSkills: number
      communication: number
      problemSolving: number
      culturalFit: number
      overall: number
    }
    feedback: {
      strengths: string[]
      improvements: string[]
      recommendation: string
      detailedFeedback: string
    }
  }) {
    return fetch('/api/evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluationData),
    }).then(res => res.json())
  }

  static async getEvaluation(sessionId: string) {
    return fetch(`/api/evaluation?sessionId=${sessionId}`)
      .then(res => res.json())
  }

  static async exportEvaluationReport(sessionId: string, format: 'json' | 'html' = 'html') {
    const response = await fetch('/api/evaluation', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, format }),
    })

    if (format === 'html') {
      return response.blob()
    }
    
    return response.json()
  }
}
