import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Interview Session API called')
    const formData = await request.formData()
    const jd = formData.get('jd') as string
    const cvFile = formData.get('cv') as File
    const mode = formData.get('mode') as string || 'basic'
    
    console.log('📋 JD length:', jd?.length)
    console.log('📄 CV file:', cvFile?.name, cvFile?.size, 'bytes')
    console.log('🎯 Mode:', mode)
    
    if (!jd || !cvFile) {
      console.log('❌ Missing JD or CV file')
      return NextResponse.json(
        { error: 'Job description and CV file are required' },
        { status: 400 }
      )
    }

    // Generate questions using your backend API (pass original file)
    const questions = await generateQuestionsFromJDAndCV(jd, cvFile, mode)
    console.log('✅ Questions generated:', questions.length, 'questions')
    
    return NextResponse.json({
      status: true,
      data: {
        questions,
        sessionId: `session-${Date.now()}`,
        mode
      }
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  // Simple text extraction for common file types
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.txt')) {
    return await file.text()
  }
  
  // For PDF/DOC files, extract basic information
  // In production, use proper PDF parsing libraries like pdf-parse
  const fileInfo = `File: ${file.name}, Size: ${Math.round(file.size / 1024)}KB`
  
  // Try to extract some text content if possible
  try {
    if (fileName.endsWith('.pdf')) {
      // For now, return file info - you can add pdf-parse library later
      return `${fileInfo}\nPDF file content will be processed by backend CV extraction service.`
    }
    
    // For other text-based files, try to read as text
    const text = await file.text()
    return text.length > 10 ? text : fileInfo
  } catch (error) {
    console.warn('Could not extract text from file:', error)
    return fileInfo
  }
}

