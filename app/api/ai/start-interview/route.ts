import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const jd = formData.get('jd') as string
    const cvFile = formData.get('cv') as File
    const mode = formData.get('mode') as string || 'basic'
    
    if (!jd || !cvFile) {
      return NextResponse.json(
        { error: 'Job description and CV file are required' },
        { status: 400 }
      )
    }

    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      status: true,
      data: {
        sessionId,
        id: sessionId,
        mode,
        timestamp: new Date().toISOString(),
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Error starting interview:', error)
    return NextResponse.json(
      { error: 'Failed to start interview session' },
      { status: 500 }
    )
  }
}
