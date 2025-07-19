import { NextResponse, type NextRequest } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://localhost:5010/recruitment", {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse = await response.json()
    const jobs = apiResponse.data || []

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching all jobs:", error)

    // Return fallback data if API is not available
    const fallbackData = [
      {
        _id: "fallback1",
        title: "Senior Frontend Developer",
        company: "TechCorp Vietnam",
        location: "Hà Nội",
        salaryRange: "25-35 triệu",
        employmentType: "Full-time",
        experience: "3+ years",
        description: "Tìm kiếm Senior Frontend Developer có kinh nghiệm với React, TypeScript...",
        requirements: "- Proficient in React\n- Experience with TypeScript",
        benefits: "- Competitive salary\n- Flexible working hours",
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json(fallbackData)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use hardcoded userId for CV matching
    const userId = "687b159857724aeddfbc2333"

    const response = await fetch("http://localhost:5010/recruitment", {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const recommendationData = await response.json()

    // Handle the recommendation response structure
    const transformedJobs = Array.isArray(recommendationData)
      ? recommendationData.map((item: any) => ({
          ...item.job,
          recommended: true,
          matchScore: item.matchScore,
          reason: item.reason,
          jobIndex: item.jobIndex,
        }))
      : []

    return NextResponse.json(transformedJobs)
  } catch (error) {
    console.error("Error fetching matching jobs:", error)

    // Return fallback recommended data
    const fallbackRecommendedData = [
      {
        _id: "rec1",
        title: "Senior React Developer (Phù hợp với CV)",
        company: "AI Tech Solutions",
        location: "Hà Nội",
        salaryRange: "30-40 triệu",
        employmentType: "Full-time",
        experience: "3+ years",
        description: "Vị trí được gợi ý dựa trên CV của bạn...",
        requirements: "- Expert in React\n- TypeScript experience",
        benefits: "- High salary\n- Stock options",
        created_at: new Date().toISOString(),
        recommended: true,
        matchScore: 85,
        reason: "Kinh nghiệm React của bạn phù hợp với vị trí này",
        jobIndex: 1,
      },
    ]

    return NextResponse.json(fallbackRecommendedData)
  }
}