async function generateQuestionsFromJDAndCV(jd: string, cvFile: File, mode: string): Promise<string[]> {
  try {
    // Use NEXT_PUBLIC_API_URL from .env to call your NestJS backend
    const backendApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010'
    
    console.log('🔗 Calling your NestJS backend API for interview questions...')
    console.log('📡 Backend URL:', `${backendApiUrl}/interview-session`)
    console.log('📋 JD length:', jd.length, 'chars')
    console.log('📄 CV file:', cvFile.name, `(${Math.round(cvFile.size / 1024)}KB)`)
    console.log('🎯 Mode:', mode)
    
    // Test backend connection first
    try {
      console.log('🔍 Testing backend connection...')
      const healthCheck = await fetch(`${backendApiUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 seconds timeout for health check
      })
      console.log('💓 Backend health check:', healthCheck.ok ? '✅ Online' : '❌ Offline')
    } catch (healthError) {
      console.warn('⚠️ Backend health check failed, proceeding anyway:', healthError)
    }
    
    // Create form data to match your backend API exactly
    const formData = new FormData()
    formData.append('jd', jd)
    formData.append('mode', mode)
    
    // Send CV file directly to your backend
    const arrayBuffer = await cvFile.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: cvFile.type || 'application/pdf' })
    formData.append('cv', blob, cvFile.name)
    
    const response = await fetch(`${backendApiUrl}/interview-session`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser handle multipart/form-data boundary
      },
      // Add timeout for network requests
      signal: AbortSignal.timeout(30000) // 30 seconds timeout
    })

    if (!response.ok) {
      console.error('❌ Backend API failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('❌ Error details:', errorText)
      
      // Fallback to basic questions if backend fails
      console.log('🔄 Using fallback questions due to backend error')
      const cvText = `CV File: ${cvFile.name} (${Math.round(cvFile.size / 1024)}KB)`
      return getFallbackQuestions(jd, cvText, mode)
    }

    const result = await response.json()
    console.log('✅ Backend API response structure:', Object.keys(result))
    
    // Extract questions from your backend response
    // Adjust this based on your actual response structure
    let questions: string[] = []
    
    if (Array.isArray(result)) {
      questions = result
    } else if (result.questions && Array.isArray(result.questions)) {
      questions = result.questions
    } else if (result.data && Array.isArray(result.data)) {
      questions = result.data
    } else if (result.data && result.data.questions && Array.isArray(result.data.questions)) {
      questions = result.data.questions
    } else {
      console.warn('⚠️ Unexpected response format from backend:', result)
      const cvText = `CV File: ${cvFile.name} (${Math.round(cvFile.size / 1024)}KB)`
      return getFallbackQuestions(jd, cvText, mode)
    }
    
    if (questions.length > 0) {
      console.log('✅ Generated', questions.length, 'contextual questions from your backend API')
      return questions
    } else {
      console.warn('⚠️ Backend returned empty questions array')
      const cvText = `CV File: ${cvFile.name} (${Math.round(cvFile.size / 1024)}KB)`
      return getFallbackQuestions(jd, cvText, mode)
    }
    
  } catch (error) {
    console.error('❌ Error calling your backend API:', error)
    console.log('🔄 Using fallback questions due to network/parsing error')
    const cvText = `CV File: ${cvFile.name} (${Math.round(cvFile.size / 1024)}KB)`
    return getFallbackQuestions(jd, cvText, mode)
  }
}

// Fallback function with smart questions based on JD analysis
function getFallbackQuestions(jd: string, cvText: string, mode: string): string[] {
  const jdLower = jd.toLowerCase()
  const cvLower = cvText.toLowerCase()
  
  // Smart basic questions that analyze the JD
  const basicQuestions = [
    "Tell me about yourself and how your background aligns with this role.",
    `What specifically interests you about this ${extractRoleTitle(jd)} position?`,
    "What are your key strengths that make you suitable for this role?",
    "Describe a challenging project you've worked on that relates to this position.",
    "How do you handle working under pressure and tight deadlines?"
  ]
  
  // Generate technical questions based on job requirements
  const technicalQuestions: string[] = []
  
  // Extract technologies from JD and generate relevant questions
  const technologies = extractTechnologies(jdLower)
  technologies.forEach(tech => {
    technicalQuestions.push(...getTechQuestions(tech))
  })
  
  // Experience-based questions tailored to the role
  const experienceQuestions = [
    `Walk me through a project where you used ${technologies[0] || 'your main technology stack'}.`,
    "What's the most challenging technical problem you've solved recently?",
    "How do you stay updated with new technologies in this field?",
    "Describe your experience with code reviews and collaborative development.",
    "Tell me about a time when you had to learn a new technology quickly for a project."
  ]
  
  // Combine questions based on mode
  let finalQuestions: string[] = []
  
  if (mode === 'advanced') {
    finalQuestions = [
      ...basicQuestions.slice(0, 2),
      ...technicalQuestions.slice(0, 4),
      ...experienceQuestions.slice(0, 2)
    ]
  } else if (mode === 'challenge') {
    finalQuestions = [
      ...basicQuestions.slice(0, 2),
      ...technicalQuestions.slice(0, 3),
      ...experienceQuestions.slice(0, 2),
      "Design a system architecture for a scalable application similar to what we're building.",
      "How would you approach mentoring junior developers?",
      "Describe how you would optimize performance in a high-traffic application."
    ]
  } else {
    // Basic mode
    finalQuestions = [
      ...basicQuestions.slice(0, 3),
      ...technicalQuestions.slice(0, 2)
    ]
  }
  
  return finalQuestions.slice(0, mode === 'basic' ? 5 : mode === 'advanced' ? 8 : 10)
}

function extractRoleTitle(jd: string): string {
  const lines = jd.split('\n')
  const firstLine = lines[0] || jd.substring(0, 100)
  return firstLine.toLowerCase().includes('developer') ? 'developer' : 
         firstLine.toLowerCase().includes('engineer') ? 'engineer' :
         firstLine.toLowerCase().includes('designer') ? 'designer' : 'technology'
}

function extractTechnologies(jdLower: string): string[] {
  const techs = []
  
  if (jdLower.includes('javascript') || jdLower.includes('js')) techs.push('JavaScript')
  if (jdLower.includes('react')) techs.push('React')
  if (jdLower.includes('node') || jdLower.includes('nodejs')) techs.push('Node.js')
  if (jdLower.includes('python')) techs.push('Python')
  if (jdLower.includes('java') && !jdLower.includes('javascript')) techs.push('Java')
  if (jdLower.includes('sql') || jdLower.includes('database')) techs.push('SQL/Database')
  if (jdLower.includes('aws') || jdLower.includes('cloud')) techs.push('Cloud/AWS')
  if (jdLower.includes('docker')) techs.push('Docker')
  if (jdLower.includes('kubernetes')) techs.push('Kubernetes')
  if (jdLower.includes('typescript')) techs.push('TypeScript')
  
  return techs.length > 0 ? techs : ['general programming']
}

function getTechQuestions(tech: string): string[] {
  const questions: { [key: string]: string[] } = {
    'JavaScript': [
      "Explain the difference between let, const, and var in JavaScript.",
      "How do you handle asynchronous operations in JavaScript?",
      "What are closures and how do you use them?"
    ],
    'React': [
      "Explain React hooks and how they compare to class components.",
      "How do you manage state in a React application?",
      "Describe how you would optimize React component performance."
    ],
    'Node.js': [
      "Explain the event loop in Node.js and how it handles asynchronous operations.",
      "How do you handle errors in Node.js applications?",
      "Describe your experience with Node.js frameworks like Express."
    ],
    'Python': [
      "Explain the difference between list and tuple in Python.",
      "How do you handle exceptions in Python?",
      "Describe your experience with Python frameworks like Django or Flask."
    ],
    'SQL/Database': [
      "Explain the difference between INNER JOIN and LEFT JOIN.",
      "How would you optimize a slow database query?",
      "Describe your approach to database design and normalization."
    ],
    'Cloud/AWS': [
      "Describe your experience with cloud platforms and deployment.",
      "How do you handle scalability in cloud applications?",
      "Explain your experience with AWS services or similar cloud providers."
    ]
  }
  
  return questions[tech] || [
    `Describe your experience working with ${tech}.`,
    `What challenges have you faced when using ${tech}?`
  ]
}
