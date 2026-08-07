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
    image: row["Ảnh"] || row["Ảnh bìa"] || "",
    video: row["Video"] || row["Video bìa"] || "",
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
    console.error("Tri Vân: lỗi tải dữ liệu tài liệu", err);
    return [];
  }
}

// ============================================================
// XỬ LÝ ĐỊNH DẠNG NỘI DUNG (cột "Nội dung" trong Sheet)
// Vì Google Sheet xuất ra CSV chỉ là văn bản thuần (không giữ được
// chữ đậm/nghiêng/canh lề khi copy-paste), các hàm dưới đây cho phép
// gõ vài ký hiệu đơn giản trong ô "Nội dung" để web tự hiển thị đẹp:
//
//   - Xuống dòng (Alt+Enter trong Sheet)  → mỗi dòng là 1 đoạn văn mới
//   - Dòng bắt đầu bằng "- "              → gộp thành danh sách gạch đầu dòng
//   - **chữ**                              → in đậm
//   - *chữ*                                → in nghiêng
//   - [anh: link-ảnh]                      → chèn ảnh ngay vị trí đó
//   - [video: link-video]                  → chèn video (hỗ trợ link YouTube
//                                             hoặc link video .mp4 trực tiếp)
// ============================================================

function usrdEscapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// In đậm/nghiêng trong 1 dòng văn bản
function usrdInlineFormat(text) {
  let html = usrdEscapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return html;
}

// Nhận diện link YouTube (mọi định dạng) -> trả về link nhúng, hoặc null nếu không phải YouTube
function usrdYouTubeEmbedUrl(url) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// Sinh HTML cho 1 khối video (tự nhận diện YouTube hay link video thường)
function usrdVideoEmbedHtml(url) {
  const trimmed = url.trim();
  const yt = usrdYouTubeEmbedUrl(trimmed);
  if (yt) {
    return `<div class="media-embed"><iframe src="${usrdEscapeHtml(yt)}" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  return `<div class="media-embed"><video controls src="${usrdEscapeHtml(trimmed)}"></video></div>`;
}

// Sinh HTML cho 1 khối ảnh
function usrdImageEmbedHtml(url) {
  return `<div class="media-embed"><img src="${usrdEscapeHtml(url.trim())}" alt="" loading="lazy"></div>`;
}

// Hàm chính: chuyển nội dung thô từ Sheet -> HTML hoàn chỉnh cho trang bài viết
function usrdRenderContent(raw) {
  if (!raw || !raw.trim()) return "";
  const lines = raw.split("\n");
  let html = "";
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length) {
      html += `<ul>${listBuffer.map(li => `<li>${usrdInlineFormat(li)}</li>`).join("")}</ul>`;
      listBuffer = [];
    }
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) { flushList(); return; }

    const imgMatch = line.match(/^\[\s*(?:anh|ảnh|image|img)\s*:\s*(.+?)\s*\]$/i);
    const vidMatch = line.match(/^\[\s*video\s*:\s*(.+?)\s*\]$/i);

    if (imgMatch) { flushList(); html += usrdImageEmbedHtml(imgMatch[1]); return; }
    if (vidMatch) { flushList(); html += usrdVideoEmbedHtml(vidMatch[1]); return; }

    if (/^[-*]\s+/.test(line)) {
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    flushList();
    html += `<p>${usrdInlineFormat(line)}</p>`;
  });
  flushList();
  return html;
}

// Sinh HTML cho ảnh đại diện (thumbnail) của doc-card, dùng ở nhiều trang.
// Trả về chuỗi rỗng nếu tài liệu không có ảnh -> layout tự động không chừa khoảng trống thừa.
function usrdThumbnailHtml(doc, cssClass) {
  if (!doc.image) return "";
  return `<div class="${cssClass}"><img src="${usrdEscapeHtml(doc.image)}" alt="" loading="lazy"></div>`;
}

// Sinh HTML cho nút hành động
// - Chỉ có nội dung web → "Đọc bài viết →"
// - Chỉ có link file → "Tải tài liệu ↗"
// - Có cả hai → hiện cả 2 nút
function usrdActionButton(doc) {
  const isArticle = doc.format === "Bài viết" && doc.content.trim() !== "";
  const hasFile = doc.fileLink && doc.fileLink !== "#" && doc.fileLink.startsWith("http");

  const btnArticle = `<a class="save-btn" href="bai-viet.html?slug=${encodeURIComponent(doc.slug)}">Đọc bài viết →</a>`;
  const btnFile = `<a class="save-btn" href="${doc.fileLink}" target="_blank" rel="noopener" style="margin-left:8px;">Tải tài liệu ↗</a>`;

  if (isArticle && hasFile) return btnArticle + btnFile;
  if (isArticle) return btnArticle;
  if (hasFile) return btnFile;
  return "";
}
