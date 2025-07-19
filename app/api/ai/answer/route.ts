import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for interview Q&A (in production, use a database)
const interviewSessions: Map<string, Array<{question: string, answer: string, timestamp: Date}>> = new Map()

export async function POST(request: NextRequest) {
  try {
    const { sessionId, question, answer } = await request.json()
    
    if (!sessionId || !question || !answer) {
      return NextResponse.json(
        { error: 'Session ID, question, and answer are required' },
        { status: 400 }
      )
    }

    // Get existing session or create new one
    const existingQAs = interviewSessions.get(sessionId) || []
    
    // Add new Q&A
    existingQAs.push({
      question,
      answer,
      timestamp: new Date()
    })
    
    // Store updated session
    interviewSessions.set(sessionId, existingQAs)
    
    return NextResponse.json({
      status: true,
      data: {
        saved: true,
        sessionId,
        totalAnswers: existingQAs.length
      }
    })
  } catch (error) {
    console.error('Error saving Q&A:', error)
    return NextResponse.json(
      { error: 'Failed to save interview Q&A' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const qas = interviewSessions.get(sessionId) || []
    
    return NextResponse.json({
      status: true,
      data: {
        sessionId,
        qas,
        totalAnswers: qas.length
      }
    })
  } catch (error) {
    console.error('Error retrieving Q&A:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve interview Q&A' },
      { status: 500 }
    )
  }
}
