import { VapiClient } from "@vapi-ai/server-sdk"

const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY
const vapi = new VapiClient({
  token: VAPI_API_KEY!,
})

export class VapiServerClient {
  // ✅ Tạo assistant thôi, không tạo call nữa
  static async createInterviewAssistant(candidateName: string, questions: string[]) {
    try {
      const assistant = await vapi.assistants.create({
        name: candidateName,
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
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

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
          voiceId: "pNInz6obpgDQGcFmaJgB",
          stability: 0.5,
          similarityBoost: 0.8,
          style: 0.2,
          useSpeakerBoost: true,
        },
        endCallMessage: `Cảm ơn ${candidateName} đã tham gia phỏng vấn. Chúc bạn may mắn!`,
        endCallPhrases: ["kết thúc", "tạm biệt", "cảm ơn", "bye", "goodbye", "hoàn thành"],
        maxDurationSeconds: 1800,
        silenceTimeoutSeconds: 30,
        backgroundSound: "office",
      })

      return {
        assistantId: assistant.id,
        assistantName: assistant.name,
      }
    } catch (error) {
      console.error("❌ Error creating assistant:", error)
      throw error
    }
  }

  // Giữ lại các hàm khác nếu bạn cần
  static async getCall(callId: string) {
    return await vapi.calls.get(callId)
  }

  static async listCalls(limit = 10) {
    return await vapi.calls.list({ limit })
  }

  static async endCall(callId: string) {
    return await vapi.calls.update(callId)
  }

  static async getCallTranscript(callId: string) {
    const call = await vapi.calls.get(callId)
    return {
      analysis: call.analysis,
      cost: call.cost,
      duration: call.endedAt
        ? new Date(call.endedAt).getTime() - new Date(call.createdAt).getTime()
        : 0,
    }
  }

  static isConfigured(): boolean {
    return !!VAPI_API_KEY
  }
}
