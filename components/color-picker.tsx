"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

const presetColors = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#10B981",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#84CC16",
  "#65A30D",
]

export function ColorPicker({ color, onChange, label = "Màu chủ đạo" }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: color }} />
            <Palette className="w-4 h-4" />
            <span className="flex-1 text-left">{color}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div>
              <Label htmlFor="color-input">Mã màu</Label>
              <Input
                id="color-input"
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
              />
            </div>
            <div>
              <Label>Màu có sẵn</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: presetColor,
                      borderColor: color === presetColor ? "#3B82F6" : "#E5E7EB",
                    }}
                    onClick={() => {
                      onChange(presetColor)
                      setIsOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="color-picker">Chọn màu tùy chỉnh</Label>
              <input
                id="color-picker"
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
