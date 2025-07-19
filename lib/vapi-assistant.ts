// Vapi Assistant Service
export interface CreateAssistantRequest {
  name: string
  firstMessage: string
  model: {
    provider: string
    model: string
    temperature?: number
    messages?: Array<{
      role: string
      content: string
    }>
  }
  voice: {
    provider: string
    voiceId: string
  }
  transcriber?: {
    provider: string
    model: string
    language: string
  }
}

export interface CreateAssistantResponse {
  id: string
  name: string
  firstMessage: string
  model: any
  voice: any
  createdAt: string
  updatedAt: string
}

export class VapiAssistantService {
  private baseUrl = 'https://api.vapi.ai'
  private privateKey: string

  constructor(privateKey: string) {
    this.privateKey = privateKey
  }

  async createAssistant(request: CreateAssistantRequest): Promise<CreateAssistantResponse> {
    const response = await fetch(`${this.baseUrl}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create assistant: ${error}`)
    }

    return response.json()
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/assistant/${assistantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.privateKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete assistant: ${error}`)
    }
  }

  generateInterviewPrompt(
    candidateName: string,
    jobDescription: string,
    cvSummary: string,
    questions: string[]
  ): string {
    return `You are a professional AI interviewer conducting an interview with candidate ${candidateName}.

MISSION:
- Conduct the interview naturally and professionally
- Ask questions one by one in sequence
- Listen and respond appropriately
- Move to the next question after the candidate finishes answering
- End the interview when all questions are completed

INTERVIEW QUESTIONS:
${questions.map((q, index) => `${index + 1}. ${q}`).join('\n')}

GUIDELINES:
- Start with a friendly professional greeting
- Ask each question naturally and conversationally
- May ask follow-up questions for clarification if needed
- Provide positive feedback to responses
- Use natural English
- Maintain professional yet friendly tone
- Keep each response under 30 words
- Stay focused on the interview questions
- Be encouraging and supportive

Begin the interview naturally!`
  }

  generateFirstMessage(candidateName: string): string {
    return `Hi ${candidateName}! I'm your AI interviewer today. Ready to start our interview session? Let's begin with a quick introduction - tell me about yourself!`
  }
}
