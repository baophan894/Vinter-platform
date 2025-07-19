import { NextRequest, NextResponse } from 'next/server'

interface EvaluationData {
  sessionId: string
  candidateName: string
  jobDescription: string
  questions: string[]
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    text: string
    timestamp: Date
  }>
  interviewDuration: number
  scores: {
    technicalSkills: number
    communication: number
    problemSolving: number
    culturalFit: number
    overall: number
  }
  feedback: {
    strengths: string[]
    improvements: string[]
    recommendation: string
    detailedFeedback: string
  }
}

// Temporary in-memory storage (in production, use a database)
const evaluations: Map<string, EvaluationData> = new Map()

export async function POST(request: NextRequest) {
  try {
    const data: EvaluationData = await request.json()
    
    // Validate required fields
    if (!data.sessionId || !data.candidateName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Store evaluation
    evaluations.set(data.sessionId, {
      ...data,
      timestamp: new Date()
    } as any)

    return NextResponse.json({
      success: true,
      message: 'Evaluation saved successfully',
      evaluationId: data.sessionId
    })
  } catch (error) {
    console.error('Error saving evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to save evaluation' },
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

    const evaluation = evaluations.get(sessionId)
    
    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: evaluation
    })
  } catch (error) {
    console.error('Error retrieving evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve evaluation' },
      { status: 500 }
    )
  }
}

// Generate evaluation report export
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, format = 'json' } = await request.json()
    
    const evaluation = evaluations.get(sessionId)
    
    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      )
    }

    if (format === 'html') {
      // Generate HTML report
      const html = generateHTMLReport(evaluation)
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="interview-evaluation-${sessionId}.html"`
        }
      })
    }

    // Default JSON export
    return NextResponse.json({
      success: true,
      data: evaluation,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error exporting evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to export evaluation' },
      { status: 500 }
    )
  }
}

function generateHTMLReport(evaluation: EvaluationData): string {
  const duration = Math.floor(evaluation.interviewDuration / 60)
  const seconds = evaluation.interviewDuration % 60
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Evaluation Report - ${evaluation.candidateName}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .score-item { text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
        .score-value { font-size: 2em; font-weight: bold; color: #1e40af; }
        .conversation { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .user-message { background: #dbeafe; padding: 10px; margin: 5px 0; border-radius: 8px; }
        .assistant-message { background: #f3f4f6; padding: 10px; margin: 5px 0; border-radius: 8px; }
        .strengths { color: #059669; }
        .improvements { color: #dc2626; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Interview Evaluation Report</h1>
        <p><strong>Candidate:</strong> ${evaluation.candidateName}</p>
        <p><strong>Duration:</strong> ${duration}m ${seconds}s</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Overall Scores</h2>
        <div class="score-grid">
            <div class="score-item">
                <div class="score-value">${evaluation.scores.overall}/10</div>
                <div>Overall</div>
            </div>
            <div class="score-item">
                <div class="score-value">${evaluation.scores.technicalSkills}/10</div>
                <div>Technical Skills</div>
            </div>
            <div class="score-item">
                <div class="score-value">${evaluation.scores.communication}/10</div>
                <div>Communication</div>
            </div>
            <div class="score-item">
                <div class="score-value">${evaluation.scores.problemSolving}/10</div>
                <div>Problem Solving</div>
            </div>
            <div class="score-item">
                <div class="score-value">${evaluation.scores.culturalFit}/10</div>
                <div>Cultural Fit</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Job Description</h2>
        <p>${evaluation.jobDescription}</p>
    </div>

    <div class="section">
        <h2>Interview Questions</h2>
        <ol>
            ${evaluation.questions.map(q => `<li>${q}</li>`).join('')}
        </ol>
    </div>

    <div class="section">
        <h2>Conversation Transcript</h2>
        <div class="conversation">
            ${evaluation.conversationHistory.map(msg => `
                <div class="${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
                    <strong>${msg.role === 'user' ? 'Candidate' : 'Interviewer'}:</strong> ${msg.text}
                </div>
            `).join('')}
        </div>
    </div>

    <div class="section">
        <h2>Detailed Feedback</h2>
        <p>${evaluation.feedback.detailedFeedback}</p>
        
        <h3 class="strengths">Strengths</h3>
        <ul>
            ${evaluation.feedback.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
        <h3 class="improvements">Areas for Improvement</h3>
        <ul>
            ${evaluation.feedback.improvements.map(i => `<li>${i}</li>`).join('')}
        </ul>
        
        <h3>Recommendation</h3>
        <p><strong>${evaluation.feedback.recommendation}</strong></p>
    </div>

    <div class="section" style="text-align: center; color: #6b7280;">
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <p>Vinter Platform - AI Interview System</p>
    </div>
</body>
</html>
  `.trim()
}
