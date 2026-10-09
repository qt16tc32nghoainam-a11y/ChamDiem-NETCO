/* Simple role-based UI login for the contest app. */
(function () {
  const AUTH_KEY = 'netco_current_user';
  const USERS = [
    { id: 'mai-duc-lam', name: 'Ông Mai Đức Lâm', role: 'judge' },
    { id: 'nguyen-thi-suong', name: 'Bà Nguyễn Thị Sương', role: 'judge' },
    { id: 'ngo-thi-quynh-nhu', name: 'Bà Ngô Thị Quỳnh Như', role: 'judge' },
    { id: 'phan-hoang-trung-hieu', name: 'Ông Phan Hoàng Trung Hiếu', role: 'judge' },
    { id: 'pham-duc-truong', name: 'Ông Phạm Đức Trường', role: 'admin' },
    { id: 'luu-thi-thu-hien', name: 'Bà Lưu Thị Thu Hiền', role: 'admin' }
  ];

  function currentUser() {
    try {
      const saved = sessionStorage.getItem(AUTH_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  }

  function isAdmin() {
    const user = currentUser();
    return Boolean(user && user.role === 'admin');
  }

  function isResultsPage() {
    const path = window.location.pathname.toLowerCase();
    return path.includes('tong-hop');
  }

  function login(user) {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.location.reload();
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = isResultsPage() ? 'index.html' : window.location.href;
  }

  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .auth-bar{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin:10px 0 0;color:#6b7280;font-size:13px;font-weight:600;}
      .auth-bar strong{color:#1f2937;}
      .auth-role{background:#fef2f2;color:#b91c1c;border-radius:999px;padding:4px 9px;font-size:11px;}
      .auth-logout{border:1px solid #e5e7eb;background:#fff;color:#6b7280;border-radius:9px;padding:6px 10px;cursor:pointer;font-family:inherit;font-weight:700;}
      .auth-logout:hover{border-color:#b91c1c;color:#b91c1c;}
      .auth-overlay{position:fixed;inset:0;z-index:9999;background:linear-gradient(135deg,#7f1d1d,#b91c1c);display:flex;align-items:center;justify-content:center;padding:18px;}
      .auth-card{width:min(500px,100%);background:#fff;border-radius:22px;padding:28px 22px;box-shadow:0 24px 80px rgba(0,0,0,.3);}
      .auth-brand{text-align:center;color:#b91c1c;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;}
      .auth-card h1{text-align:center;margin:12px 0 5px;font-size:25px;color:#1f2937;}
      .auth-card p{text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;}
      .auth-users{display:grid;gap:9px;}
      .auth-user{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border:1.5px solid #e5e7eb;border-radius:13px;background:#fff;color:#1f2937;text-align:left;cursor:pointer;font-family:inherit;font-size:15px;font-weight:700;transition:.15s;}
      .auth-user:hover{border-color:#b91c1c;background:#fef2f2;transform:translateY(-1px);}
      .auth-avatar{width:35px;height:35px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:#fef2f2;color:#b91c1c;font-size:14px;font-weight:800;flex-shrink:0;}
      .auth-user.admin{border-color:#d4af37;background:#fffdf5;}
      .auth-user.admin .auth-avatar{background:#d4af37;color:#fff;}
      .auth-admin-badge{margin-left:auto;color:#a16207;background:#fef3c7;border-radius:999px;padding:4px 8px;font-size:10px;font-weight:800;}
      .auth-note{text-align:center;color:#9ca3af;font-size:11px;margin-top:18px;line-height:1.5;}
      @media(max-width:560px){.auth-bar{justify-content:center;flex-wrap:wrap;}.auth-card{padding:24px 16px;}}
    `;
    document.head.appendChild(style);
  }

  function initials(name) {
    return name.replace(/^(Ông|Bà)\s+/i, '').split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  }

  function showLogin() {
    if (document.getElementById('authOverlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'auth-overlay';
    overlay.id = 'authOverlay';
    overlay.innerHTML = `
      <div class="auth-card">
        <div class="auth-brand">Công đoàn Công ty Cổ phần Bột giặt NET</div>
        <h1>Đăng nhập hệ thống</h1>
        <p>Chọn tên của anh/chị để vào phiếu chấm điểm</p>
        <div class="auth-users">
          ${USERS.map(user => `
            <button class="auth-user ${user.role === 'admin' ? 'admin' : ''}" data-user-id="${user.id}">
              <span class="auth-avatar">${initials(user.name)}</span>
              <span>${user.name}</span>
              ${user.role === 'admin' ? '<span class="auth-admin-badge">QUẢN TRỊ</span>' : ''}
            </button>`).join('')}
        </div>
        <div class="auth-note">Mỗi người chọn đúng tên của mình trước khi chấm.<br>Ông Phạm Đức Trường có quyền xem tổng hợp và tải báo cáo.</div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-user-id]').forEach(button => {
      button.addEventListener('click', () => {
        const user = USERS.find(item => item.id === button.dataset.userId);
        if (user) login(user);
      });
    });
  }

  function mountUserBar() {
    const user = currentUser();
    if (!user || document.getElementById('authBar')) return;
    const wrap = document.querySelector('.wrap');
    if (!wrap) return;
    const bar = document.createElement('div');
    bar.className = 'auth-bar';
    bar.id = 'authBar';
    bar.innerHTML = `<span>Đang đăng nhập: <strong>${user.name}</strong></span><span class="auth-role">${user.role === 'admin' ? 'QUẢN TRỊ' : 'BAN GIÁM KHẢO'}</span><button class="auth-logout" type="button">Đăng xuất</button>`;
    wrap.insertBefore(bar, wrap.firstChild);
    bar.querySelector('.auth-logout').addEventListener('click', logout);
  }

  function protectPage() {
    addStyles();
    const user = currentUser();
    if (isResultsPage() && user && user.role !== 'admin') {
      window.location.replace('index.html');
      return;
    }
    if (!user) showLogin();
    else mountUserBar();
  }

  window.NETCO_AUTH = { USERS, currentUser, isAdmin, logout };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', protectPage);
  else protectPage();
})();
