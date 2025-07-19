"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"
import type { ResumeValues } from "@/types/resume"

interface PersonalInfoStepProps {
  data: ResumeValues
  onChange: (data: ResumeValues) => void
}

export function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  const updateField = (field: keyof ResumeValues, value: any) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField("photo", file)
    }
  }

  const removePhoto = () => {
    updateField("photo", null)
  }

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Ảnh đại diện</Label>
            <div className="flex items-center gap-6">
              {data.photo && (
                <div className="relative">
                  <img
                    src={data.photo instanceof File ? URL.createObjectURL(data.photo) : data.photo}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={removePhoto}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Nhấn để tải ảnh lên hoặc kéo thả ảnh vào đây</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF tối đa 10MB</p>
                  </div>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-base font-medium">
                Tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={data.firstName || ""}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Văn"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-base font-medium">
                Họ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={data.lastName || ""}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Nguyễn"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="jobTitle" className="text-base font-medium">
              Vị trí công việc <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobTitle"
              value={data.jobTitle || ""}
              onChange={(e) => updateField("jobTitle", e.target.value)}
              placeholder="Frontend Developer"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-base font-medium">
                Thành phố
              </Label>
              <Input
                id="city"
                value={data.city || ""}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Hà Nội"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="country" className="text-base font-medium">
                Quốc gia
              </Label>
              <Input
                id="country"
                value={data.country || ""}
                onChange={(e) => updateField("country", e.target.value)}
                placeholder="Việt Nam"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-base font-medium">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={data.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+84 123 456 789"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={data.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="example@email.com"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="summary" className="text-base font-medium">
              Tóm tắt bản thân
            </Label>
            <Textarea
              id="summary"
              value={data.summary || ""}
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp của bạn..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gợi ý: Viết 2-3 câu về kinh nghiệm, kỹ năng chính và mục tiêu nghề nghiệp
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
