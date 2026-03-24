/**
 * dashboard.js — DL Command Center Analytics Dashboard
 * Requires auth.js to be loaded first.
 */

// ── LAYER 2: Session gate — must be FIRST LINE ─────────────────
if (!window.DLAuth?.validateSession()) {
  window.location.replace('index.html');
}

(function () {
  'use strict';

  // ── PLAUSIBLE API CONFIG ───────────────────────────────────────
  const PLAUSIBLE_CONFIG = {
    siteId:  'damarcuslett.github.io',
    apiKey:  'YOUR_PLAUSIBLE_API_KEY',  // Replace after signing up at plausible.io
    baseUrl: 'https://plausible.io/api/v1'
  };

  let usingMockData = false;

  // ── AUTO-LOGOUT CHECK (every 60 seconds) ──────────────────────
  setInterval(() => {
    if (!window.DLAuth.validateSession()) {
      window.location.replace('index.html?reason=expired');
    }
  }, 60000);

  // ── CHART.JS DEFAULTS ─────────────────────────────────────────
  function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color        = '#94A3B8';
    Chart.defaults.borderColor  = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family  = "'DM Sans', sans-serif";
  }

  // ── LIVE CLOCK ────────────────────────────────────────────────
  function initClock() {
    const el = document.getElementById('topbar-clock');
    if (!el) return;
    function tick() {
      const now = new Date();
      const d   = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const t   = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      el.textContent = `${d}  ·  ${t}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  // ── SESSION TIMER ─────────────────────────────────────────────
  function initSessionTimer() {
    const el = document.getElementById('session-timer');
    if (!el) return;
    function tick() {
      const rem = window.DLAuth.getSessionRemaining();
      el.textContent = `Session: ${rem.label}`;
      el.className = 'session-timer';
      if (rem.h === 0 && rem.m < 30) el.classList.add('warn-low');
      if (rem.h === 0 && rem.m < 10) el.classList.add('warn-critical');
    }
    tick();
    setInterval(tick, 60000);
  }

  // ── LOGOUT ────────────────────────────────────────────────────
  function initLogout() {
    const btn = document.getElementById('logout-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.DLAuth.destroySession();
      showToast('Logged out successfully.', 'info');
      setTimeout(() => window.location.replace('index.html'), 600);
    });
  }

  // ── TOAST ─────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${msg}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('visible'));
    });
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ── MOCK DATA ─────────────────────────────────────────────────
  function getMockData() {
    const days = [];
    const views = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      views.push(Math.floor(40 + Math.random() * 120 + (30 - i) * 2));
    }
    return {
      totalViews:    12847,
      uniqueVisitors: 4231,
      linkedinClicks: 387,
      contactForms:   62,
      bookingClicks:  29,
      viewsChange:   '+18%',
      uniqueChange:  '+12%',
      linkedinChange:'+34%',
      contactChange: '+8%',
      bookingChange: '+22%',
      dailyLabels:   days,
      dailyData:     views,
      sources: {
        labels: ['Direct', 'LinkedIn', 'Organic Search', 'Referral', 'Other'],
        data:   [34, 28, 22, 10, 6]
      },
      topPages: [
        { path: '/',            title: 'Home',           views: 6240 },
        { path: '/#experience', title: 'Experience',     views: 2810 },
        { path: '/#skills',     title: 'Skills',         views: 1920 },
        { path: '/#content',    title: 'Content',        views: 1107 },
        { path: '/#contact',    title: 'Contact',        views:  770 }
      ],
      devices: {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        data:   [52, 38, 10]
      },
      events: [
        { type: 'linkedin',   name: 'LinkedIn Click',          time: '2 min ago' },
        { type: 'pageview',   name: 'Pageview: Home',          time: '4 min ago' },
        { type: 'contact',    name: 'Contact Form Submitted',  time: '11 min ago' },
        { type: 'pageview',   name: 'Pageview: Experience',    time: '14 min ago' },
        { type: 'newsletter', name: 'Newsletter Signup',       time: '22 min ago' },
        { type: 'linkedin',   name: 'LinkedIn Click',          time: '31 min ago' },
        { type: 'pageview',   name: 'Pageview: Skills',        time: '38 min ago' },
        { type: 'pageview',   name: 'Pageview: Home',          time: '45 min ago' },
        { type: 'contact',    name: 'Contact Form Submitted',  time: '1 hr ago' },
        { type: 'pageview',   name: 'Pageview: Content',       time: '1 hr ago' }
      ]
    };
  }

  // ── PLAUSIBLE API FETCH ───────────────────────────────────────
  async function fetchPlausibleStats() {
    if (!PLAUSIBLE_CONFIG.apiKey || PLAUSIBLE_CONFIG.apiKey === 'YOUR_PLAUSIBLE_API_KEY') {
      throw new Error('API key not configured');
    }
    const headers = { Authorization: `Bearer ${PLAUSIBLE_CONFIG.apiKey}` };
    const base    = `${PLAUSIBLE_CONFIG.baseUrl}/stats/${PLAUSIBLE_CONFIG.siteId}`;

    const [aggregate, timeseries] = await Promise.all([
      fetch(`${base}/aggregate?period=30d&metrics=visitors,pageviews`, { headers }).then(r => r.json()),
      fetch(`${base}/timeseries?period=30d&metrics=visitors`, { headers }).then(r => r.json())
    ]);

    const dailyLabels = timeseries.results.map(r =>
      new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const dailyData   = timeseries.results.map(r => r.visitors);

    return {
      totalViews:    aggregate.results.pageviews?.value ?? 0,
      uniqueVisitors: aggregate.results.visitors?.value ?? 0,
      linkedinClicks: 0,
      contactForms:   0,
      bookingClicks:  0,
      viewsChange:   '',
      uniqueChange:  '',
      linkedinChange:'',
      contactChange: '',
      bookingChange: '',
      dailyLabels,
      dailyData,
      sources: getMockData().sources,
      topPages: getMockData().topPages,
      devices:  getMockData().devices,
      events:   getMockData().events
    };
  }

  // ── HTML ESCAPE HELPER ────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── RENDER STATS ──────────────────────────────────────────────
  function renderStats(data) {
    setEl('stat-total-views',    formatNum(data.totalViews));
    setEl('stat-unique-visitors', formatNum(data.uniqueVisitors));
    setEl('stat-linkedin-clicks', formatNum(data.linkedinClicks));
    setEl('stat-contact-forms',  formatNum(data.contactForms));
    setEl('stat-bookings',       formatNum(data.bookingClicks));
    setEl('stat-logo-clicks', '—');
    setEl('stat-org-clicks',  '—');
    setChangeEl('change-views',    data.viewsChange);
    setChangeEl('change-unique',   data.uniqueChange);
    setChangeEl('change-linkedin', data.linkedinChange);
    setChangeEl('change-contact',  data.contactChange);
  }

  function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setChangeEl(id, val) {
    const el = document.getElementById(id);
    if (!el || !val) return;
    const isUp   = val.startsWith('+');
    const isDown = val.startsWith('-');
    el.className  = `stat-change ${isUp ? 'up' : isDown ? 'down' : 'flat'}`;
    el.innerHTML  = `<i class="fa-solid ${isUp ? 'fa-arrow-trend-up' : isDown ? 'fa-arrow-trend-down' : 'fa-minus'}"></i>${val} vs last period`;
  }

  function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  // ── RENDER CHARTS ─────────────────────────────────────────────
  let _lineChart   = null;
  let _donutChart  = null;
  let _deviceChart = null;

  function renderCharts(data) {
    if (typeof Chart === 'undefined') return;
    renderLineChart(data);
    renderDonutChart(data);
    renderDeviceChart(data);
  }

  function renderLineChart(data) {
    const ctx = document.getElementById('visitors-chart');
    if (!ctx) return;
    if (_lineChart) _lineChart.destroy();
    _lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.dailyLabels,
        datasets: [{
          label: 'Daily Visitors',
          data:  data.dailyData,
          borderColor:     '#2563EB',
          backgroundColor: 'rgba(37,99,235,0.08)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#60A5FA',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            borderColor: 'rgba(37,99,235,0.4)',
            borderWidth: 1,
            titleColor: '#F9FAFB',
            bodyColor: '#94A3B8',
            padding: 12
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { maxTicksLimit: 8, color: '#64748B', font: { size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748B', font: { size: 11 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  function renderDonutChart(data) {
    const ctx = document.getElementById('sources-chart');
    if (!ctx) return;
    if (_donutChart) _donutChart.destroy();
    _donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.sources.labels,
        datasets: [{
          data: data.sources.data,
          backgroundColor: [
            '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'
          ],
          borderColor: '#0A0A0F',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#94A3B8',
              font: { size: 11 },
              padding: 12,
              usePointStyle: true,
              pointStyleWidth: 8
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            borderColor: 'rgba(37,99,235,0.4)',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    });
  }

  function renderDeviceChart(data) {
    const ctx = document.getElementById('device-chart');
    if (!ctx) return;
    if (_deviceChart) _deviceChart.destroy();
    _deviceChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.devices.labels,
        datasets: [{
          label: 'Traffic %',
          data:  data.devices.data,
          backgroundColor: ['rgba(37,99,235,0.7)', 'rgba(96,165,250,0.7)', 'rgba(30,64,175,0.7)'],
          borderColor:     ['#2563EB', '#60A5FA', '#1E40AF'],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            borderColor: 'rgba(37,99,235,0.4)',
            borderWidth: 1,
            callbacks: { label: (ctx) => ` ${ctx.parsed.x}%` }
          }
        },
        scales: {
          x: {
            max: 100,
            grid:  { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#64748B', font: { size: 11 },
                     callback: v => `${v}%` }
          },
          y: {
            grid:  { display: false },
            ticks: { color: '#94A3B8', font: { size: 12 } }
          }
        }
      }
    });
  }

  // ── RENDER TOP PAGES ──────────────────────────────────────────
  function renderTopPages(data) {
    const tbody = document.getElementById('pages-table-body');
    if (!tbody) return;
    const maxViews = Math.max(...data.topPages.map(p => p.views));
    tbody.innerHTML = data.topPages.map(page => `
      <tr>
        <td>
          <div style="font-size:0.8rem;color:var(--color-text);font-weight:500;">${escapeHtml(page.title)}</div>
          <div style="font-size:0.7rem;color:var(--color-text-muted);font-family:monospace;">${escapeHtml(page.path)}</div>
        </td>
        <td>
          <div class="page-bar-wrap">
            <div class="page-bar">
              <div class="page-bar-fill" style="width:${Math.round((page.views / maxViews) * 100)}%"></div>
            </div>
            <span class="page-views">${escapeHtml(formatNum(page.views))}</span>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ── RENDER EVENT LOG ──────────────────────────────────────────
  function renderEventLog(data) {
    const log = document.getElementById('event-log');
    if (!log) return;
    log.innerHTML = data.events.map(ev => `
      <div class="event-item">
        <div class="event-dot ${escapeHtml(ev.type)}"></div>
        <div class="event-body">
          <div class="event-name">${escapeHtml(ev.name)}</div>
          <div class="event-time">${escapeHtml(ev.time)}</div>
        </div>
      </div>
    `).join('');
  }

  // ── DEMO BADGE ────────────────────────────────────────────────
  function showDemoBadge() {
    const el = document.getElementById('demo-badge');
    if (el) el.style.display = 'inline-flex';
  }

  // ── MAIN LOAD ─────────────────────────────────────────────────
  async function loadDashboard() {
    let data;
    try {
      data = await fetchPlausibleStats();
      usingMockData = false;
    } catch {
      data = getMockData();
      usingMockData = true;
      showDemoBadge();
    }

    renderStats(data);
    renderCharts(data);
    renderTopPages(data);
    renderEventLog(data);
  }

  // ── INIT ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    applyChartDefaults();
    initClock();
    initSessionTimer();
    initLogout();
    loadDashboard();
  });

})();
