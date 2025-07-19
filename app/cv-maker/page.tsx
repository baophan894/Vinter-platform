"use client"

import { useState } from "react"
import { MultiStepForm } from "@/components/multi-step-form"
import ResumePreview from "@/components/resume-preview"
import type { ResumeValues } from "@/types/resume"
import { BorderStyles, FontFamily, FontSize, LineHeight, FontWeight } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Download, Eye, Edit3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const initialResumeData: ResumeValues = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  summary: "",
  skills: [],
  education: [],
  workExperiences: [],
  photo: null,
  colorHex: "#3B82F6",
  borderStyle: BorderStyles.ROUNDED,
  fontFamily: FontFamily.INTER,
  fontSize: FontSize.MEDIUM,
  lineHeight: LineHeight.NORMAL,
  fontWeight: FontWeight.NORMAL,
}

export default function CVMaker() {
  const [resumeData, setResumeData] = useState<ResumeValues>(initialResumeData)
  const [activeTab, setActiveTab] = useState("edit")

  const handleDataChange = (newData: ResumeValues) => {
    if (newData) {
      setResumeData(newData)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CV Maker Professional</h1>
          <p className="text-lg text-gray-600">Tạo CV chuyên nghiệp theo từng bước một cách dễ dàng</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Tạo CV
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Xem trước
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="edit" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <MultiStepForm resumeData={resumeData} onChange={handleDataChange} />
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Xem trước CV</h3>
                    <p className="text-sm text-gray-600">CV sẽ cập nhật tự động khi bạn nhập thông tin</p>
                  </div>
                  <ResumePreview resumeData={resumeData} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="flex justify-center mb-4">
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Tải xuống PDF
              </Button>
            </div>
            <div className="flex justify-center">
              <ResumePreview resumeData={resumeData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
