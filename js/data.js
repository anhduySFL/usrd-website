// ============================================================
// KHI CẦN ĐỔI SHEET: chỉ cần thay link bên dưới, mọi trang sẽ tự cập nhật
// ============================================================
const USRD_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS5NRCDx09z-zz3JFcjlxGURDzkD3paOuDIVNQbiNa0cbnhdiEUblQnSqjf8PfuVDgXFhnR9HQNqK5_/pub?gid=1778908273&single=true&output=csv";

// Parser CSV đầy đủ, xử lý được cả nội dung nhiều dòng bên trong 1 ô (ví dụ ô "Nội dung" của bài viết dài)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* bỏ qua */ }
      else { field += c; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  const nonEmptyRows = rows.filter(r => r.some(v => v.trim() !== ""));
  if (nonEmptyRows.length === 0) return [];

  const headers = nonEmptyRows[0].map(h => h.trim());
  return nonEmptyRows.slice(1).map(values => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || "").trim(); });
    return obj;
  });
}

// Tạo slug từ tiêu đề (dùng làm URL cho trang đọc bài viết)
function usrdSlugify(str) {
  return str.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

// Chuẩn hóa tên cột tiếng Việt trong Sheet -> tên field dùng trong code
function normalizeDoc(row, index) {
  const title = row["Tên"] || "";
  const format = (row["Định dạng"] || "").trim();
  return {
    title: title,
    type: row["Loại"] || "",
    author: row["Tác giả"] || "",
    desc: row["Mô tả"] || "",
    fileLink: row["Link file"] || "#",
    status: row["Trạng thái"] || "",
    format: format || "Tệp đính kèm", // mặc định là tệp đính kèm nếu bỏ trống
    content: row["Nội dung"] || "",
    slug: usrdSlugify(title) || `bai-viet-${index}`
  };
}

// Trả về Promise chứa mảng tài liệu, dùng chung cho mọi trang
async function usrdLoadDocuments() {
  try {
    const res = await fetch(USRD_SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tải được dữ liệu từ Google Sheet");
    const text = await res.text();
    const rows = parseCsv(text);
    return rows.map(normalizeDoc).filter(d => d.title);
  } catch (err) {
    console.error("uSRD: lỗi tải dữ liệu tài liệu", err);
    return [];
  }
}

// Sinh HTML cho nút hành động: "Đọc bài viết" (trang nội bộ) hoặc "Tải tài liệu" (file ngoài)
function usrdActionButton(doc) {
  const isArticle = doc.format === "Bài viết" && doc.content.trim() !== "";
  if (isArticle) {
    return `<a class="save-btn" href="bai-viet.html?slug=${encodeURIComponent(doc.slug)}">Đọc bài viết →</a>`;
  }
  return `<a class="save-btn" href="${doc.fileLink}" target="_blank" rel="noopener">Tải tài liệu ↗</a>`;
}
