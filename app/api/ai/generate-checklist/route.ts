import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Generate Checklist API called')
    const { jd } = await request.json()
    console.log('📋 JD received, length:', jd?.length)
    
    if (!jd) {
      console.log('❌ No JD provided')
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    // Analyze job description to generate relevant checklist
    const checklist = await generateChecklistFromJD(jd)
    console.log('✅ Checklist generated:', checklist.length, 'items')
    
    return NextResponse.json({
      status: true,
      data: {
        checklist
      }
    })
  } catch (error) {
    console.error('❌ Error generating checklist:', error)
    return NextResponse.json(
      { error: 'Failed to generate checklist' },
      { status: 500 }
    )
  }
}

async function generateChecklistFromJD(jd: string): Promise<string[]> {
  // Extract key requirements from job description
  const jdLower = jd.toLowerCase()
  
  const baseChecklist = [
    "Review the job description thoroughly",
    "Prepare your resume and portfolio",
    "Research the company background and culture",
    "Practice common interview questions"
  ]
  
  const skillBasedItems: string[] = []
  
  // Technical skills
  if (jdLower.includes('javascript') || jdLower.includes('js')) {
    skillBasedItems.push("Review JavaScript fundamentals and ES6+ features")
  }
  if (jdLower.includes('react') || jdLower.includes('reactjs')) {
    skillBasedItems.push("Prepare React concepts: hooks, state management, components")
  }
  if (jdLower.includes('node') || jdLower.includes('nodejs')) {
    skillBasedItems.push("Review Node.js and backend development concepts")
  }
  if (jdLower.includes('python')) {
    skillBasedItems.push("Prepare Python programming examples and frameworks")
  }
  if (jdLower.includes('java')) {
    skillBasedItems.push("Review Java programming and OOP concepts")
  }
  if (jdLower.includes('sql') || jdLower.includes('database')) {
    skillBasedItems.push("Practice SQL queries and database design concepts")
  }
  if (jdLower.includes('aws') || jdLower.includes('cloud')) {
    skillBasedItems.push("Review cloud computing and AWS services")
  }
  if (jdLower.includes('docker') || jdLower.includes('kubernetes')) {
    skillBasedItems.push("Prepare containerization and deployment concepts")
  }
  if (jdLower.includes('api') || jdLower.includes('rest')) {
    skillBasedItems.push("Review API design and RESTful services")
  }
  if (jdLower.includes('git') || jdLower.includes('version control')) {
    skillBasedItems.push("Prepare Git workflow and version control examples")
  }
  
  // Soft skills and experience
  if (jdLower.includes('team') || jdLower.includes('collaboration')) {
    skillBasedItems.push("Prepare examples of teamwork and collaboration")
  }
  if (jdLower.includes('leadership') || jdLower.includes('lead')) {
    skillBasedItems.push("Think of leadership experiences and examples")
  }
  if (jdLower.includes('agile') || jdLower.includes('scrum')) {
    skillBasedItems.push("Review Agile methodologies and your experience")
  }
  if (jdLower.includes('project') || jdLower.includes('management')) {
    skillBasedItems.push("Prepare project management examples")
  }
  
  const finalChecklist = [
    ...baseChecklist,
    ...skillBasedItems,
    "Prepare questions to ask the interviewer",
    "Test your internet connection and audio/video",
    "Choose a quiet, professional environment"
  ]
  
  return finalChecklist.slice(0, 10) // Limit to 10 items
}
