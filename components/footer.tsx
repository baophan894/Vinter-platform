import Link from "next/link"
import { Bot, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">InterviewAI</span>
            </Link>
            <p className="text-gray-400">Nền tảng luyện tập phỏng vấn hàng đầu với công nghệ AI tiên tiến.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tính năng</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/mock-interview" className="hover:text-white transition-colors">
                  Mock Interview
                </Link>
              </li>
              <li>
                <Link href="/checklist" className="hover:text-white transition-colors">
                  Checklist
                </Link>
              </li>
              <li>
                <Link href="/cv-scanner" className="hover:text-white transition-colors">
                  CV Scanner
                </Link>
              </li>
              <li>
                <Link href="/forum" className="hover:text-white transition-colors">
                  Forum
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@interviewai.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 InterviewAI. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
