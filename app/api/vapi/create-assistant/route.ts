import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Create Assistant API called')
    const { candidateName, jobDescription, questions } = await request.json()
    console.log('👤 Candidate:', candidateName)
    console.log('❓ Questions count:', questions?.length)
    
    const privateKey = process.env.VAPI_PRIVATE_KEY
    console.log('🔑 Private key available:', !!privateKey)
    console.log('🔑 Private key format:', privateKey?.slice(0, 8) + '...')
    
    if (!privateKey) {
      console.log('❌ No private key configured')
      return NextResponse.json(
        { error: 'VAPI_PRIVATE_KEY not configured' },
        { status: 500 }
      )
    }

    // Kiểm tra format key - Accept both vapi_sk_ prefix and raw keys
    if (!privateKey.startsWith('vapi_sk_') && !privateKey.match(/^[a-f0-9-]{8,}/)) {
      console.error('❌ Invalid key format. Expected: vapi_sk_... or valid key from dashboard, got:', privateKey.substring(0, 10) + '...')
      return NextResponse.json(
        { error: 'Invalid Vapi private key format. Please check your key from dashboard.vapi.ai' },
        { status: 500 }
      )
    }

    if (privateKey === 'your_vapi_private_key_here') {
      console.error('❌ Using placeholder key, need real Vapi key')
      return NextResponse.json(
        { error: 'Please set real Vapi private key in .env.local from dashboard.vapi.ai' },
        { status: 500 }
      )
    }

    // Generate system prompt
    const systemPrompt = `You are a professional AI interviewer conducting an interview with candidate ${candidateName}.

MISSION:
- Conduct the interview naturally and professionally
- Ask questions one by one in sequence
- Listen and respond appropriately
- Move to the next question after the candidate finishes answering
- End the interview when all questions are completed

INTERVIEW QUESTIONS:
${questions.map((q: string, index: number) => `${index + 1}. ${q}`).join('\n')}

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

    // Create assistant using Vapi API
    console.log('📞 Calling Vapi API to create assistant...')
    const assistantResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Interview-${candidateName}`,
        firstMessage: `Hi ${candidateName}! I'm your AI interviewer today. Ready to start our interview session? Let's begin with a quick introduction - tell me about yourself!`,
        model: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.7,
          messages: [{
            role: "system",
            content: systemPrompt
          }]
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM"
        }
      }),
    })

    console.log('📞 Vapi API response status:', assistantResponse.status)
    
    if (!assistantResponse.ok) {
      const error = await assistantResponse.text()
      console.error('❌ Vapi API Error:', error)
      return NextResponse.json(
        { error: `Failed to create assistant: ${error}` },
        { status: assistantResponse.status }
      )
    }

    const assistant = await assistantResponse.json()
    console.log('✅ Assistant created successfully:', assistant.id)
    
    return NextResponse.json({
      success: true,
      assistantId: assistant.id,
      assistant
    })
  } catch (error) {
    console.error('Error creating assistant:', error)
    return NextResponse.json(
      { error: 'Failed to create assistant' },
      { status: 500 }
    )
  }
}
