# uSRD — Kho tàng học liệu sinh viên

Website tĩnh (HTML/CSS/JS thuần) — không cần cài đặt gì để chạy, không tốn phí hosting.

## 📁 Cấu trúc project
```
usrd-website/
├── index.html         → Trang chủ
├── tra-cuu.html        → Trang tra cứu (có ô tìm kiếm hoạt động)
├── danh-muc.html        → Trang danh mục
├── de-xuat.html         → Trang đề xuất
├── doc-sau.html          → Trang đọc sau
├── css/style.css        → Toàn bộ giao diện
└── js/partials.js       → Header + Footer dùng chung
```

## 🚀 Cách đưa lên mạng (không cần biết code)

### Bước 1 — Tạo tài khoản
1. Vào **https://github.com** → bấm "Sign up" → tạo tài khoản free
2. Vào **https://vercel.com** → bấm "Sign up" → chọn "Continue with GitHub" (dùng luôn tài khoản GitHub vừa tạo)

### Bước 2 — Tải project lên GitHub
1. Đăng nhập GitHub → bấm nút xanh **"New"** (hoặc dấu +) → **"New repository"**
2. Đặt tên: `usrd-website` → bấm **"Create repository"**
3. Trên trang repository vừa tạo, bấm **"uploading an existing file"**
4. Kéo-thả **toàn bộ** các file/folder trong thư mục `usrd-website` (index.html, css/, js/, các trang .html) vào khung upload
5. Bấm **"Commit changes"** ở dưới cùng

### Bước 3 — Deploy lên Vercel (2 phút, tự động)
1. Đăng nhập **vercel.com** → bấm **"Add New..."** → **"Project"**
2. Chọn repository `usrd-website` vừa tạo → bấm **"Import"**
3. Không cần chỉnh gì cả (vì là site tĩnh) → bấm **"Deploy"**
4. Sau ~30 giây, Vercel đưa cho bạn 1 link dạng `usrd-website.vercel.app` — đó là website sống, ai cũng truy cập được

### Bước 4 — Mỗi lần muốn cập nhật (sửa nội dung, thêm tài liệu)
1. Vào lại repository trên GitHub → vào đúng file cần sửa (vd `index.html`)
2. Bấm biểu tượng cây bút (Edit) → sửa nội dung → bấm **"Commit changes"**
3. **Xong!** Vercel tự động phát hiện thay đổi và cập nhật website trong ~30 giây, không cần làm gì thêm

## 📝 Về phần "Tra cứu"
Trang `tra-cuu.html` hiện tra cứu trên dữ liệu mẫu viết sẵn trong file (biến `documents` ở cuối file). Đây là bản demo để bạn thấy chức năng tìm kiếm hoạt động — lọc theo từ khóa và loại tài liệu ngay trên trình duyệt, không cần server.

Khi có nhiều tài liệu và cần cập nhật hàng ngày, bước tiếp theo nên chuyển sang nguồn dữ liệu ngoài (Google Sheet hoặc CMS) để không phải sửa code mỗi lần — mình có thể làm bước này sau khi bạn xác nhận đã deploy thành công bản hiện tại.

## 🔤 Font chữ
Dùng **Be Vietnam Pro** (phần thân) và **Source Serif 4** (tiêu đề) từ Google Fonts — cả hai đều hỗ trợ đầy đủ dấu tiếng Việt, tải qua CDN nên không lỗi font trên mọi máy/trình duyệt.
