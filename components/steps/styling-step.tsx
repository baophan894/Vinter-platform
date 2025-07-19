"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ColorPicker } from "@/components/color-picker"
import { BorderStylePicker } from "@/components/border-style-picker"
import { FontPicker } from "@/components/font-picker"
import type { ResumeValues } from "@/types/resume"

interface StylingStepProps {
  data: ResumeValues
  onChange: (data: ResumeValues) => void
}

export function StylingStep({ data, onChange }: StylingStepProps) {
  const updateField = (field: keyof ResumeValues, value: any) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tùy chỉnh giao diện</h3>
        <p className="text-sm text-gray-600">Cá nhân hóa CV của bạn với màu sắc và font chữ phù hợp</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ColorPicker color={data.colorHex} onChange={(color) => updateField("colorHex", color)} />
            <BorderStylePicker borderStyle={data.borderStyle} onChange={(style) => updateField("borderStyle", style)} />
          </div>

          <FontPicker
            fontFamily={data.fontFamily}
            fontSize={data.fontSize}
            lineHeight={data.lineHeight}
            fontWeight={data.fontWeight}
            onFontFamilyChange={(font) => updateField("fontFamily", font)}
            onFontSizeChange={(size) => updateField("fontSize", size)}
            onLineHeightChange={(height) => updateField("lineHeight", height)}
            onFontWeightChange={(weight) => updateField("fontWeight", weight)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
