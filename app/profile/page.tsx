// app/profile/page.tsx
"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, Mail, Phone, User, Edit, Eye, X, File } from "lucide-react"
import { getAuthData, removeAuthData, isAuthenticated } from "@/lib/auth" // <-- Import removeAuthData

interface UserData {
  _id: string
  email: string
  name: string
  photo: string
  role: string
  id: string
}

export default function UserProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedCVs, setUploadedCVs] = useState([
    { id: 1, name: "NguyenMinhThang-EngCV.pdf" },
    { id: 2, name: "NguyenMinhThang-EngCV.pdf" },
    { id: 3, name: "CV_PhanQuocThaiBao.pdf" },
  ])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login") // Redirect to login if not authenticated
    } else {
      const authData = getAuthData()
      if (authData) {
        setUser(authData.user)
      }
    }
  }, [router])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    } else {
      setSelectedFile(null)
    }
  }

  const handleUploadCV = () => {
    if (selectedFile) {
      console.log("Uploading:", selectedFile.name)
      // In a real application, you would send this file to a server.
      // For demonstration, we'll just add it to the list.
      setUploadedCVs((prev) => [...prev, { id: Date.now(), name: selectedFile.name }])
      setSelectedFile(null) // Clear selected file after "upload"
      // Optionally clear the input field
      const fileInput = document.getElementById("cv-file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
  }

  const handleDeleteCV = (id: number) => {
    setUploadedCVs((prev) => prev.filter((cv) => cv.id !== id))
  }

  const handleLogout = () => {
    // <-- Đây là hàm xử lý đăng xuất
    removeAuthData() // <-- Gọi hàm xóa dữ liệu xác thực
    router.push("/login") // <-- Chuyển hướng về trang đăng nhập
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Đang tải hồ sơ...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white p-6 rounded-lg shadow-lg flex justify-between items-center max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold">Profile Information</h1>
        <div className="flex gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 text-lg font-semibold flex items-center gap-2"
          >
            <Link href="#">
              <Edit className="h-5 w-5" />
              Edit Profile
            </Link>
          </Button>
          <Button
            onClick={handleLogout} // <-- Nút Đăng xuất gọi hàm handleLogout
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-blue-900 px-6 py-3 text-lg bg-transparent"
          >
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-b-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4 border-4 border-blue-500 shadow-md">
              <AvatarImage src={user.photo || "/placeholder.svg?height=128&width=128"} alt="User Avatar" />
              <AvatarFallback className="text-4xl font-semibold bg-blue-100 text-blue-800">
                {user.name ? user.name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">Full Name</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">Email Address</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="font-medium text-gray-900">0123 456 789</p> {/* Placeholder phone number */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CV Management */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" /> CV Management
          </h2>

          {/* CV Upload Area */}
          <div
            className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center space-y-4 bg-blue-50 bg-opacity-50"
            // You can add onDragOver, onDragLeave, onDrop handlers here for full drag-and-drop functionality
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <File className="h-10 w-10 text-blue-600" />
            </div>
            <p className="text-gray-700 text-lg">Drag and drop your file here or click to browse</p>
            <p className="text-gray-500 text-sm">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
            <input
              id="cv-file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              onClick={() => document.getElementById("cv-file-input")?.click()}
              className="bg-blue-900 text-white hover:bg-blue-800 px-8 py-3 rounded-md text-lg font-semibold"
            >
              Select File
            </Button>
          </div>

          <Button
            className={`w-full py-3 rounded-md text-lg font-semibold ${
              selectedFile ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
            disabled={!selectedFile}
            onClick={handleUploadCV}
          >
            Upload Document
          </Button>

          {/* My CV Documents List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">My CV Documents</h3>
            <div className="space-y-3">
              {uploadedCVs.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-white"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-gray-800">{cv.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md"
                      onClick={() => handleDeleteCV(cv.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
