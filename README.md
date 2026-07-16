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

## 📝 Cách đăng tài liệu mới hàng ngày (KHÔNG cần sửa code)

Website đã được nối với 1 **Google Sheet** — đây là nơi duy nhất bạn cần vào để thêm tài liệu.

### Cấu trúc Sheet (đúng 6 cột, đừng đổi tên cột)
```
Tên | Loại | Tác giả | Mô tả | Link file | Trạng thái
```

### Quy trình đăng bài
1. Mở Google Sheet đang dùng (link Sheet đang publish ở biến `USRD_SHEET_CSV_URL` trong file `js/data.js`)
2. Thêm 1 hàng mới ở cuối, điền đủ: Tên, Loại, Tác giả, Mô tả, Link file (dán link Google Drive của file PDF/Word)
3. **Xong!** Không cần "Publish" lại — Sheet đã publish 1 lần là link luôn tự động cập nhật theo dữ liệu mới nhất
4. Refresh lại website (Trang chủ, Tra cứu, Đề xuất) sẽ thấy tài liệu mới ngay lập tức

### Nếu muốn đổi sang Sheet khác
Mở file `js/data.js` → sửa dòng đầu tiên `USRD_SHEET_CSV_URL` → thay bằng link CSV mới → Commit trên GitHub.

### Lưu ý về link file
- Tài liệu (PDF/Word) nên để trên **Google Drive**, sau đó lấy link **"Bất kỳ ai có link đều xem được"** rồi dán vào cột "Link file"
- Không upload trực tiếp file vào GitHub (không tối ưu cho file lớn)

## 🔤 Font chữ
Dùng **Be Vietnam Pro** (phần thân) và **Source Serif 4** (tiêu đề) từ Google Fonts — cả hai đều hỗ trợ đầy đủ dấu tiếng Việt, tải qua CDN nên không lỗi font trên mọi máy/trình duyệt.
