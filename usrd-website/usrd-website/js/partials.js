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
        <div>
          <span class="brand-name">uSRD</span>
          <p>University Science Research Documentary — Kho tàng học liệu sinh viên, chia sẻ tài liệu học tập và nghiên cứu khoa học.</p>
        </div>
        <div class="footer-col">
          <h4>Liên hệ</h4>
          <a href="mailto:contact@usrd.vn">contact@usrd.vn</a>
          <a href="tel:0123456789">0123 456 789</a>
        </div>
        <div class="footer-col">
          <h4>Góp ý</h4>
          <a href="#">Gửi góp ý</a>
          <a href="#">Báo lỗi</a>
        </div>
        <div class="footer-col">
          <h4>Về chúng tôi</h4>
          <a href="#">Giới thiệu</a>
          <a href="#">Điều khoản</a>
          <a href="#">Chính sách bảo mật</a>
        </div>
        <div class="footer-col">
          <h4>Kết nối</h4>
          <a href="#">Facebook</a>
          <a href="#">Github</a>
          <a href="#">Email</a>
        </div>
      </div>
      <p class="copyright">© 2026 uSRD — University Science Research Documentary. All rights reserved.</p>
    </div>
  </footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const headerSlot = document.getElementById("usrd-header");
  const footerSlot = document.getElementById("usrd-footer");
  if (headerSlot) headerSlot.outerHTML = usrdHeader(headerSlot.dataset.active || "index.html");
  if (footerSlot) footerSlot.outerHTML = usrdFooter();
});
