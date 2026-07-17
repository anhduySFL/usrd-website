function usrdHeader(active) {
  const items = [
    ["index.html", "Trang chủ"],
    ["tra-cuu.html", "Tra cứu"],
    ["danh-muc.html", "Danh mục"],
    ["de-xuat.html", "Đề xuất"],
    ["doc-sau.html", "Đọc sau"]
  ];
  const links = items.map(([href, label]) => {
    const cls = href === active ? "active" : "";
    return `<a href="${href}" class="${cls}">${label}</a>`;
  }).join("");
  return `
  <header class="site-header">
    <div class="wrap">
      <a href="index.html" class="brand">
        <span class="brand-name">uSRD</span>
        <span class="brand-desc">Kho tàng học liệu sinh viên</span>
      </a>
      <nav class="main-nav">${links}</nav>
      <div class="header-actions">
        <a href="#">Trợ giúp</a>
        <a href="#" class="account-btn">Tài khoản</a>
      </div>
    </div>
  </header>`;
}

function usrdFooter() {
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-cols">

        <!-- Cột 1: Giới thiệu -->
        <div>
          <span class="brand-name">uSRD</span>
          <p>University Science Research Documentary — Kho tàng học liệu sinh viên, chia sẻ tài liệu học tập và nghiên cứu khoa học.</p>
        </div>

        <!-- Cột 2: Liên hệ -->
        <div class="footer-col">
          <h4>Liên hệ</h4>
          <p style="font-size:12px;color:#999;margin-bottom:4px;">Anh Duy Doan</p>
          <a href="mailto:duyanhdoan012@gmail.com">duyanhdoan012@gmail.com</a>
        </div>

        <!-- Cột 3: Góp ý & Báo lỗi (form inline) -->
        <div class="footer-col footer-col--feedback">
          <h4>Góp ý & Báo lỗi</h4>
          <div class="footer-feedback-tabs">
            <button class="ftab active" data-type="Góp ý">Góp ý</button>
            <button class="ftab" data-type="Báo lỗi">Báo lỗi</button>
          </div>
          <div class="footer-feedback-form">
            <textarea id="footerFeedbackText" placeholder="Nhập nội dung..." rows="3"></textarea>
            <button class="footer-send-btn" id="footerSendBtn">Gửi</button>
          </div>
          <p class="footer-feedback-note" id="footerFeedbackNote"></p>
        </div>

        <!-- Cột 4: Về chúng tôi -->
        <div class="footer-col">
          <h4>Về chúng tôi</h4>
          <a href="#">Giới thiệu</a>
          <a href="#">Điều khoản</a>
          <a href="#">Chính sách bảo mật</a>
        </div>

        <!-- Cột 5: Kết nối -->
        <div class="footer-col">
          <h4>Kết nối</h4>
          <a href="#">Facebook</a>
          <a href="#">Github</a>
          <a href="mailto:duyanhdoan012@gmail.com">Email</a>
        </div>

      </div>
      <p class="copyright">© 2026 uSRD — University Science Research Documentary. All rights reserved.</p>
    </div>
  </footer>`;
}

// Khởi tạo logic cho form góp ý/báo lỗi trong footer
function initFooterFeedback() {
  const tabs = document.querySelectorAll(".ftab");
  const textarea = document.getElementById("footerFeedbackText");
  const sendBtn = document.getElementById("footerSendBtn");
  const note = document.getElementById("footerFeedbackNote");
  if (!tabs.length || !textarea || !sendBtn) return;

  let currentType = "Góp ý";

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentType = tab.dataset.type;
      textarea.placeholder = currentType === "Báo lỗi"
        ? "Mô tả lỗi bạn gặp phải..."
        : "Nhập góp ý của bạn...";
      note.textContent = "";
    });
  });

  sendBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) {
      note.textContent = "Vui lòng nhập nội dung trước khi gửi.";
      note.style.color = "#e57373";
      return;
    }
    // Mở mailto với nội dung đã điền
    const subject = encodeURIComponent(`[uSRD] ${currentType}`);
    const body = encodeURIComponent(text);
    window.location.href = `mailto:duyanhdoan012@gmail.com?subject=${subject}&body=${body}`;

    note.textContent = "Đang mở ứng dụng email của bạn...";
    note.style.color = "#81c784";
    textarea.value = "";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const headerSlot = document.getElementById("usrd-header");
  const footerSlot = document.getElementById("usrd-footer");
  if (headerSlot) headerSlot.outerHTML = usrdHeader(headerSlot.dataset.active || "index.html");
  if (footerSlot) footerSlot.outerHTML = usrdFooter();
  initFooterFeedback();
});
