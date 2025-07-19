"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, Building, Plus, Filter, Loader2, Star, Briefcase, FileText } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

interface JobPost {
  _id: string
  id?: string
  title: string
  description: string
  company: string
  employmentType: string
  location: string
  experience: string
  salaryRange: string
  keyResponsibilities?: string
  requirements?: string
  benefits?: string
  companyValues?: string
  deadline?: string
  isActive?: boolean
  created_at: string
  updated_at?: string
  recommended?: boolean
  matchScore?: number
  reason?: string
  jobIndex?: number
}

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"all" | "matching">("all")
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = async () => {
    setLoading(true)
    setError(null)

    try {
      let response

      if (viewMode === "matching") {
        // Fetch jobs matching CV (POST with hardcoded userId)
        response = await axios.post(
          "http://localhost:5010/ai/recommend",
          {
            userId: "687b159857724aeddfbc2333",
          },
          {
            headers: {
              accept: "*/*",
              "Content-Type": "application/json",
            },
          },
        )
      } else {
        // Fetch all available jobs (GET)
        response = await axios.get("http://localhost:5010/recruitment", {
          headers: {
            accept: "*/*",
          },
        })
      }

      let transformedJobs: JobPost[] = []

      if (viewMode === "matching") {
        // Handle recommendation response structure
        const apiResponse = response.data
        const recommendationData = apiResponse.data || []

        transformedJobs = Array.isArray(recommendationData)
          ? recommendationData.map((item: any) => ({
              ...item.job,
              _id: item.job._id || item.job.id,
              id: item.job.id || item.job._id,
              title: item.job.title || "Untitled Position",
              description: item.job.description || "No description available",
              company: item.job.company || "Unknown Company",
              employmentType: item.job.employmentType || "Full-time",
              location: item.job.location || "Not specified",
              experience: item.job.experience || "Not specified",
              salaryRange: item.job.salaryRange || "Negotiable",
              keyResponsibilities: item.job.keyResponsibilities || "",
              requirements: item.job.requirements || "",
              benefits: item.job.benefits || "",
              companyValues: item.job.companyValues || "",
              deadline: item.job.deadline || "",
              isActive: item.job.isActive !== false,
              created_at: item.job.created_at || new Date().toISOString(),
              updated_at: item.job.updated_at || "",
              recommended: true,
              matchScore: item.matchScore,
              reason: item.reason,
              jobIndex: item.jobIndex,
            }))
          : []

        // Sort by match score (highest first)
        transformedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      } else {
        // Handle regular jobs response structure
        const apiResponse = response.data
        const jobs = apiResponse.data || []

        transformedJobs = Array.isArray(jobs)
          ? jobs.map((job: any) => ({
              _id: job._id || job.id,
              id: job.id || job._id,
              title: job.title || "Untitled Position",
              description: job.description || "No description available",
              company: job.company || "Unknown Company",
              employmentType: job.employmentType || "Full-time",
              location: job.location || "Not specified",
              experience: job.experience || "Not specified",
              salaryRange: job.salaryRange || "Negotiable",
              keyResponsibilities: job.keyResponsibilities || "",
              requirements: job.requirements || "",
              benefits: job.benefits || "",
              companyValues: job.companyValues || "",
              deadline: job.deadline || "",
              isActive: job.isActive !== false,
              created_at: job.created_at || new Date().toISOString(),
              updated_at: job.updated_at || "",
              recommended: false,
            }))
          : []
      }

      setJobPosts(transformedJobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs")
      console.error("Error fetching jobs:", err)

      // Set fallback data based on view mode
      if (viewMode === "matching") {
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
          {
            _id: "rec2",
            title: "Frontend Developer (Phù hợp với CV)",
            company: "Tech Startup",
            location: "TP.HCM",
            salaryRange: "25-35 triệu",
            employmentType: "Full-time",
            experience: "2+ years",
            description: "Cơ hội tốt cho developer có kinh nghiệm React...",
            requirements: "- React, JavaScript\n- CSS frameworks",
            benefits: "- Flexible hours\n- Learning budget",
            created_at: new Date().toISOString(),
            recommended: true,
            matchScore: 75,
            reason: "Kỹ năng frontend của bạn phù hợp với yêu cầu",
            jobIndex: 2,
          },
        ]
        setJobPosts(fallbackRecommendedData)
      } else {
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
            recommended: false,
          },
          {
            _id: "fallback2",
            title: "Backend Developer (Node.js)",
            company: "StartupXYZ",
            location: "TP.HCM",
            salaryRange: "20-30 triệu",
            employmentType: "Full-time",
            experience: "2+ years",
            description: "Cần Backend Developer giỏi Node.js, Express, MongoDB để phát triển API...",
            requirements: "- Proficient in Node.js\n- Experience with MongoDB",
            benefits: "- Health insurance\n- Remote work options",
            created_at: new Date().toISOString(),
            recommended: false,
          },
        ]
        setJobPosts(fallbackData)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [viewMode])

  const filteredJobs = jobPosts.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = selectedLocation === "All" || job.location === selectedLocation
    const matchesCategory = selectedCategory === "All" || job.category === selectedCategory
    return matchesSearch && matchesLocation && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Forum Tuyển dụng</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kết nối trực tiếp với nhà tuyển dụng và tìm kiếm cơ hội việc làm phù hợp
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* View Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    onClick={() => setViewMode("all")}
                    className={`flex-1 ${viewMode === "all" ? "bg-blue-900 hover:bg-blue-800" : ""}`}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Tất cả công việc có sẵn
                  </Button>
                  <Button
                    variant={viewMode === "matching" ? "default" : "outline"}
                    onClick={() => setViewMode("matching")}
                    className={`flex-1 ${viewMode === "matching" ? "bg-blue-900 hover:bg-blue-800" : ""}`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Công việc phù hợp với CV
                  </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Tìm kiếm công việc, công ty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Địa điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Tất cả</SelectItem>
                      <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                      <SelectItem value="TP.HCM">TP.HCM</SelectItem>
                      <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                      <SelectItem value="Remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">Tất cả</SelectItem>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Fullstack">Fullstack</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-blue-900 hover:bg-blue-800" onClick={fetchJobs} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                    {loading ? "Đang tải..." : "Lọc"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Indicator */}
          <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="text-sm">
              {viewMode === "matching" ? (
                <>
                  <Star className="mr-1 h-3 w-3" />
                  Hiển thị công việc phù hợp với CV
                </>
              ) : (
                <>
                  <Briefcase className="mr-1 h-3 w-3" />
                  Hiển thị tất cả công việc có sẵn
                </>
              )}
            </Badge>
          </motion.div>

          {/* Recommendation Summary - Only show for matching mode */}
          {viewMode === "matching" && !loading && filteredJobs.length > 0 && (
            <motion.div className="mb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">Kết quả phân tích CV</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{filteredJobs.length}</div>
                      <div className="text-sm text-blue-700">Công việc phù hợp</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredJobs.filter((job) => (job.matchScore || 0) >= 80).length}
                      </div>
                      <div className="text-sm text-green-700">Phù hợp cao (≥80%)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(
                          filteredJobs.reduce((sum, job) => sum + (job.matchScore || 0), 0) / filteredJobs.length,
                        ) || 0}
                        %
                      </div>
                      <div className="text-sm text-blue-700">Độ phù hợp trung bình</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Post Job Button */}
          <motion.div
            className="mb-8 text-right"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Đăng tin tuyển dụng
            </Button>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              <span className="ml-2 text-gray-600">
                {viewMode === "matching" ? "Đang phân tích CV..." : "Đang tải công việc..."}
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <p className="text-yellow-700 mb-2">⚠️ Không thể kết nối đến API server</p>
                  <p className="text-sm text-yellow-600 mb-4">Hiển thị dữ liệu mẫu thay thế</p>
                  <Button onClick={fetchJobs} variant="outline" className="bg-transparent">
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Job Listings */}
          {!loading && (
            <div className="space-y-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    className={`hover:shadow-lg transition-shadow duration-300 ${job.recommended ? "border-blue-200 bg-blue-50" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl text-blue-900 hover:text-blue-700 cursor-pointer">
                              {job.title}
                            </CardTitle>
                            {job.recommended && (
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  <Star className="mr-1 h-3 w-3" />
                                  Phù hợp CV
                                </Badge>
                                {job.matchScore && (
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      job.matchScore >= 80
                                        ? "border-green-500 text-green-700 bg-green-50"
                                        : job.matchScore >= 60
                                          ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                          : "border-red-500 text-red-700 bg-red-50"
                                    }`}
                                  >
                                    {job.matchScore}% phù hợp
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {job.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(job.created_at).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            {job.employmentType}
                          </Badge>
                          <div className="text-lg font-semibold text-blue-900">{job.salaryRange}</div>
                          {job.experience && <div className="text-xs text-gray-500 mt-1">{job.experience}</div>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{job.description}</CardDescription>

                      {job.reason && (
                        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                          <div className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm text-blue-800">Lý do phù hợp: </span>
                              <span className="text-sm text-blue-700">{job.reason}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {job.experience && (
                        <div className="mb-3">
                          <span className="font-medium text-sm text-gray-700">Kinh nghiệm: </span>
                          <span className="text-sm text-gray-600">{job.experience}</span>
                        </div>
                      )}

                      {job.requirements && (
                        <div className="mb-3">
                          <span className="font-medium text-sm text-gray-700">Yêu cầu: </span>
                          <div className="text-sm text-gray-600 whitespace-pre-line">{job.requirements}</div>
                        </div>
                      )}

                      {job.benefits && (
                        <div className="mb-4">
                          <span className="font-medium text-sm text-gray-700">Quyền lợi: </span>
                          <div className="text-sm text-gray-600 whitespace-pre-line">{job.benefits}</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button className="bg-blue-900 hover:bg-blue-800">Ứng tuyển ngay</Button>
                        <Button variant="outline">Xem chi tiết</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && filteredJobs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {viewMode === "matching"
                  ? "Không tìm thấy công việc phù hợp với CV của bạn"
                  : "Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
