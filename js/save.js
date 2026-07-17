// ============================================================
// uSRD Save System — dùng localStorage để lưu danh sách đọc sau
// Include file này vào bất kỳ trang nào cần nút Lưu
// ============================================================

function usrdGetSaved() {
  try { return JSON.parse(localStorage.getItem("usrd_saved") || "[]"); }
  catch { return []; }
}

function usrdIsSaved(slug) {
  return usrdGetSaved().includes(slug);
}

function usrdToggleSave(slug, btn) {
  let saved = usrdGetSaved();
  if (saved.includes(slug)) {
    saved = saved.filter(s => s !== slug);
    localStorage.setItem("usrd_saved", JSON.stringify(saved));
    if (btn) { btn.textContent = "☆ Lưu"; btn.classList.remove("saved"); }
  } else {
    saved.push(slug);
    localStorage.setItem("usrd_saved", JSON.stringify(saved));
    if (btn) { btn.textContent = "★ Đã lưu"; btn.classList.add("saved"); }
  }
}

// Sinh HTML nút Lưu — dùng trong mọi card
function usrdSaveButton(doc) {
  const isSaved = usrdIsSaved(doc.slug);
  return `<button
    class="save-btn save-toggle-btn ${isSaved ? "saved" : ""}"
    onclick="usrdToggleSave('${doc.slug}', this)"
  >${isSaved ? "★ Đã lưu" : "☆ Lưu"}</button>`;
}
