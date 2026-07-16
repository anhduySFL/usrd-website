// ============================================================
// KHI CẦN ĐỔI SHEET: chỉ cần thay link bên dưới, mọi trang sẽ tự cập nhật
// ============================================================
const USRD_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS5NRCDx09z-zz3JFcjlxGURDzkD3paOuDIVNQbiNa0cbnhdiEUblQnSqjf8PfuVDgXFhnR9HQNqK5_/pub?gid=1778908273&single=true&output=csv";

// Parse 1 dòng CSV, có xử lý trường hợp mô tả chứa dấu phẩy trong ngoặc kép ("...")
function parseCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === "," && !inQuotes) {
      result.push(cur); cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim() !== "");
  const headers = parseCsvLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || "").trim(); });
    return row;
  });
}

// Chuẩn hóa tên cột tiếng Việt trong Sheet -> tên field dùng trong code
function normalizeDoc(row) {
  return {
    title: row["Tên"] || "",
    type: row["Loại"] || "",
    author: row["Tác giả"] || "",
    desc: row["Mô tả"] || "",
    fileLink: row["Link file"] || "#",
    status: row["Trạng thái"] || ""
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
