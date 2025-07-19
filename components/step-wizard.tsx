"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

interface StepWizardProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  children: React.ReactNode
}

export function StepWizard({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  children,
}: StepWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Bước {currentStep + 1} / {steps.length}
          </span>
          <span>{Math.round(progress)}% hoàn thành</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                index === currentStep
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : index < currentStep
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200",
              )}
            >
              <div className="flex-shrink-0">
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 flex items-center justify-center">{step.icon}</div>
                )}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep]?.title}</h2>
          <p className="text-gray-600">{steps[currentStep]?.description}</p>
        </div>

        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2 bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <Button onClick={onNext} disabled={!canGoNext} className="flex items-center gap-2">
          {currentStep === steps.length - 1 ? "Hoàn thành" : "Tiếp theo"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
