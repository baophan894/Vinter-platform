"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, BookOpen, Target, FileText, Download, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { APIClient } from "@/lib/api"
import jsPDF from "jspdf"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [jobDescription, setJobDescription] = useState("")
  const [generatedChecklist, setGeneratedChecklist] = useState<string[]>([])
  const [studyPlan, setStudyPlan] = useState<any>(null)
  const [dailyStudyPlan, setDailyStudyPlan] = useState<any>(null)
  const [studyDays, setStudyDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Ref for study plan section to scroll to
  const studyPlanRef = useRef<HTMLDivElement>(null)

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
      // Handle response structure: { data: { checklist: [...] } }
      const checklist = result.data?.checklist || result.checklist || result
      setGeneratedChecklist(checklist)
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
      // Call the new daily study plan API
      const result = await APIClient.generateDailyStudyPlan(allCheckedItems, studyDays)
      // Handle response structure: { data: { plan: [...] } }
      const plan = result.data?.plan || result.plan || result
      setDailyStudyPlan(plan)
      
      // Scroll to study plan section after successful creation
      setTimeout(() => {
        studyPlanRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        })
      }, 500) // Small delay to ensure the component has rendered
      
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

  const downloadPDF = () => {
    // Collect all checked items
    const allCheckedItems = [
      ...defaultCategories.flatMap((cat, catIndex) =>
        cat.items
          .map((item, itemIndex) => ({ item, checked: checkedItems[`${catIndex}-${itemIndex}`], category: cat.title }))
          .filter(({ checked }) => checked)
      ),
      ...generatedChecklist.map((item, index) => ({ 
        item, 
        checked: checkedItems[`generated-${index}`], 
        category: "AI Generated" 
      })).filter(({ checked }) => checked),
    ]

    // Create PDF using jsPDF with UTF-8 support
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    let yPosition = 20

    // Helper function to add text with automatic line wrapping and UTF-8 support
    const addText = (text: string, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize)
      if (isBold) {
        pdf.setFont("helvetica", "bold")
      } else {
        pdf.setFont("helvetica", "normal")
      }
      
      // Handle Vietnamese characters by using splitTextToSize with proper encoding
      const maxWidth = 180
      const lines = pdf.splitTextToSize(text, maxWidth)
      
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(line, 15, yPosition, { 
          maxWidth: maxWidth,
          align: 'left'
        })
        yPosition += fontSize === 16 ? 8 : fontSize === 14 ? 7 : 6
      })
      yPosition += 3
    }

    // PDF Header
    addText("CHECKLIST CHUẨN BỊ PHỎNG VẤN", 16, true)
    addText("=".repeat(50), 12)
    addText(`Tiến độ hoàn thành: ${getTotalProgress()}%`, 12, true)
    addText(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 12)
    yPosition += 10

    // Completed items
    addText("DANH SÁCH CÁC MỤC ĐÃ HOÀN THÀNH:", 14, true)
    if (allCheckedItems.length === 0) {
      addText("Chưa có mục nào được hoàn thành", 12)
    } else {
      allCheckedItems.forEach(({ item, category }) => {
        addText(`✓ [${category}] ${item}`, 10)
      })
    }
    yPosition += 10

    // Generated checklist
    if (generatedChecklist.length > 0) {
      addText("CHECKLIST TỪ AI:", 14, true)
      generatedChecklist.forEach((item, index) => {
        const status = checkedItems[`generated-${index}`] ? '✓' : '☐'
        addText(`${status} ${item}`, 10)
      })
      yPosition += 10
    }

    // Default categories
    addText("CHECKLIST MẶC ĐỊNH:", 14, true)
    defaultCategories.forEach((cat, catIndex) => {
      addText(`${cat.title.toUpperCase()}:`, 12, true)
      cat.items.forEach((item, itemIndex) => {
        const status = checkedItems[`${catIndex}-${itemIndex}`] ? '✓' : '☐'
        addText(`${status} ${item}`, 10)
      })
      yPosition += 5
    })

    // Daily Study Plan (new)
    if (dailyStudyPlan && Array.isArray(dailyStudyPlan)) {
      yPosition += 10
      addText("KẾ HOẠCH HỌC TẬP THEO NGÀY:", 14, true)
      dailyStudyPlan.forEach((dayPlan: any) => {
        addText(`Ngày ${dayPlan.day}:`, 12, true)
        if (dayPlan.tasks && Array.isArray(dayPlan.tasks)) {
          dayPlan.tasks.forEach((task: string) => {
            addText(`• ${task}`, 10)
          })
        }
        yPosition += 3
      })
    }

    // Legacy Study plan (if exists)
    if (studyPlan && studyPlan.sections) {
      yPosition += 10
      addText("KẾ HOẠCH HỌC TẬP CHI TIẾT:", 14, true)
      studyPlan.sections.forEach((section: any) => {
        addText(`${section.title}:`, 12, true)
        if (section.estimatedTime) {
          addText(`Thời gian ước tính: ${section.estimatedTime}`, 10)
        }
        if (section.items) {
          section.items.forEach((item: string) => {
            addText(`• ${item}`, 10)
          })
        }
        if (section.resources && section.resources.length > 0) {
          addText("Tài liệu tham khảo:", 10, true)
          section.resources.forEach((res: string) => {
            addText(`- ${res}`, 9)
          })
        }
        yPosition += 5
      })
    }

    // Download PDF
    pdf.save(`checklist-phong-van-${new Date().toISOString().split('T')[0]}.pdf`)
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

        <div className="max-w-6xl mx-auto">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Checklist Input & Items */}
            <div className="lg:col-span-2 space-y-8">
              {/* AI Checklist Generator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
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
                      className="bg-blue-900 hover:bg-blue-800 w-full"
                      disabled={loading || !jobDescription.trim()}
                    >
                      {loading ? "Đang tạo..." : "Tạo Checklist với AI"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Generated Checklist from AI */}
              {generatedChecklist.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="border-green-200 bg-green-50">
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Checklist Cơ bản</h2>
                {defaultCategories.map((category, categoryIndex) => (
                  <motion.div
                    key={categoryIndex}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
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
            </div>

            {/* Right Column - Study Plan & Progress */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Overview - Sticky */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-20"
              >
                <Card className="shadow-lg">
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
                      <Progress value={getTotalProgress()} className="h-3" />
                      
                      {/* Study Plan Controls */}
                      <div className="pt-4 border-t border-gray-200">
                        <Label htmlFor="studyDays" className="text-sm font-medium mb-2 block">
                          Số ngày học tập:
                        </Label>
                        <Input
                          id="studyDays"
                          type="number"
                          min="1"
                          max="30"
                          value={studyDays}
                          onChange={(e) => setStudyDays(Math.max(1, parseInt(e.target.value) || 7))}
                          className="mb-4"
                        />
                        <div className="space-y-2">
                          <Button 
                            variant="outline" 
                            onClick={handleGenerateStudyPlan} 
                            disabled={loading}
                            className="w-full"
                          >
                            {loading ? "Đang tạo..." : "Tạo kế hoạch học tập"}
                          </Button>
                          <Button 
                            className="bg-blue-900 hover:bg-blue-800 w-full" 
                            onClick={downloadPDF}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Tải xuống PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Study Plans - Full Width Below */}
          {(dailyStudyPlan || studyPlan) && (
            <motion.div
              ref={studyPlanRef}
              className="mt-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Kế hoạch Học tập</h2>
                <p className="text-gray-600">Kế hoạch chi tiết được tạo bởi AI dựa trên checklist bạn đã chọn</p>
              </div>

              {/* Daily Study Plan */}
              {dailyStudyPlan && Array.isArray(dailyStudyPlan) && (
                <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-purple-900 text-center">
                      Kế hoạch học tập {studyDays} ngày
                    </CardTitle>
                    <CardDescription className="text-center">
                      Phân chia nhiệm vụ theo từng ngày một cách khoa học
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {dailyStudyPlan.map((dayPlan: any, index: number) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {dayPlan.day}
                            </div>
                            <h3 className="font-semibold text-purple-900">Ngày {dayPlan.day}</h3>
                          </div>
                          <ul className="space-y-2">
                            {dayPlan.tasks?.map((task: string, taskIndex: number) => (
                              <li key={taskIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="h-3 w-3 mt-1 text-purple-600 flex-shrink-0" />
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                          {dayPlan.tasks?.length === 0 && (
                            <p className="text-sm text-gray-500 italic">Ngày nghỉ</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legacy Study Plan */}
              {studyPlan && (
                <Card className="bg-blue-50 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-blue-900 text-center">Kế hoạch học tập chi tiết</CardTitle>
                    <CardDescription className="text-center">Hướng dẫn chi tiết cho từng lĩnh vực</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {studyPlan.sections?.map((section: any, index: number) => (
                        <div key={index} className="p-6 bg-white rounded-lg border border-blue-200 shadow-sm">
                          <h3 className="font-semibold text-blue-900 mb-3 text-lg">{section.title}</h3>
                          {section.estimatedTime && (
                            <Badge variant="outline" className="mb-4 bg-blue-100 text-blue-800">
                              {section.estimatedTime}
                            </Badge>
                          )}
                          <ul className="space-y-3 mb-4">
                            {section.items?.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          {section.resources && section.resources.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium text-sm text-blue-800 mb-2">Tài liệu tham khảo:</h4>
                              <ul className="space-y-1">
                                {section.resources.map((resource: string, resIndex: number) => (
                                  <li key={resIndex} className="text-xs text-blue-600">
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
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
