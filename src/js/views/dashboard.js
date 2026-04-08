const DashboardView = {
  _activeTab: 'overview',

  render(el) {
    const round = State.get('round') || 1;
    const metrics = Dataset.getMetrics(round - 1, State.getPath());
    if (!metrics) {
      el.innerHTML = '<div class="center-message"><h2>No data available</h2></div>';
      return;
    }

    const tabs = ['overview', 'funnel', 'cohort', 'segments'];
    const activeTab = this._activeTab;

    el.innerHTML = `
      <div class="section-header">
        <h2>${Dataset.data.product} Dashboard</h2>
        <p class="subtitle">${Dataset.data.description}</p>
      </div>
      <div class="dash-tabs mb-lg">
        ${tabs.map(t => `<button class="dash-tab ${t === activeTab ? 'active' : ''}" data-tab="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join('')}
      </div>
      <div id="dash-content"></div>
    `;

    el.querySelectorAll('.dash-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        DashboardView._activeTab = btn.dataset.tab;
        DashboardView.render(el);
      });
    });

    const content = el.querySelector('#dash-content');
    this['_render_' + activeTab](content, metrics);
  },

  _render_overview(el, m) {
    const kpis = m.kpis;
    el.innerHTML = `
      <div class="kpi-grid">
        ${Object.values(kpis).map(k => `
          <div class="kpi-card">
            <div class="kpi-label">${k.label}</div>
            <div class="kpi-value">${DashboardView._fmt(k)}</div>
            <div class="kpi-delta ${DashboardView._deltaDir(k)}">${k.delta}</div>
            ${k.trend ? `<div class="sparkline mt-sm">${DashboardView._spark(k.trend)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  },

  _render_funnel(el, m) {
    const f = m.funnel;
    if (!f) { el.innerHTML = '<p class="text-muted">No funnel data</p>'; return; }
    el.innerHTML = `
      <div class="card" style="padding:var(--space-xl);">
        <h3 class="mb-lg">Onboarding Funnel</h3>
        <div class="funnel">
          ${f.steps.map((s, i) => {
            const drop = i > 0 ? f.steps[i-1].value - s.value : 0;
            return `<div class="funnel-step">
              <div class="funnel-label">${s.label}</div>
              <div class="funnel-bar" style="width:${s.value}%;background:${s.value >= 50 ? 'var(--c-purple)' : s.value >= 30 ? 'var(--c-orange)' : 'var(--c-red)'};">${s.value}%</div>
              <div class="funnel-pct">${s.count.toLocaleString()} users ${drop > 0 ? `<span class="text-red">-${drop}pp</span>` : ''}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  _render_cohort(el, m) {
    const c = m.cohorts;
    if (!c) { el.innerHTML = '<p class="text-muted">No cohort data</p>'; return; }
    el.innerHTML = `
      <div class="card" style="padding:var(--space-xl);overflow-x:auto;">
        <h3 class="mb-lg">Cohort Retention</h3>
        <div class="cohort-grid" style="grid-template-columns:100px repeat(${c.weeks.length},1fr);">
          <div class="cohort-header"></div>
          ${c.weeks.map(w => `<div class="cohort-header">${w}</div>`).join('')}
          ${c.data.map(row => `
            <div class="cohort-header" style="text-align:left;font-size:0.75rem;">${row.label}</div>
            ${row.values.map(v => `<div class="cohort-cell" style="background:${v !== null ? DashboardView._cohortBg(v) : 'transparent'};color:${v !== null && v > 50 ? '#fff' : 'var(--c-dark)'};">${v !== null ? v + '%' : ''}</div>`).join('')}
          `).join('')}
        </div>
        <p class="mt-md text-muted font-mono" style="font-size:0.75rem;">Retention % by week since sign-up</p>
      </div>
    `;
  },

  _render_segments(el, m) {
    const segs = m.segments;
    if (!segs) { el.innerHTML = '<p class="text-muted">No segment data</p>'; return; }
    el.innerHTML = `
      <div class="grid-3">
        ${Object.entries(segs).map(([k, s]) => `
          <div class="card ${s.churn > 4.5 ? 'red' : s.churn > 3.5 ? 'orange' : 'green'}">
            <h3>${s.label}</h3>
            <div class="mt-md" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);">
              ${[['MAU', s.mau.toLocaleString()], ['Activation', s.activation + '%'], ['Churn', s.churn + '%'], ['NPS', s.nps]].map(([lbl, val]) => `
                <div>
                  <div class="kpi-label" style="font-size:0.7rem;">${lbl}</div>
                  <div style="font-size:1.3rem;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;">${val}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _fmt(k) {
    if (k.format === 'eur') return '€' + (k.value / 1000).toFixed(0) + 'K';
    if (k.format === 'pct') return k.value + '%';
    return k.value >= 1000 ? (k.value / 1000).toFixed(1) + 'K' : k.value;
  },

  _deltaDir(k) {
    if (k.deltaDir === 'down') return 'down';
    return k.delta?.startsWith('+') ? 'up' : k.delta?.startsWith('-') ? 'down' : 'neutral';
  },

  _spark(data, w = 120, h = 32) {
    if (!data || data.length < 2) return '';
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const sx = w / (data.length - 1);
    const pts = data.map((v, i) => `${i * sx},${h - ((v - min) / range) * h}`).join(' ');
    const ly = h - ((data[data.length - 1] - min) / range) * h;
    const c = data[data.length - 1] >= data[0] ? '#5B9E5B' : '#E03131';
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><circle cx="${w}" cy="${ly}" r="3" fill="${c}"/></svg>`;
  },

  _cohortBg(v) {
    if (v >= 60) return 'rgba(91,158,91,0.7)';
    if (v >= 40) return 'rgba(91,158,91,0.4)';
    if (v >= 25) return 'rgba(248,176,52,0.4)';
    return 'rgba(224,49,49,0.3)';
  }
};
