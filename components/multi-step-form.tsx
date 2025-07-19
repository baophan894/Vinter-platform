"use client"

import { useState } from "react"
import { StepWizard } from "./step-wizard"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { ExperienceStep } from "./steps/experience-step"
import { EducationStep } from "./steps/education-step"
import { SkillsStep } from "./steps/skills-step"
import { StylingStep } from "./steps/styling-step"
import { User, Briefcase, GraduationCap, Code, Palette } from "lucide-react"
import type { ResumeValues } from "@/types/resume"

interface MultiStepFormProps {
  resumeData: ResumeValues
  onChange: (data: ResumeValues) => void
}

const steps = [
  {
    id: "personal",
    title: "Thông tin cá nhân",
    description: "Điền thông tin cơ bản và ảnh đại diện của bạn",
    icon: <User className="w-4 h-4" />,
  },
  {
    id: "experience",
    title: "Kinh nghiệm",
    description: "Thêm kinh nghiệm làm việc và dự án đã thực hiện",
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: "education",
    title: "Học vấn",
    description: "Thông tin về trình độ học vấn và chứng chỉ",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: "skills",
    title: "Kỹ năng",
    description: "Liệt kê các kỹ năng chuyên môn và kỹ năng mềm",
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: "styling",
    title: "Tùy chỉnh",
    description: "Cá nhân hóa màu sắc và font chữ cho CV",
    icon: <Palette className="w-4 h-4" />,
  },
]

export function MultiStepForm({ resumeData, onChange }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal Info
        return !!(
          resumeData.firstName?.trim() &&
          resumeData.lastName?.trim() &&
          resumeData.jobTitle?.trim() &&
          resumeData.phone?.trim() &&
          resumeData.email?.trim()
        )
      case 1: // Experience
        return true // Optional step
      case 2: // Education
        return true // Optional step
      case 3: // Skills
        return true // Optional step
      case 4: // Styling
        return true // Always valid
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const canGoNext = validateStep(currentStep)
  const canGoPrevious = currentStep > 0

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep data={resumeData} onChange={onChange} />
      case 1:
        return <ExperienceStep data={resumeData} onChange={onChange} />
      case 2:
        return <EducationStep data={resumeData} onChange={onChange} />
      case 3:
        return <SkillsStep data={resumeData} onChange={onChange} />
      case 4:
        return <StylingStep data={resumeData} onChange={onChange} />
      default:
        return null
    }
  }

  return (
    <StepWizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
    >
      {renderStepContent()}
    </StepWizard>
  )
}
