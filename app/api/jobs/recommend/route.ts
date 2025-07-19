import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const  userId  = "687b159857724aeddfbc2333"

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const response = await fetch("http://localhost:5010/ai/recommend", {
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

    // Transform the recommendation response to include match scores and reasons
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
    console.error("Error fetching recommended jobs:", error)

    // Return fallback recommended data with match scores
    const fallbackRecommendedData = [
      {
        _id: "rec1",
        title: "Senior React Developer (Recommended)",
        company: "AI Tech Solutions",
        location: "Hà Nội",
        salaryRange: "30-40 triệu",
        employmentType: "Full-time",
        experience: "3+ years",
        description: "Vị trí được gợi ý dựa trên profile của bạn. Cần Senior React Developer...",
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
