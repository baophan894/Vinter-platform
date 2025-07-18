import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    console.log("Vapi webhook received:", message)

    switch (message.type) {
      case "status-update":
        console.log(`Call ${message.call.id}: ${message.call.status}`)
        // Handle call status updates
        break

      case "transcript":
        console.log(`${message.role}: ${message.transcript}`)
        // Handle real-time transcript
        break

      case "function-call":
        return handleFunctionCall(message)

      case "call-start":
        console.log(`Call started: ${message.call.id}`)
        break

      case "call-end":
        console.log(`Call ended: ${message.call.id}`)
        // Save final transcript and analysis
        break

      default:
        console.log("Unknown message type:", message.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function handleFunctionCall(message: any) {
  const { functionCall } = message

  switch (functionCall.name) {
    case "get_interview_question":
      const questionData = {
        question: "Hãy kể về kinh nghiệm làm việc của bạn",
        followUp: "Bạn có thể chia sẻ thêm về dự án nào đó không?",
      }
      return NextResponse.json({ result: questionData })

    case "save_answer":
      // Save user's answer to database
      console.log("Saving answer:", functionCall.parameters)
      return NextResponse.json({ result: { saved: true } })

    default:
      return NextResponse.json({ error: "Unknown function" }, { status: 400 })
  }
}
