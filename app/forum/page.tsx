"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Clock, Building, Plus, Filter } from "lucide-react"
import { motion } from "framer-motion"

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const jobPosts = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Vietnam",
      location: "Hà Nội",
      salary: "25-35 triệu",
      type: "Full-time",
      category: "Frontend",
      postedTime: "2 giờ trước",
      description: "Tìm kiếm Senior Frontend Developer có kinh nghiệm với React, TypeScript...",
      tags: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      id: 2,
      title: "Backend Developer (Node.js)",
      company: "StartupXYZ",
      location: "TP.HCM",
      salary: "20-30 triệu",
      type: "Full-time",
      category: "Backend",
      postedTime: "5 giờ trước",
      description: "Cần Backend Developer giỏi Node.js, Express, MongoDB để phát triển API...",
      tags: ["Node.js", "Express", "MongoDB", "AWS"],
    },
    {
      id: 3,
      title: "Full-stack Developer",
      company: "Digital Agency",
      location: "Đà Nẵng",
      salary: "18-25 triệu",
      type: "Full-time",
      category: "Fullstack",
      postedTime: "1 ngày trước",
      description: "Tuyển Full-stack Developer có thể làm việc với cả frontend và backend...",
      tags: ["React", "Node.js", "PostgreSQL", "Docker"],
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "CloudTech Solutions",
      location: "Remote",
      salary: "30-40 triệu",
      type: "Remote",
      category: "DevOps",
      postedTime: "2 ngày trước",
      description: "Tìm DevOps Engineer có kinh nghiệm với AWS, Kubernetes, CI/CD...",
      tags: ["AWS", "Kubernetes", "Docker", "Jenkins"],
    },
  ]

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
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
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

                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <Filter className="mr-2 h-4 w-4" />
                    Lọc
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-blue-900 hover:text-blue-700 cursor-pointer">
                          {job.title}
                        </CardTitle>
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
                            {job.postedTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-2">
                          {job.type}
                        </Badge>
                        <div className="text-lg font-semibold text-blue-900">{job.salary}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{job.description}</CardDescription>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button className="bg-blue-900 hover:bg-blue-800">Ứng tuyển ngay</Button>
                      <Button variant="outline">Xem chi tiết</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No results */}
          {filteredJobs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy công việc phù hợp với tiêu chí tìm kiếm</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
