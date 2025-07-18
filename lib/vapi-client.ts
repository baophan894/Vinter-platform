// Vapi AI Web Call Client - Simplified for browser-only usage
export class VapiAIClient {
  // Create interview assistant configuration for web calls
  static createInterviewAssistant(candidateName: string, questions: string[]) {
    return {
      name: `Interview Assistant for ${candidateName}`,
      firstMessage: `Xin chào ${candidateName}! Tôi là AI interviewer sẽ phỏng vấn bạn hôm nay. Chúng ta sẽ có ${questions.length} câu hỏi. Bạn đã sẵn sàng chưa?`,
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Bạn là một AI interviewer chuyên nghiệp đang phỏng vấn ứng viên tên ${candidateName}.

NHIỆM VỤ:
- Tiến hành phỏng vấn một cách tự nhiên và thân thiện
- Hỏi từng câu một theo thứ tự
- Lắng nghe và phản hồi phù hợp
- Chuyển sang câu hỏi tiếp theo sau khi ứng viên trả lời xong
- Kết thúc phỏng vấn khi hết câu hỏi

CÁC CÂU HỎI PHỎNG VẤN:
${questions.map((q, index) => `${index + 1}. ${q}`).join("\n")}

HƯỚNG DẪN:
- Bắt đầu bằng lời chào thân thiện
- Hỏi từng câu một cách tự nhiên
- Có thể hỏi thêm để làm rõ nếu cần
- Phản hồi tích cực với câu trả lời
- Sử dụng tiếng Việt tự nhiên
- Giữ giọng điệu chuyên nghiệp nhưng thân thiện
- Mỗi phản hồi không quá 50 từ

Hãy bắt đầu cuộc phỏng vấn một cách tự nhiên!`,
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Adam voice - professional
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.2,
        useSpeakerBoost: true,
      },
      recordingEnabled: true,
      endCallMessage: `Cảm ơn ${candidateName} đã tham gia phỏng vấn. Chúc bạn may mắn!`,
      endCallPhrases: ["kết thúc", "tạm biệt", "cảm ơn", "bye", "goodbye", "hoàn thành"],
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
