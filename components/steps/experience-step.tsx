"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Briefcase } from "lucide-react"
import type { ResumeValues, WorkExperience } from "@/types/resume"

interface ExperienceStepProps {
  data: ResumeValues
  onChange: (data: ResumeValues) => void
}

export function ExperienceStep({ data, onChange }: ExperienceStepProps) {
  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      position: "",
      company: "",
      startDate: null,
      endDate: null,
      description: "",
    }
    const currentExperiences = data.workExperiences || []
    onChange({
      ...data,
      workExperiences: [...currentExperiences, newExp],
    })
  }

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const currentExperiences = data.workExperiences || []
    const updated = [...currentExperiences]
    updated[index] = { ...updated[index], [field]: value }
    onChange({
      ...data,
      workExperiences: updated,
    })
  }

  const removeWorkExperience = (index: number) => {
    const currentExperiences = data.workExperiences || []
    onChange({
      ...data,
      workExperiences: currentExperiences.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Kinh nghiệm làm việc</h3>
          <p className="text-sm text-gray-600">Thêm kinh nghiệm làm việc của bạn, bắt đầu từ công việc gần nhất</p>
        </div>
        <Button onClick={addWorkExperience} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm kinh nghiệm
        </Button>
      </div>

      {(data.workExperiences || []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kinh nghiệm làm việc</h3>
              <p className="text-gray-600 mb-4">Thêm kinh nghiệm làm việc đầu tiên của bạn</p>
              <Button onClick={addWorkExperience} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm kinh nghiệm đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(data.workExperiences || []).map((exp, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Kinh nghiệm {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Vị trí công việc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                      placeholder="Frontend Developer"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Tên công ty <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                      placeholder="ABC Company"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Từ ngày</Label>
                    <Input
                      type="date"
                      value={exp.startDate ? exp.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        updateWorkExperience(index, "startDate", e.target.value ? new Date(e.target.value) : null)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Đến ngày</Label>
                    <Input
                      type="date"
                      value={exp.endDate ? exp.endDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        updateWorkExperience(index, "endDate", e.target.value ? new Date(e.target.value) : null)
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống nếu vẫn đang làm việc</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Mô tả công việc</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                    placeholder="• Phát triển và duy trì ứng dụng web sử dụng React và Node.js&#10;• Tối ưu hóa hiệu suất ứng dụng, giảm thời gian tải trang 40%&#10;• Làm việc nhóm với 5 developers trong môi trường Agile"
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mô tả chi tiết trách nhiệm và thành tích. Sử dụng bullet points để dễ đọc
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
