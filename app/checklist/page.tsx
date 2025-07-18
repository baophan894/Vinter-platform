"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, BookOpen, Target, FileText, Download, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"

export default function ChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [jobDescription, setJobDescription] = useState("")
  const [generatedChecklist, setGeneratedChecklist] = useState<string[]>([])
  const [studyPlan, setStudyPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const defaultCategories = [
    {
      title: "Chuẩn bị CV",
      icon: FileText,
      items: [
        "Cập nhật thông tin liên hệ",
        "Kiểm tra chính tả và ngữ pháp",
        "Tối ưu hóa từ khóa theo JD",
        "Định dạng CV chuyên nghiệp",
        "Chuẩn bị portfolio/dự án",
      ],
    },
    {
      title: "Kiến thức chuyên môn",
      icon: BookOpen,
      items: [
        "Ôn tập kiến thức cơ bản",
        "Nghiên cứu công nghệ mới",
        "Chuẩn bị case study",
        "Luyện tập coding (nếu có)",
        "Tìm hiểu best practices",
      ],
    },
    {
      title: "Nghiên cứu công ty",
      icon: Target,
      items: [
        "Tìm hiểu về công ty",
        "Nghiên cứu sản phẩm/dịch vụ",
        "Đọc tin tức gần đây",
        "Tìm hiểu văn hóa công ty",
        "Chuẩn bị câu hỏi cho interviewer",
      ],
    },
  ]

  const handleGenerateChecklist = async () => {
    if (!jobDescription.trim()) {
      setError("Vui lòng nhập job description")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await APIClient.generateChecklist(jobDescription)
      setGeneratedChecklist(result.checklist || result)
    } catch (err) {
      setError("Có lỗi xảy ra khi tạo checklist")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateStudyPlan = async () => {
    const allCheckedItems = [
      ...defaultCategories.flatMap((cat, catIndex) =>
        cat.items.filter((_, itemIndex) => checkedItems[`${catIndex}-${itemIndex}`]),
      ),
      ...generatedChecklist.filter((_, index) => checkedItems[`generated-${index}`]),
    ]

    if (allCheckedItems.length === 0) {
      setError("Vui lòng chọn ít nhất một mục trong checklist")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await APIClient.generateStudyPlan(allCheckedItems)
      setStudyPlan(result)
    } catch (err) {
      setError("Có lỗi xảy ra khi tạo kế hoạch học tập")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = (categoryIndex: number, itemIndex: number, isGenerated = false) => {
    const key = isGenerated ? `generated-${itemIndex}` : `${categoryIndex}-${itemIndex}`
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const getTotalProgress = () => {
    const totalItems = defaultCategories.reduce((sum, cat) => sum + cat.items.length, 0) + generatedChecklist.length
    const checkedCount = Object.values(checkedItems).filter(Boolean).length
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Checklist Chuẩn bị Phỏng vấn</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tạo checklist cá nhân hóa từ JD và lập kế hoạch học tập với AI
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          {/* AI Checklist Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="h-5 w-5" />
                  Tạo Checklist từ Job Description
                </CardTitle>
                <CardDescription>Nhập JD để AI tạo checklist chuẩn bị phỏng vấn cá nhân hóa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Dán job description tại đây..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[120px] resize-none bg-white"
                />
                <Button
                  onClick={handleGenerateChecklist}
                  className="bg-blue-900 hover:bg-blue-800"
                  disabled={loading || !jobDescription.trim()}
                >
                  {loading ? "Đang tạo..." : "Tạo Checklist với AI"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-900" />
                  Tiến độ tổng thể
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hoàn thành</span>
                    <span className="text-sm font-medium">{getTotalProgress()}%</span>
                  </div>
                  <Progress value={getTotalProgress()} className="h-2" />
                  <div className="flex gap-4">
                    <Button className="bg-blue-900 hover:bg-blue-800">
                      <Download className="mr-2 h-4 w-4" />
                      Tải xuống PDF
                    </Button>
                    <Button variant="outline" onClick={handleGenerateStudyPlan} disabled={loading}>
                      {loading ? "Đang tạo..." : "Tạo kế hoạch học tập"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Checklist from AI */}
          {generatedChecklist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="mb-8 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Sparkles className="h-5 w-5" />
                    Checklist từ AI
                    <Badge variant="secondary" className="ml-auto bg-green-200 text-green-800">
                      {generatedChecklist.filter((_, index) => checkedItems[`generated-${index}`]).length}/
                      {generatedChecklist.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Checklist được tạo dựa trên job description của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedChecklist.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Checkbox
                          id={`generated-${index}`}
                          checked={checkedItems[`generated-${index}`] || false}
                          onCheckedChange={() => handleCheck(0, index, true)}
                        />
                        <label
                          htmlFor={`generated-${index}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                            checkedItems[`generated-${index}`] ? "line-through text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Default Checklist Categories */}
          <div className="space-y-8">
            {defaultCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + categoryIndex * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="h-5 w-5 text-blue-900" />
                      {category.title}
                      <Badge variant="secondary" className="ml-auto">
                        {category.items.filter((_, itemIndex) => checkedItems[`${categoryIndex}-${itemIndex}`]).length}/
                        {category.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${categoryIndex}-${itemIndex}`}
                            checked={checkedItems[`${categoryIndex}-${itemIndex}`] || false}
                            onCheckedChange={() => handleCheck(categoryIndex, itemIndex)}
                          />
                          <label
                            htmlFor={`${categoryIndex}-${itemIndex}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                              checkedItems[`${categoryIndex}-${itemIndex}`]
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Study Plan */}
          {studyPlan && (
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">Kế hoạch học tập cá nhân</CardTitle>
                  <CardDescription>Kế hoạch chi tiết được tạo bởi AI dựa trên checklist bạn đã chọn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {studyPlan.sections?.map((section: any, index: number) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-2">{section.title}</h3>
                        {section.estimatedTime && (
                          <Badge variant="outline" className="mb-3">
                            {section.estimatedTime}
                          </Badge>
                        )}
                        <ul className="space-y-2 mb-4">
                          {section.items?.map((item: string, itemIndex: number) => (
                            <li key={itemIndex} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-1 text-purple-600 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {section.resources && section.resources.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm text-purple-800 mb-2">Tài liệu tham khảo:</h4>
                            <ul className="space-y-1">
                              {section.resources.map((resource: string, resIndex: number) => (
                                <li key={resIndex} className="text-xs text-purple-600">
                                  • {resource}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
