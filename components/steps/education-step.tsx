"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GraduationCap } from "lucide-react"
import type { ResumeValues, Education } from "@/types/resume"

interface EducationStepProps {
  data: ResumeValues
  onChange: (data: ResumeValues) => void
}

export function EducationStep({ data, onChange }: EducationStepProps) {
  const addEducation = () => {
    const newEdu: Education = {
      degree: "",
      school: "",
      startDate: null,
      endDate: null,
    }
    const currentEducation = data.education || []
    onChange({
      ...data,
      education: [...currentEducation, newEdu],
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const currentEducation = data.education || []
    const updated = [...currentEducation]
    updated[index] = { ...updated[index], [field]: value }
    onChange({
      ...data,
      education: updated,
    })
  }

  const removeEducation = (index: number) => {
    const currentEducation = data.education || []
    onChange({
      ...data,
      education: currentEducation.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Học vấn</h3>
          <p className="text-sm text-gray-600">Thêm thông tin học vấn của bạn, bắt đầu từ bằng cấp cao nhất</p>
        </div>
        <Button onClick={addEducation} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm học vấn
        </Button>
      </div>

      {(data.education || []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông tin học vấn</h3>
              <p className="text-gray-600 mb-4">Thêm thông tin học vấn đầu tiên của bạn</p>
              <Button onClick={addEducation} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm học vấn đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(data.education || []).map((edu, index) => (
            <Card key={index}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Học vấn {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
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
                      Bằng cấp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      placeholder="Cử nhân Công nghệ thông tin"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Trường học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      placeholder="Đại học Bách Khoa Hà Nội"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Từ năm</Label>
                    <Input
                      type="date"
                      value={edu.startDate ? edu.startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        updateEducation(index, "startDate", e.target.value ? new Date(e.target.value) : null)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Đến năm</Label>
                    <Input
                      type="date"
                      value={edu.endDate ? edu.endDate.toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        updateEducation(index, "endDate", e.target.value ? new Date(e.target.value) : null)
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống nếu vẫn đang học</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
