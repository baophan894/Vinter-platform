// app/login/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Chrome, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("auth_token")) {
      router.push("/profile")
    }
  }, [router])

  const handleGoogleLogin = () => {
    window.location.href = "https://vinter-api.onrender.com/auth/google"
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Background and Overlay */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.jpeg')" }}></div>
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <Card className="relative z-10 w-full max-w-md mx-auto shadow-lg border-blue-100 bg-white bg-opacity-90">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">Đăng nhập</CardTitle>
          <CardDescription className="text-gray-600">
            Chào mừng bạn trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin} // 👈 Gọi hàm điều hướng đơn giản
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6 text-lg border-blue-200 text-blue-800 hover:bg-blue-50 hover:text-blue-900 bg-transparent"
          >
            <Chrome className="h-5 w-5" />
            Đăng nhập với Google
          </Button>
          
          {/* Phần đăng nhập bằng email/mật khẩu giữ nguyên */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white px-2 text-gray-500">Hoặc</span>
            </div>
          </div>
          <div className="space-y-4">
            {/* ... form email/password ... */}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}