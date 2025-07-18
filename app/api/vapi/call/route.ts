import { type NextRequest, NextResponse } from "next/server"
import { VapiServerClient } from "@/lib/vapi-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get("callId")

    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 })
    }

    const call = await VapiServerClient.getCall(callId)

    return NextResponse.json({
      success: true,
      data: call,
    })
  } catch (error: any) {
    console.error("Error getting call:", error)
    return NextResponse.json({ error: error.message || "Failed to get call" }, { status: 500 })
  }
}

// ✅ DELETE: kết thúc cuộc gọi
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callId = searchParams.get("callId")

    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 })
    }

    await VapiServerClient.endCall(callId)

    return NextResponse.json({
      success: true,
      message: "Call ended successfully",
    })
  } catch (error: any) {
    console.error("Error ending call:", error)
    return NextResponse.json({ error: error.message || "Failed to end call" }, { status: 500 })
  }
}
