// Vapi AI Web Call Client - Simplified for browser-only usage
export class VapiAIClient {
  // Create interview assistant configuration for web calls
  static createInterviewAssistant(candidateName: string, questions: string[]) {
    return {
      name: `Interview-${candidateName}`,
      firstMessage: `Hello ${candidateName}! I'm your AI interviewer for today's session. We'll be going through ${questions.length} questions together. Are you ready to begin?`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a professional AI interviewer conducting an interview with candidate ${candidateName}.

YOUR MISSION:
- Conduct the interview naturally and professionally
- Ask questions one by one in order
- Listen carefully and provide appropriate responses
- Move to the next question after the candidate finishes answering
- End the interview when all questions are completed

INTERVIEW QUESTIONS:
${questions.map((q, index) => `${index + 1}. ${q}`).join("\n")}

GUIDELINES:
- Start with a friendly greeting
- Ask each question naturally and clearly
- Ask follow-up questions for clarification if needed
- Provide positive feedback on answers
- Use natural, professional English
- Keep responses concise (under 50 words)
- Maintain a professional yet friendly tone
- Allow natural pauses for the candidate to think
- Show genuine interest in their responses

Please begin the interview in a natural and engaging way!`,
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Adam voice - professional
        stability: 0.6,
        similarityBoost: 0.9,
        style: 0.3,
        useSpeakerBoost: true,
        optimizeStreamingLatency: 3,
      },
      recordingEnabled: true,
      endCallMessage: `Thank you ${candidateName} for participating in today's interview. Best of luck with your application!`,
      endCallPhrases: ["thank you", "goodbye", "bye", "end interview", "that's all", "complete"],
      maxDurationSeconds: 1800, // 30 minutes max
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 1,
      llmRequestDelaySeconds: 0.1,
      numWordsToInterruptAssistant: 2,
      backgroundSound: "office",
    }
  }

  // Check if Vapi is available (only need public key for web calls)
  static isAvailable(): boolean {
    return !!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  }

  // Get public key for client-side usage
  static getPublicKey(): string | undefined {
    return process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  }
}
