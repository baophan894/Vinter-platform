# Mock Interview với Vapi AI Integration

## Cấu hình Vapi AI

### 1. Tạo tài khoản Vapi
- Truy cập [https://vapi.ai](https://vapi.ai)
- Đăng ký tài khoản mới
- Đăng nhập vào Dashboard

### 2. Tạo Assistant
- Trong Dashboard, click "Create Assistant"
- Cấu hình assistant cho phỏng vấn:
  - **Name**: "Interview Assistant"
  - **Model**: GPT-4 hoặc Claude
  - **Prompt**: Cấu hình prompt cho phỏng vấn (ví dụ bên dưới)
  - **Voice**: Chọn giọng nói phù hợp (Nova, Alloy, Echo...)

### 3. Lấy API Keys
- Trong Dashboard, vào phần "API Keys"
- Copy **Private Key** và **Public Key**
- Cũng copy **Assistant ID** từ assistant vừa tạo

### 4. Cấu hình Environment Variables
```bash
# Copy file .env.example thành .env.local
cp .env.example .env.local

# Chỉnh sửa .env.local với các giá trị thật:
NEXT_PUBLIC_VAPI_PUBLIC_KEY=vapi_pk_abc123...  # ✅ Public Key (bắt đầu vapi_pk_)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id
VAPI_PRIVATE_KEY=vapi_sk_xyz789...             # 🔒 Private Key (chỉ backend)
```

**⚠️ LỖI PHỔ BIẾN:**
- **"Invalid Key" Error**: Đang dùng Private Key thay vì Public Key
- **Frontend chỉ dùng Public Key** (vapi_pk_...)
- **Private Key** (vapi_sk_...) chỉ dùng cho backend

### 5. Kiểm tra cấu hình
Khi chọn chế độ "Vapi AI Video Call", sẽ hiện Debug Panel để kiểm tra:
- ✅ Public Key format đúng (vapi_pk_...)
- ✅ Assistant ID hợp lệ
- ❌ Các lỗi cấu hình phổ biến

## Prompt gợi ý cho Interview Assistant

```
Bạn là một AI interviewer chuyên nghiệp, thông minh và thân thiện. Nhiệm vụ của bạn là thực hiện phỏng vấn ứng viên một cách tự nhiên và hiệu quả.

Hướng dẫn:
1. Bắt đầu bằng cách chào hỏi và giới thiệu bản thân
2. Hỏi các câu hỏi phỏng vấn một cách tự nhiên, không cứng nhắc
3. Lắng nghe câu trả lời và đưa ra câu hỏi follow-up phù hợp
4. Tạo không khí thoải mái cho ứng viên
5. Đánh giá câu trả lời và đưa ra feedback xây dựng
6. Kết thúc phỏng vấn một cách chuyên nghiệp

Phong cách:
- Thân thiện nhưng chuyên nghiệp
- Nói tiếng Việt tự nhiên
- Đặt câu hỏi sâu sắc và có ý nghĩa
- Khuyến khích ứng viên chia sẻ kinh nghiệm

Lưu ý: Giữ cuộc phỏng vấn trong khoảng 15-30 phút tùy thuộc vào phản hồi của ứng viên.
```

## Sử dụng

1. Khởi động server: `npm run dev`
2. Truy cập: http://localhost:3001
3. Vào trang Mock Interview
4. Chọn chế độ "Vapi AI Video Call"
5. Upload CV và JD
6. Bắt đầu phỏng vấn

## Troubleshooting

### ❌ Lỗi "Invalid Key" (401 Unauthorized)
**Nguyên nhân**: Dùng sai loại API key
```
{
  "message": "Invalid Key. Hot tip, you may be using the private key instead of the public key, or vice versa.",
  "error": "Unauthorized", 
  "statusCode": 401
}
```

**Giải pháp**:
1. Kiểm tra Public Key bắt đầu với `vapi_pk_`
2. KHÔNG dùng Private Key (`vapi_sk_`) cho frontend
3. Restart server sau khi sửa .env.local

### ❌ Lỗi Assistant ID
- Kiểm tra Assistant ID từ Dashboard Vapi
- Đảm bảo Assistant đã được tạo và activated

### ❌ Lỗi API Key Format
- Public Key: `vapi_pk_abc123...` ✅
- Private Key: `vapi_sk_xyz789...` ❌ (không dùng cho frontend)
- Placeholder: `your_*_here` ❌ (chưa cấu hình)

### Lỗi Camera/Microphone
- Cho phép truy cập camera và microphone trong browser
- Kiểm tra settings camera/mic trong hệ thống

### Lỗi Connection
- Kiểm tra internet connection
- Thử refresh page và reconnect

## Tính năng

- ✅ Video call interface giống Google Meet
- ✅ Real-time voice conversation với AI
- ✅ Transcript conversation history
- ✅ Camera và microphone controls
- ✅ Tích hợp với existing mock interview flow
- ✅ Auto-complete khi kết thúc cuộc phỏng vấn
