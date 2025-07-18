import { type NextRequest, NextResponse } from "next/server"
import { VapiServerClient } from "@/lib/vapi-server"

export async function POST(request: NextRequest) {
  try {
    const { candidateName, questions } = await request.json()

    if (!candidateName || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing candidate name or questions" }, { status: 400 })
    }

    const assistant = await VapiServerClient.createInterviewAssistant(candidateName, questions)

    return NextResponse.json({
      success: true,
      data: assistant,
    })
  } catch (error: any) {
    console.error("Error creating assistant:", error)
    return NextResponse.json({ error: error.message || "Failed to create assistant" }, { status: 500 })
  }
}
