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

// ============================================================
// HỆ THỐNG "KHỐI NỘI DUNG" (khuyến nghị dùng cho bài có ảnh/video)
// Đọc từ 1 tab Sheet riêng tên "Khối nội dung", mỗi hàng là 1 khối
// (tiêu đề / đoạn văn / danh sách / trích dẫn / ảnh / video), khớp
// với bài viết qua đúng tên ở cột "Tên bài viết" (phải trùng khớp
// tuyệt đối với cột "Tên" ở tab dữ liệu chính).
//
// Nếu 1 bài chưa có khối nội dung nào (chưa tạo tab, hoặc để trống
// TRIVAN_BLOCKS_CSV_URL bên dưới), web tự động dùng lại nội dung ở
// cột "Nội dung" của tab chính (usrdRenderContent) như trước — không
// bài viết cũ nào bị hỏng khi nâng cấp.
// ============================================================

// Dán link CSV đã publish của tab "Khối nội dung" vào đây. Để trống ("")
// nếu chưa tạo tab này — web sẽ tự bỏ qua và dùng cột "Nội dung" như cũ.
const TRIVAN_BLOCKS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS5NRCDx09z-zz3JFcjlxGURDzkD3paOuDIVNQbiNa0cbnhdiEUblQnSqjf8PfuVDgXFhnR9HQNqK5_/pub?gid=383718808&single=true&output=csv";

// Tải toàn bộ khối nội dung (tất cả bài viết). Không lỗi nếu chưa cấu hình hoặc chưa publish.
async function usrdLoadContentBlocks() {
  if (!TRIVAN_BLOCKS_CSV_URL.trim()) return [];
  try {
    const res = await fetch(TRIVAN_BLOCKS_CSV_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Không tải được tab Khối nội dung");
    const text = await res.text();
    return parseCsv(text);
  } catch (err) {
    console.error("Tri Vân: lỗi tải khối nội dung", err);
    return [];
  }
}

// Lọc + sắp xếp khối thuộc đúng 1 bài viết (so khớp không phân biệt hoa/thường, khoảng trắng thừa)
function usrdBlocksForTitle(allBlocks, title) {
  const norm = s => (s || "").trim().toLowerCase();
  return allBlocks
    .filter(r => norm(r["Tên bài viết"]) === norm(title))
    .filter(r => norm(r["Trạng thái"]) !== "ẩn")
    .sort((a, b) => (Number(a["Thứ tự"]) || 0) - (Number(b["Thứ tự"]) || 0));
}

// Nhận diện link Vimeo -> trả về link nhúng, hoặc null nếu không phải Vimeo
function usrdVimeoEmbedUrl(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

// Sinh HTML cho 1 khối ảnh có chú thích (dùng cho hệ Khối nội dung — khác usrdImageEmbedHtml vì có figcaption)
function usrdBlockImageHtml(url, caption, alt) {
  if (!url) return "";
  const figcaption = caption ? `<figcaption>${usrdInlineFormat(caption)}</figcaption>` : "";
  return `<figure class="media-embed"><img src="${usrdEscapeHtml(url.trim())}" alt="${usrdEscapeHtml(alt || "")}" loading="lazy">${figcaption}</figure>`;
}

// Sinh HTML cho 1 khối video (YouTube hoặc Vimeo) có chú thích
function usrdBlockVideoHtml(url, caption) {
  if (!url) return "";
  const trimmed = url.trim();
  const yt = usrdYouTubeEmbedUrl(trimmed);
  const vimeo = !yt ? usrdVimeoEmbedUrl(trimmed) : null;
  const src = yt || vimeo;
  const figcaption = caption ? `<figcaption>${usrdInlineFormat(caption)}</figcaption>` : "";
  if (!src) {
    // Không nhận diện được YouTube/Vimeo -> phát trực tiếp như file video thường (an toàn, không render HTML thô)
    return `<figure class="media-embed"><video controls src="${usrdEscapeHtml(trimmed)}"></video>${figcaption}</figure>`;
  }
  return `<figure class="media-embed"><iframe src="${usrdEscapeHtml(src)}" title="Video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>${figcaption}</figure>`;
}

// Dựng HTML hoàn chỉnh từ danh sách khối đã lọc sẵn cho 1 bài viết
// docTitle dùng để tự bỏ khối "heading" đầu tiên nếu nó lặp lại đúng tiêu đề bài (tránh hiện tiêu đề 2 lần)
function usrdRenderBlocks(blocks, docTitle) {
  let html = "";
  blocks.forEach((b, i) => {
    const type = (b["Loại khối"] || "").trim().toLowerCase();
    const content = b["Nội dung"] || "";
    const media = b["URL media"] || "";
    const caption = b["Chú thích"] || "";
    const alt = b["Alt"] || "";

    if (type === "heading") {
      if (i === 0 && content.trim().toLowerCase() === (docTitle || "").trim().toLowerCase()) return; // tránh lặp H1
      html += `<h2>${usrdInlineFormat(content)}</h2>`;
    } else if (type === "paragraph") {
      html += `<p>${usrdInlineFormat(content)}</p>`;
    } else if (type === "list") {
      const items = content.split("\n").map(s => s.trim()).filter(Boolean);
      html += `<ul>${items.map(li => `<li>${usrdInlineFormat(li)}</li>`).join("")}</ul>`;
    } else if (type === "quote") {
      html += `<blockquote>${usrdInlineFormat(content)}</blockquote>`;
    } else if (type === "image") {
      html += usrdBlockImageHtml(media, caption, alt);
    } else if (type === "video-youtube" || type === "video-vimeo" || type === "video") {
      html += usrdBlockVideoHtml(media, caption);
    }
    // Loại khối không nhận diện được -> bỏ qua an toàn, không render HTML thô từ Sheet
  });
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
