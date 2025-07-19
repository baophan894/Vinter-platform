import { NextRequest, NextResponse } from 'next/server'

// Import the in-memory storage from answer route
const interviewSessions: Map<string, Array<{question: string, answer: string, timestamp: Date}>> = new Map()

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const sessionId = params.sessionId
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get session data
    const qas = interviewSessions.get(sessionId) || []
    
    // Generate HTML report
    const html = generateInterviewReport(sessionId, qas)
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="interview-report-${sessionId}.html"`
      }
    })
  } catch (error) {
    console.error('Error exporting report:', error)
    return NextResponse.json(
      { error: 'Failed to export interview report' },
      { status: 500 }
    )
  }
}

function generateInterviewReport(sessionId: string, qas: Array<{question: string, answer: string, timestamp: Date}>): string {
  const reportDate = new Date().toLocaleDateString()
  const duration = qas.length > 0 ? Math.round((qas[qas.length - 1].timestamp.getTime() - qas[0].timestamp.getTime()) / 1000 / 60) : 0
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Report - ${sessionId}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .question { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .answer { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .metadata { color: #6b7280; font-size: 0.9em; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Interview Report</h1>
        <p><strong>Session ID:</strong> ${sessionId}</p>
        <p><strong>Date:</strong> ${reportDate}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Total Questions:</strong> ${qas.length}</p>
    </div>

    <div class="section">
        <h2>Interview Q&A Session</h2>
        ${qas.map((qa, index) => `
            <div style="margin-bottom: 20px;">
                <div class="metadata">Question ${index + 1} - ${qa.timestamp.toLocaleTimeString()}</div>
                <div class="question">
                    <strong>Q:</strong> ${qa.question}
                </div>
                <div class="answer">
                    <strong>A:</strong> ${qa.answer}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section" style="text-align: center; color: #6b7280;">
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <p>Vinter Platform - AI Interview System</p>
    </div>
</body>
</html>
  `.trim()
}
