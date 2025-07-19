"use client"

import { useState } from "react"
import type { CVData } from "@/types/cv"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, Globe } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface CVFormProps {
  data: CVData
  onChange: (data: CVData) => void
}

export function CVForm({ data, onChange }: CVFormProps) {
  const [newSkill, setNewSkill] = useState("")

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    })
  }

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          id: Date.now().toString(),
          position: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
          current: false,
        },
      ],
    })
  }

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    })
  }

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          id: Date.now().toString(),
          degree: "",
          school: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    })
  }

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    })
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      onChange({
        ...data,
        skills: [...data.skills, { id: Date.now().toString(), name: newSkill.trim(), level: "Intermediate" }],
      })
      setNewSkill("")
    }
  }

  const removeSkill = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((skill) => skill.id !== id),
    })
  }

  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...data.projects,
        {
          id: Date.now().toString(),
          name: "",
          description: "",
          technologies: "",
          url: "",
        },
      ],
    })
  }

  const updateProject = (id: string, field: string, value: string) => {
    onChange({
      ...data,
      projects: data.projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)),
    })
  }

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((project) => project.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["personal", "experience", "education", "skills"]} className="w-full">
        {/* Personal Information */}
        <AccordionItem value="personal">
          <AccordionTrigger className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin cá nhân
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={data.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.personalInfo.email}
                      onChange={(e) => updatePersonalInfo("email", e.target.value)}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={data.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                      placeholder="+84 123 456 789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={data.personalInfo.address}
                      onChange={(e) => updatePersonalInfo("address", e.target.value)}
                      placeholder="Hà Nội, Việt Nam"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={data.personalInfo.website}
                      onChange={(e) => updatePersonalInfo("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={data.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Tóm tắt bản thân</Label>
                  <Textarea
                    id="summary"
                    value={data.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                    placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Experience */}
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
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Kinh nghiệm {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Vị trí</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                          placeholder="Frontend Developer"
                        />
                      </div>
                      <div>
                        <Label>Công ty</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                          placeholder="ABC Company"
                        />
                      </div>
                      <div>
                        <Label>Từ ngày</Label>
                        <Input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Đến ngày</Label>
                        <Input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                          disabled={exp.current}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Mô tả công việc</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        placeholder="Mô tả chi tiết về công việc và thành tích..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
                {data.experience.length === 0 && (
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
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Học vấn {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Bằng cấp</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                          placeholder="Cử nhân Công nghệ thông tin"
                        />
                      </div>
                      <div>
                        <Label>Trường học</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                          placeholder="Đại học ABC"
                        />
                      </div>
                      <div>
                        <Label>Từ năm</Label>
                        <Input
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                          placeholder="2018"
                        />
                      </div>
                      <div>
                        <Label>Đến năm</Label>
                        <Input
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                          placeholder="2022"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {data.education.length === 0 && (
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
                  {data.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="flex items-center gap-1">
                      {skill.name}
                      <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Projects */}
        <AccordionItem value="projects">
          <AccordionTrigger className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Dự án
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Dự án</CardTitle>
                  <Button onClick={addProject} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.projects.map((project, index) => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Dự án {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Tên dự án</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => updateProject(project.id, "name", e.target.value)}
                          placeholder="Website E-commerce"
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={project.url}
                          onChange={(e) => updateProject(project.id, "url", e.target.value)}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Mô tả</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, "description", e.target.value)}
                        placeholder="Mô tả chi tiết về dự án..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Công nghệ sử dụng</Label>
                      <Input
                        value={project.technologies}
                        onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                        placeholder="React, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                ))}
                {data.projects.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Chưa có dự án nào. Nhấn "Thêm" để bắt đầu.</p>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
