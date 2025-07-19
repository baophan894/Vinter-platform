"use client"

import { BorderStyles, FontSize, LineHeight, FontWeight, FontFamily } from "@/types/resume"
import useDimensions from "@/hooks/useDimensions"
import { cn } from "@/lib/utils"
import type { ResumeValues } from "@/types/resume"
import { formatDate } from "date-fns"
import Image from "next/image"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Badge } from "./ui/badge"

interface ResumePreviewProps {
  resumeData: ResumeValues
  contentRef?: React.Ref<HTMLDivElement>
  className?: string
}

export default function ResumePreview({ resumeData, contentRef, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width } = useDimensions(containerRef)

  // Kiểm tra an toàn cho resumeData
  if (!resumeData) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className={cn("aspect-[210/297] h-fit w-full bg-white text-black", className)} ref={containerRef}>
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
          fontFamily: getFontFamilyValue(resumeData.fontFamily),
          fontSize: getFontSizeValue(resumeData.fontSize),
          lineHeight: getLineHeightValue(resumeData.lineHeight),
          fontWeight: getFontWeightValue(resumeData.fontWeight),
        }}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  )
}

interface ResumeSectionProps {
  resumeData: ResumeValues
}

function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const {
    photo = null,
    firstName = "",
    lastName = "",
    jobTitle = "",
    city = "",
    country = "",
    phone = "",
    email = "",
    colorHex = "#3B82F6",
    borderStyle = BorderStyles.ROUNDED,
  } = resumeData || {}

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo)

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : ""
    if (objectUrl) setPhotoSrc(objectUrl)
    if (photo === null) setPhotoSrc("")
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc || "/placeholder.svg"}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE ? "0px" : borderStyle === BorderStyles.CIRCLE ? "9999px" : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p
            className="text-3xl font-bold"
            style={{
              color: colorHex,
            }}
          >
            {firstName} {lastName}
          </p>
          <p
            className="font-medium"
            style={{
              color: colorHex,
            }}
          >
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  )
}

function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData

  if (!summary) return null

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Professional profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  )
}

function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences = [], colorHex = "#3B82F6" } = resumeData || {}

  const workExperiencesNotEmpty = workExperiences?.filter((exp) => Object.values(exp).filter(Boolean).length > 0)

  if (!workExperiencesNotEmpty?.length) return null

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Work experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <div className="whitespace-pre-line text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function EducationSection({ resumeData }: ResumeSectionProps) {
  const { education, colorHex } = resumeData

  const educationsNotEmpty = education?.filter((edu) => Object.values(edu).filter(Boolean).length > 0)

  if (!educationsNotEmpty?.length) return null

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{
                color: colorHex,
              }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {edu.startDate &&
                    `${formatDate(edu.startDate, "MM/yyyy")} ${
                      edu.endDate ? `- ${formatDate(edu.endDate, "MM/yyyy")}` : ""
                    }`}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex, borderStyle } = resumeData

  if (!skills?.length) return null

  return (
    <>
      <hr
        className="border-2"
        style={{
          borderColor: colorHex,
        }}
      />
      <div className="break-inside-avoid space-y-3">
        <p
          className="text-lg font-semibold"
          style={{
            color: colorHex,
          }}
        >
          Skills
        </p>
        <div className="flex break-inside-avoid flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE ? "0px" : borderStyle === BorderStyles.CIRCLE ? "9999px" : "8px",
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  )
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
