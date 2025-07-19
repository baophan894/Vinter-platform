"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FontFamily, FontSize, LineHeight, FontWeight } from "@/types/resume"
import { Type } from "lucide-react"

interface FontPickerProps {
  fontFamily: FontFamily
  fontSize: FontSize
  lineHeight: LineHeight
  fontWeight: FontWeight
  onFontFamilyChange: (font: FontFamily) => void
  onFontSizeChange: (size: FontSize) => void
  onLineHeightChange: (height: LineHeight) => void
  onFontWeightChange: (weight: FontWeight) => void
}

const fontFamilyOptions = [
  { value: FontFamily.INTER, label: "Inter", category: "Sans-serif" },
  { value: FontFamily.ROBOTO, label: "Roboto", category: "Sans-serif" },
  { value: FontFamily.OPEN_SANS, label: "Open Sans", category: "Sans-serif" },
  { value: FontFamily.LATO, label: "Lato", category: "Sans-serif" },
  { value: FontFamily.POPPINS, label: "Poppins", category: "Sans-serif" },
  { value: FontFamily.MONTSERRAT, label: "Montserrat", category: "Sans-serif" },
  { value: FontFamily.NUNITO, label: "Nunito", category: "Sans-serif" },
  { value: FontFamily.SOURCE_SANS, label: "Source Sans Pro", category: "Sans-serif" },
  { value: FontFamily.PLAYFAIR, label: "Playfair Display", category: "Serif" },
  { value: FontFamily.MERRIWEATHER, label: "Merriweather", category: "Serif" },
  { value: FontFamily.CRIMSON, label: "Crimson Text", category: "Serif" },
  { value: FontFamily.LIBRE_BASKERVILLE, label: "Libre Baskerville", category: "Serif" },
]

const fontSizeOptions = [
  { value: FontSize.SMALL, label: "Nhỏ", description: "Compact" },
  { value: FontSize.MEDIUM, label: "Vừa", description: "Standard" },
  { value: FontSize.LARGE, label: "Lớn", description: "Readable" },
  { value: FontSize.EXTRA_LARGE, label: "Rất lớn", description: "Bold" },
]

const lineHeightOptions = [
  { value: LineHeight.TIGHT, label: "Chặt", description: "1.2" },
  { value: LineHeight.NORMAL, label: "Bình thường", description: "1.5" },
  { value: LineHeight.RELAXED, label: "Thoải mái", description: "1.6" },
  { value: LineHeight.LOOSE, label: "Rộng", description: "1.8" },
]

const fontWeightOptions = [
  { value: FontWeight.LIGHT, label: "Mỏng", description: "300" },
  { value: FontWeight.NORMAL, label: "Bình thường", description: "400" },
  { value: FontWeight.MEDIUM, label: "Vừa", description: "500" },
  { value: FontWeight.SEMIBOLD, label: "Đậm vừa", description: "600" },
  { value: FontWeight.BOLD, label: "Đậm", description: "700" },
]

export function FontPicker({
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  onFontFamilyChange,
  onFontSizeChange,
  onLineHeightChange,
  onFontWeightChange,
}: FontPickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Tùy chỉnh font chữ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Font Family */}
        <div className="space-y-2">
          <Label>Font chữ</Label>
          <Select value={fontFamily} onValueChange={(value) => onFontFamilyChange(value as FontFamily)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn font chữ" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {fontFamilyOptions.map((font) => (
                <SelectItem key={font.value} value={font.value} className="font-medium">
                  <span>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <Label>Kích thước chữ</Label>
          <div className="grid grid-cols-2 gap-2">
            {fontSizeOptions.map((size) => (
              <Button
                key={size.value}
                variant={fontSize === size.value ? "default" : "outline"}
                size="sm"
                onClick={() => onFontSizeChange(size.value)}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <span className="font-medium">{size.label}</span>
                <span className="text-xs opacity-70">{size.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <Label>Khoảng cách dòng</Label>
          <div className="grid grid-cols-2 gap-2">
            {lineHeightOptions.map((height) => (
              <Button
                key={height.value}
                variant={lineHeight === height.value ? "default" : "outline"}
                size="sm"
                onClick={() => onLineHeightChange(height.value)}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <span className="font-medium">{height.label}</span>
                <span className="text-xs opacity-70">{height.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label>Độ đậm chữ</Label>
          <div className="grid grid-cols-3 gap-2">
            {fontWeightOptions.map((weight) => (
              <Button
                key={weight.value}
                variant={fontWeight === weight.value ? "default" : "outline"}
                size="sm"
                onClick={() => onFontWeightChange(weight.value)}
                className="flex flex-col gap-1 h-auto py-1"
              >
                <span className="font-medium text-xs">{weight.label}</span>
                <span className="text-xs opacity-70">{weight.description}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Xem trước</Label>
          <div
            className="p-4 border rounded-lg bg-gray-50"
            style={{
              fontFamily: getFontFamilyValue(fontFamily),
              fontSize: getFontSizeValue(fontSize),
              lineHeight: getLineHeightValue(lineHeight),
              fontWeight: getFontWeightValue(fontWeight),
            }}
          >
            <div className="space-y-2">
              <div className="text-lg font-bold">Nguyễn Văn A</div>
              <div className="text-sm">Frontend Developer</div>
              <div className="text-xs text-gray-600">
                Tôi là một developer với 3 năm kinh nghiệm trong việc phát triển ứng dụng web hiện đại.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getFontFamilyValue(family: FontFamily): string {
  const fontMap = {
    [FontFamily.INTER]: "var(--font-inter)",
    [FontFamily.ROBOTO]: "var(--font-roboto)",
    [FontFamily.OPEN_SANS]: "var(--font-open-sans)",
    [FontFamily.LATO]: "var(--font-lato)",
    [FontFamily.POPPINS]: "var(--font-poppins)",
    [FontFamily.MONTSERRAT]: "var(--font-montserrat)",
    [FontFamily.NUNITO]: "var(--font-nunito)",
    [FontFamily.SOURCE_SANS]: "var(--font-source-sans)",
    [FontFamily.PLAYFAIR]: "var(--font-playfair)",
    [FontFamily.MERRIWEATHER]: "var(--font-merriweather)",
    [FontFamily.CRIMSON]: "var(--font-crimson)",
    [FontFamily.LIBRE_BASKERVILLE]: "var(--font-libre)",
  }
  return fontMap[family] || "var(--font-inter)"
}

function getFontSizeValue(size: FontSize): string {
  switch (size) {
    case FontSize.SMALL:
      return "12px"
    case FontSize.MEDIUM:
      return "14px"
    case FontSize.LARGE:
      return "16px"
    case FontSize.EXTRA_LARGE:
      return "18px"
    default:
      return "14px"
  }
}

function getLineHeightValue(height: LineHeight): string {
  switch (height) {
    case LineHeight.TIGHT:
      return "1.2"
    case LineHeight.NORMAL:
      return "1.5"
    case LineHeight.RELAXED:
      return "1.6"
    case LineHeight.LOOSE:
      return "1.8"
    default:
      return "1.5"
  }
}

function getFontWeightValue(weight: FontWeight): string {
  switch (weight) {
    case FontWeight.LIGHT:
      return "300"
    case FontWeight.NORMAL:
      return "400"
    case FontWeight.MEDIUM:
      return "500"
    case FontWeight.SEMIBOLD:
      return "600"
    case FontWeight.BOLD:
      return "700"
    default:
      return "400"
  }
}
