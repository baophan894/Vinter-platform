"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Code } from "lucide-react"
import type { ResumeValues } from "@/types/resume"

interface SkillsStepProps {
  data: ResumeValues
  onChange: (data: ResumeValues) => void
}

const suggestedSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Git",
  "Docker",
  "AWS",
  "Azure",
  "Figma",
  "Photoshop",
  "Project Management",
  "Agile",
  "Scrum",
]

export function SkillsStep({ data, onChange }: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState("")

  const addSkill = (skill: string) => {
    const currentSkills = data.skills || []
    if (skill.trim() && !currentSkills.includes(skill.trim())) {
      onChange({
        ...data,
        skills: [...currentSkills, skill.trim()],
      })
    }
    setNewSkill("")
  }

  const removeSkill = (index: number) => {
    const currentSkills = data.skills || []
    onChange({
      ...data,
      skills: currentSkills.filter((_, i) => i !== index),
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill(newSkill)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Kỹ năng</h3>
        <p className="text-sm text-gray-600">Thêm các kỹ năng chuyên môn và kỹ năng mềm của bạn</p>
      </div>

      {/* Add Skills */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-base font-medium">Thêm kỹ năng</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập kỹ năng..."
                className="flex-1"
              />
              <Button onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Suggested Skills */}
          <div>
            <Label className="text-sm font-medium">Kỹ năng gợi ý</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedSkills
                .filter((skill) => !(data.skills || []).includes(skill))
                .slice(0, 12)
                .map((skill) => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill)}
                    className="text-xs h-7"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {skill}
                  </Button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Skills */}
      <Card>
        <CardContent className="pt-6">
          {(data.skills || []).length === 0 ? (
            <div className="text-center py-8">
              <Code className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kỹ năng nào</h3>
              <p className="text-gray-600">Thêm kỹ năng đầu tiên của bạn ở trên</p>
            </div>
          ) : (
            <div>
              <Label className="text-base font-medium">Kỹ năng của bạn ({(data.skills || []).length})</Label>
              <div className="flex flex-wrap gap-2 mt-3">
                {(data.skills || []).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-1 text-sm">
                    {skill}
                    <button onClick={() => removeSkill(index)} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
