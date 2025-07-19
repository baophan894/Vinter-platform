// app/auth/callback/page.tsx
"use client"

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthData } from '@/lib/auth'; // 👈 Import hàm của bạn
import { jwtDecode } from 'jwt-decode'; // 👈 Cài đặt: npm install jwt-decode

interface UserData {
  _id: string;
  email: string;
  name: string;
  photo: string;
  role: string;
  id: string;
}

interface DecodedToken {
  sub: string;
  email: string;
  role: string;
  // ... các trường khác nếu có
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      try {
        // Giải mã token để lấy thông tin user
        const decodedToken: DecodedToken = jwtDecode(token);
        
        // Tạo lại đối tượng user từ thông tin trong token
        // Lưu ý: Các thông tin chi tiết như 'photo', 'googleId' không có trong JWT,
        // bạn cần quyết định xem có cần chúng ngay hay không.
        const user: UserData = {
          _id: decodedToken.sub,
          id: decodedToken.sub,
          email: decodedToken.email,
          role: decodedToken.role,
          name: '', // Thông tin này có thể lấy từ API /users/me sau đó
          photo: '', // Tương tự
        };

        // ✅ Sử dụng hàm setAuthData của bạn để lưu cả token và user
        setAuthData({ token, user });

        // Chuyển hướng người dùng đến trang profile
        router.push('/profile'); 
      } catch(error) {
        console.error("Failed to process token:", error);
        router.push('/login');
      }
    } else {
      console.error("No token found in URL.");
      router.push('/login');
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Đang xác thực, vui lòng chờ...</p>
    </div>
  );
}