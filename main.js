/* ===================================================
   RR2026 — Main JS  (multi-page edition)
   =================================================== */

/* ── Multi-page navigation ── */
function goTo(page) {
  window.location.href = page + '.html';
}

/* ── Day tabs (program page only) ── */
function showDay(d) {
  document.querySelectorAll('.day-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.day-tab').forEach(el => el.classList.remove('active'));
  const c = document.getElementById('day-' + d);
  if (c) c.classList.add('active');
  const tabs = document.querySelectorAll('.day-tab');
  if (tabs[d - 1]) tabs[d - 1].classList.add('active');
}

/* ── Countdown (home page) ── */
function updateCountdown() {
  const target = new Date('2026-06-29T08:30:00+08:00');
  const diff   = target - new Date();
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  if (diff <= 0) {
    set('cd-d','0'); set('cd-h','00'); set('cd-m','00'); set('cd-s','00'); return;
  }
  set('cd-d', Math.floor(diff / 86400000));
  set('cd-h', String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0'));
  set('cd-m', String(Math.floor((diff % 3600000)  /   60000)).padStart(2,'0'));
  set('cd-s', String(Math.floor((diff %   60000)  /    1000)).padStart(2,'0'));
}

/* ── Registration form ── */
function initRegForm() {
  const rf = document.getElementById('reg-form');
  if (!rf) return;
  rf.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('reg-btn');
    if (btn) { btn.textContent = 'Submitted ✓'; btn.disabled = true; btn.style.background = '#3a8a5c'; }
    alert('Thank you for registering!\n\nWe will send payment instructions and confirmation to your email within 3 working days.\n\nQueries: rr2026@unud.ac.id');
  });
}

/* ── Contact form ── */
function initContactForm() {
  const cf = document.getElementById('contact-form');
  if (!cf) return;
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('contact-btn');
    if (btn) { btn.textContent = 'Sent ✓'; btn.disabled = true; btn.style.background = '#3a8a5c'; }
    alert('Message sent!\n\nWe will reply within 3 working days.');
  });
}

/* ── Mark active nav link based on current page ── */
function markActiveNav() {
  const page = window.location.pathname.split('/').pop().replace('.html','') || 'index';
  const map = { 'index': 'home', 'home': 'home' };
  const id = map[page] || page;
  const link = document.querySelector('.nav-links a[data-page="' + id + '"]');
  if (link) link.classList.add('active');
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', function () {
  markActiveNav();
  if (document.getElementById('cd-d')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  initRegForm();
  initContactForm();
});
