"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Bot, CheckCircle, FileText, Users, Zap } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-6 bg-blue-100 text-blue-900 hover:bg-blue-200 px-4 py-2 text-sm font-medium">
                🚀 Nền tảng luyện tập phỏng vấn hàng đầu
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Chuẩn bị phỏng vấn
              <span className="block text-blue-200">thành công cùng AI</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Luyện tập phỏng vấn thực tế với AI, tối ưu hóa CV, và kết nối với cơ hội việc làm. Tất cả trong một nền
              tảng duy nhất.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
              >
                <Link href="/mock-interview">
                  Bắt đầu luyện tập <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg bg-transparent"
              >
                <Link href="/features">Tìm hiểu thêm</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-16 h-16 bg-blue-300 rounded-full opacity-20"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bộ công cụ hoàn chỉnh giúp bạn chuẩn bị tốt nhất cho cuộc phỏng vấn
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-blue-100">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-blue-900" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Mock Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    Luyện tập phỏng vấn 1-1 với AI thông minh. Upload JD và nhận câu hỏi phù hợp với vị trí ứng tuyển.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-blue-100">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-blue-900" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Checklist Kiến thức</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    Tạo kế hoạch học tập cá nhân hóa và checklist kiến thức cần thiết cho từng vị trí công việc.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-blue-100">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-blue-900" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Scan CV</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    Phân tích độ phù hợp giữa CV và JD. Nhận gợi ý cải thiện để tăng cơ hội được chọn.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-blue-100">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-900" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Forum Tuyển dụng</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    Kết nối trực tiếp với nhà tuyển dụng. Tìm kiếm cơ hội việc làm phù hợp với kỹ năng của bạn.
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Người dùng</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-200">Phỏng vấn thực hành</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Tỷ lệ thành công</div>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Công ty đối tác</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Cách thức hoạt động</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chỉ với 3 bước đơn giản, bạn đã có thể bắt đầu hành trình chuẩn bị phỏng vấn
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-900">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload JD</h3>
              <p className="text-gray-600">
                Tải lên job description của vị trí bạn muốn ứng tuyển để AI hiểu rõ yêu cầu công việc
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-900">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Luyện tập</h3>
              <p className="text-gray-600">
                Tham gia phỏng vấn thử với AI, nhận feedback chi tiết và cải thiện kỹ năng trả lời
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-900">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Thành công</h3>
              <p className="text-gray-600">
                Tự tin bước vào phỏng vấn thực tế với sự chuẩn bị kỹ lưỡng và kiến thức vững chắc
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng chinh phục phỏng vấn?</h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Hãy bắt đầu hành trình chuẩn bị phỏng vấn của bạn ngay hôm nay. Miễn phí cho 3 phiên đầu tiên!
            </p>
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
            >
              <Link href="/mock-interview">
                Bắt đầu ngay <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
