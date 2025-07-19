"use client"

import type React from "react"

import { useState } from "react"
import type { ResumeValues, Education, WorkExperience } from "@/types/resume"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Palette, Upload, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ColorPicker } from "./color-picker"
import { BorderStylePicker } from "./border-style-picker"
// Import FontPicker component
import { FontPicker } from "./font-picker"

interface ResumeFormProps {
  resumeData: ResumeValues
  onChange: (data: ResumeValues) => void
}

export function ResumeForm({ resumeData, onChange }: ResumeFormProps) {
  const [newSkill, setNewSkill] = useState("")

  // Kiểm tra an toàn cho resumeData
  if (!resumeData) {
    return <div>Loading...</div>
  }

  const updateField = (field: keyof ResumeValues, value: any) => {
    onChange({
      ...resumeData,
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

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = resumeData.skills || []
      updateField("skills", [...currentSkills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (index: number) => {
    const currentSkills = resumeData.skills || []
    updateField(
      "skills",
      currentSkills.filter((_, i) => i !== index),
    )
  }

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      position: "",
      company: "",
      startDate: null,
      endDate: null,
      description: "",
    }
    const currentExperiences = resumeData.workExperiences || []
    updateField("workExperiences", [...currentExperiences, newExp])
  }

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    const currentExperiences = resumeData.workExperiences || []
    const updated = [...currentExperiences]
    updated[index] = { ...updated[index], [field]: value }
    updateField("workExperiences", updated)
  }

  const removeWorkExperience = (index: number) => {
    const currentExperiences = resumeData.workExperiences || []
    updateField(
      "workExperiences",
      currentExperiences.filter((_, i) => i !== index),
    )
  }

  const addEducation = () => {
    const newEdu: Education = {
      degree: "",
      school: "",
      startDate: null,
      endDate: null,
    }
    const currentEducation = resumeData.education || []
    updateField("education", [...currentEducation, newEdu])
  }

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const currentEducation = resumeData.education || []
    const updated = [...currentEducation]
    updated[index] = { ...updated[index], [field]: value }
    updateField("education", updated)
  }

  const removeEducation = (index: number) => {
    const currentEducation = resumeData.education || []
    updateField(
      "education",
      currentEducation.filter((_, i) => i !== index),
    )
  }

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["personal", "styling", "experience", "education", "skills"]}
        className="w-full"
      >
        {/* Personal Information */}
        <AccordionItem value="personal">
          <AccordionTrigger className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  <div className="flex items-center gap-4">
                    {resumeData.photo && (
                      <div className="relative">
                        <img
                          src={
                            resumeData.photo instanceof File ? URL.createObjectURL(resumeData.photo) : resumeData.photo
                          }
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={removePhoto}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Tải ảnh lên
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Tên</Label>
                    <Input
                      id="firstName"
                      value={resumeData.firstName || ""}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Văn"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Họ</Label>
                    <Input
                      id="lastName"
                      value={resumeData.lastName || ""}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Nguyễn"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="jobTitle">Vị trí công việc</Label>
                    <Input
                      id="jobTitle"
                      value={resumeData.jobTitle || ""}
                      onChange={(e) => updateField("jobTitle", e.target.value)}
                      placeholder="Frontend Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                      id="city"
                      value={resumeData.city || ""}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Hà Nội"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                      id="country"
                      value={resumeData.country || ""}
                      onChange={(e) => updateField("country", e.target.value)}
                      placeholder="Việt Nam"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={resumeData.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+84 123 456 789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resumeData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Tóm tắt bản thân</Label>
                  <Textarea
                    id="summary"
                    value={resumeData.summary || ""}
                    onChange={(e) => updateField("summary", e.target.value)}
                    placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Styling */}
        <AccordionItem value="styling">
          <AccordionTrigger className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tùy chỉnh giao diện
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker color={resumeData.colorHex} onChange={(color) => updateField("colorHex", color)} />
                    <BorderStylePicker
                      borderStyle={resumeData.borderStyle}
                      onChange={(style) => updateField("borderStyle", style)}
                    />
                  </div>
                  <FontPicker
                    fontFamily={resumeData.fontFamily}
                    fontSize={resumeData.fontSize}
                    lineHeight={resumeData.lineHeight}
                    fontWeight={resumeData.fontWeight}
                    onFontFamilyChange={(font) => updateField("fontFamily", font)}
                    onFontSizeChange={(size) => updateField("fontSize", size)}
                    onLineHeightChange={(height) => updateField("lineHeight", height)}
                    onFontWeightChange={(weight) => updateField("fontWeight", weight)}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Work Experience */}
        <AccordionItem value="experience">
          <AccordionTrigger className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Kinh nghiệm làm việc
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Kinh nghiệm</CardTitle>
                  <Button onClick={addWorkExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(resumeData.workExperiences || []).map((exp, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Kinh nghiệm {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeWorkExperience(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Vị trí</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                          placeholder="Frontend Developer"
                        />
                      </div>
                      <div>
                        <Label>Công ty</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                          placeholder="ABC Company"
                        />
                      </div>
                      <div>
                        <Label>Từ ngày</Label>
                        <Input
                          type="date"
                          value={exp.startDate ? exp.startDate.toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            updateWorkExperience(index, "startDate", e.target.value ? new Date(e.target.value) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Đến ngày</Label>
                        <Input
                          type="date"
                          value={exp.endDate ? exp.endDate.toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            updateWorkExperience(index, "endDate", e.target.value ? new Date(e.target.value) : null)
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Mô tả công việc</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                        placeholder="Mô tả chi tiết về công việc và thành tích..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                {(!resumeData.workExperiences || resumeData.workExperiences.length === 0) && (
                  <p className="text-center text-gray-500 py-4">Chưa có kinh nghiệm nào. Nhấn "Thêm" để bắt đầu.</p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education">
          <AccordionTrigger className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Học vấn
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Học vấn</CardTitle>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(resumeData.education || []).map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Học vấn {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Bằng cấp</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          placeholder="Cử nhân Công nghệ thông tin"
                        />
                      </div>
                      <div>
                        <Label>Trường học</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                          placeholder="Đại học ABC"
                        />
                      </div>
                      <div>
                        <Label>Từ ngày</Label>
                        <Input
                          type="date"
                          value={edu.startDate ? edu.startDate.toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            updateEducation(index, "startDate", e.target.value ? new Date(e.target.value) : null)
                          }
                        />
                      </div>
                      <div>
                        <Label>Đến ngày</Label>
                        <Input
                          type="date"
                          value={edu.endDate ? edu.endDate.toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            updateEducation(index, "endDate", e.target.value ? new Date(e.target.value) : null)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {resumeData.education.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Chưa có thông tin học vấn. Nhấn "Thêm" để bắt đầu.</p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills">
          <AccordionTrigger className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Kỹ năng
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kỹ năng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Nhập kỹ năng..."
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
                  <Button onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(resumeData.skills || []).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
