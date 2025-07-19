"use client"

import { BorderStyles } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Square, SquareUserRoundIcon as RoundedCorner, Circle } from "lucide-react"

interface BorderStylePickerProps {
  borderStyle: BorderStyles
  onChange: (style: BorderStyles) => void
}

export function BorderStylePicker({ borderStyle, onChange }: BorderStylePickerProps) {
  const styles = [
    { value: BorderStyles.SQUARE, label: "Vuông", icon: Square },
    { value: BorderStyles.ROUNDED, label: "Bo góc", icon: RoundedCorner },
    { value: BorderStyles.CIRCLE, label: "Tròn", icon: Circle },
  ]

  return (
    <div className="space-y-2">
      <Label>Kiểu viền</Label>
      <div className="grid grid-cols-3 gap-2">
        {styles.map((style) => {
          const Icon = style.icon
          return (
            <Button
              key={style.value}
              variant={borderStyle === style.value ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(style.value)}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{style.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
