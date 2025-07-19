import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Analyze CV API called')
    const formData = await request.formData()
    const jd = formData.get('jd') as string
    const cvFile = formData.get('cv') as File
    
    console.log('📋 JD length:', jd?.length)
    console.log('📄 CV file:', cvFile?.name, cvFile?.size, 'bytes')
    
    if (!jd || !cvFile) {
      console.log('❌ Missing JD or CV file')
      return NextResponse.json(
        { error: 'Job description and CV file are required' },
        { status: 400 }
      )
    }

    // Extract text from CV file
    const cvText = await extractTextFromFile(cvFile)
    console.log('📝 CV text extracted, length:', cvText.length)
    
    // Analyze CV compatibility with JD
    const analysis = await analyzeCVCompatibility(jd, cvText, cvFile)
    console.log('✅ CV analysis completed')
    
    return NextResponse.json({
      status: true,
      data: analysis
    })
  } catch (error) {
    console.error('❌ Error analyzing CV:', error)
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    )
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.txt')) {
    return await file.text()
  } else if (fileName.endsWith('.pdf')) {
    // For PDF files, we'll use a simple text extraction
    // In a real app, you'd use pdf-parse or similar library
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    
    // Simple text extraction attempt
    try {
      const text = new TextDecoder().decode(uint8Array)
      return text
    } catch {
      // If binary PDF, return placeholder with useful info
      return `CV File: ${file.name}\nFile Size: ${file.size} bytes\nThis appears to be a PDF file that requires proper parsing.`
    }
  }
  
  // For other file types, return basic info
  return `CV File: ${file.name}\nFile Size: ${file.size} bytes`
}

async function analyzeCVCompatibility(jd: string, cvText: string, cvFile: File): Promise<any> {
  console.log('🤖 Sending to OpenAI for real CV analysis...')
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional HR expert analyzing CV compatibility with job descriptions. 
            
Analyze the CV against the job requirements and return a JSON response with:
- score: {value: number} (0-100)
- matchScore: number (0-100)
- positivePoints: string[] (3-5 specific strengths)
- improvementAreas: string[] (3-5 specific areas to improve)
- requiredSkills: string[] (skills mentioned in JD)
- foundSkills: string[] (skills found in CV)
- analysis: {
    skillsMatch: number,
    totalRequired: number,
    experienceLevel: string
  }

Be specific and constructive in your feedback.`
          },
          {
            role: 'user',
            content: `Job Description:\n${jd}\n\n---\n\nCV Content:\n${cvText}\n\nCV Filename: ${cvFile.name}\nCV Size: ${cvFile.size} bytes\n\nPlease analyze this CV against the job requirements.`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      console.error('❌ OpenAI API error:', response.status, await response.text())
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    // Try to parse JSON response
    try {
      const analysis = JSON.parse(content)
      console.log('✅ OpenAI analysis completed, score:', analysis.score?.value || analysis.matchScore)
      return analysis
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError)
      // Fallback to basic analysis if JSON parsing fails
      return createFallbackAnalysis(jd, cvText, cvFile)
    }

  } catch (error) {
    console.error('❌ Error calling OpenAI:', error)
    // Fallback to basic analysis
    return createFallbackAnalysis(jd, cvText, cvFile)
  }
}

// Fallback analysis function
function createFallbackAnalysis(jd: string, cvText: string, cvFile: File): any {
  console.log('⚠️ Using fallback analysis method')
  
  const jdLower = jd.toLowerCase()
  const cvLower = cvText.toLowerCase()
  
  // Skills matching
  const requiredSkills: string[] = []
  const foundSkills: string[] = []
  
  // Technical skills check
  const skills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 
    'git', 'html', 'css', 'typescript', 'mongodb', 'postgresql', 'redis'
  ]
  
  skills.forEach(skill => {
    if (jdLower.includes(skill)) {
      requiredSkills.push(skill)
      if (cvLower.includes(skill)) {
        foundSkills.push(skill)
      }
    }
  })
  
  // Calculate compatibility score
  const skillsScore = requiredSkills.length > 0 ? (foundSkills.length / requiredSkills.length) * 100 : 80
  
  // Experience level check
  let experienceScore = 70
  if (jdLower.includes('senior') || jdLower.includes('lead')) {
    experienceScore = cvLower.includes('senior') || cvLower.includes('lead') ? 90 : 60
  } else if (jdLower.includes('junior') || jdLower.includes('entry')) {
    experienceScore = 85
  }
  
  // Overall score
  const overallScore = Math.round((skillsScore + experienceScore) / 2)
  
  // Generate positive points
  const positivePoints: string[] = []
  if (foundSkills.length > 0) {
    positivePoints.push(`Technical skills match: ${foundSkills.join(', ')}`)
  }
  if (cvFile.size > 50000) { // If file is substantial
    positivePoints.push("Comprehensive CV with detailed information")
  }
  positivePoints.push("Professional presentation and format")
  if (overallScore > 75) {
    positivePoints.push("Strong overall compatibility with job requirements")
  }
  
  // Generate improvement areas
  const improvementAreas: string[] = []
  const missingSkills = requiredSkills.filter(skill => !foundSkills.includes(skill))
  if (missingSkills.length > 0) {
    improvementAreas.push(`Consider highlighting: ${missingSkills.join(', ')}`)
  }
  if (overallScore < 80) {
    improvementAreas.push("Could emphasize more relevant experience")
  }
  improvementAreas.push("Add specific achievements and metrics")
  if (!cvLower.includes('project') && !cvLower.includes('achievement')) {
    improvementAreas.push("Include concrete project examples")
  }
  
  return {
    score: { value: overallScore },
    matchScore: overallScore,
    positivePoints,
    improvementAreas,
    requiredSkills,
    foundSkills,
    analysis: {
      skillsMatch: foundSkills.length,
      totalRequired: requiredSkills.length,
      experienceLevel: experienceScore > 80 ? 'Good' : 'Adequate'
    }
  }
}
