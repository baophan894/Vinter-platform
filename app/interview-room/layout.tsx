import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Interview Room - Vinter Platform',
  description: 'Professional AI-powered interview experience',
}

export default function InterviewRoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
}
