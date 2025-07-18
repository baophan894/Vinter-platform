// API client utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export class APIClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
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

  // 2. Generate questions from JD + CV (updated to use interview-session endpoint)
  static async generateQuestions(jd: string, cvFile: File, mode: "basic" | "advanced" | "challenge" = "basic") {
    const formData = new FormData()
    formData.append("jd", jd)
    formData.append("cv", cvFile)
    formData.append("mode", mode)

    return fetch(`${API_BASE_URL}/ai/interview-session`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
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
}
