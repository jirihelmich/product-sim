const ScoringView = {
  render(el) {
    const features = [
      { id: 'qr_pairing', name: 'QR Code Device Pairing', desc: 'Replace Bluetooth pairing with QR scan for faster device setup', segment: 'All users', requests: 230, metric: 'Activation rate', effort: 'Medium' },
      { id: 'smart_zones', name: 'Smart Zone Auto-Detection', desc: 'Automatically suggest security zones based on device placement', segment: 'Residential', requests: 85, metric: 'Onboarding completion', effort: 'Large' },
      { id: 'push_alerts', name: 'Real-time Push Alerts', desc: 'Push notifications for alarm events instead of email-only', segment: 'All users', requests: 410, metric: 'Week-4 retention', effort: 'Small' },
      { id: 'installer_dash', name: 'Installer Dashboard', desc: 'Bulk device management and customer overview for professional installers', segment: 'Enterprise', requests: 45, metric: 'Enterprise churn', effort: 'Large' },
      { id: 'video_verify', name: 'Video Alarm Verification', desc: 'Let users verify alarms via camera feed before dispatching security', segment: 'Commercial', requests: 160, metric: 'False alarm rate', effort: 'Medium' }
    ];

    el.innerHTML = `
      <div class="section-header">
        <h2>ICE / RICE Scoring</h2>
        <p class="subtitle">Score each feature on Impact, Confidence, and Ease (1-10). The tool calculates the prioritized ranking.</p>
      </div>

      <div style="overflow-x:auto;" class="mt-lg">
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <thead>
            <tr style="background:var(--c-purple);color:white;font-family:'Plus Jakarta Sans',sans-serif;">
              <th style="padding:12px;text-align:left;border-radius:var(--radius) 0 0 0;">Feature</th>
              <th style="padding:12px;text-align:center;width:80px;">Impact</th>
              <th style="padding:12px;text-align:center;width:80px;">Confidence</th>
              <th style="padding:12px;text-align:center;width:80px;">Ease</th>
              <th style="padding:12px;text-align:center;width:100px;border-radius:0 var(--radius) 0 0;">ICE Score</th>
            </tr>
          </thead>
          <tbody>
            ${features.map((f, i) => `
              <tr style="background:${i % 2 ? 'var(--c-lavender)' : 'white'};">
                <td style="padding:12px;">
                  <strong>${f.name}</strong><br>
                  <span class="text-muted" style="font-size:0.8rem;">${f.desc}</span><br>
                  <span class="font-mono text-muted" style="font-size:0.7rem;">${f.segment} · ${f.requests} requests · ${f.effort} effort · Moves: ${f.metric}</span>
                </td>
                <td style="padding:12px;text-align:center;"><input type="number" min="1" max="10" class="score-input" data-id="${f.id}" data-dim="impact" style="width:50px;text-align:center;padding:6px;border:1px solid var(--c-muted);border-radius:4px;font-size:1rem;"></td>
                <td style="padding:12px;text-align:center;"><input type="number" min="1" max="10" class="score-input" data-id="${f.id}" data-dim="confidence" style="width:50px;text-align:center;padding:6px;border:1px solid var(--c-muted);border-radius:4px;font-size:1rem;"></td>
                <td style="padding:12px;text-align:center;"><input type="number" min="1" max="10" class="score-input" data-id="${f.id}" data-dim="ease" style="width:50px;text-align:center;padding:6px;border:1px solid var(--c-muted);border-radius:4px;font-size:1rem;"></td>
                <td style="padding:12px;text-align:center;font-weight:700;font-size:1.2rem;" id="ice-${f.id}">—</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div id="ranking" class="mt-xl"></div>
    `;

    // Auto-calculate ICE on input
    el.querySelectorAll('.score-input').forEach(input => {
      input.addEventListener('input', () => this._recalculate(el, features));
      input.addEventListener('keydown', e => e.stopPropagation()); // prevent reveal.js capturing
    });
  },

  _recalculate(el, features) {
    const scores = {};
    features.forEach(f => {
      const i = parseInt(el.querySelector(`[data-id="${f.id}"][data-dim="impact"]`).value) || 0;
      const c = parseInt(el.querySelector(`[data-id="${f.id}"][data-dim="confidence"]`).value) || 0;
      const e = parseInt(el.querySelector(`[data-id="${f.id}"][data-dim="ease"]`).value) || 0;
      const ice = i * c * e;
      scores[f.id] = { name: f.name, impact: i, confidence: c, ease: e, ice };
      el.querySelector(`#ice-${f.id}`).textContent = ice > 0 ? ice : '—';
      el.querySelector(`#ice-${f.id}`).style.color = ice > 0 ? 'var(--c-purple)' : 'var(--c-muted)';
    });

    // Show ranking if all scored
    const scored = Object.values(scores).filter(s => s.ice > 0);
    const ranking = el.querySelector('#ranking');
    if (scored.length === features.length) {
      const sorted = scored.sort((a, b) => b.ice - a.ice);
      ranking.innerHTML = `
        <h3 class="mb-md">Your Prioritized Ranking</h3>
        <div class="leaderboard">
          ${sorted.map((s, i) => `
            <div class="leaderboard-row ${i === 0 ? 'first' : ''}">
              <div class="leaderboard-rank">#${i + 1}</div>
              <div class="leaderboard-team">${s.name}</div>
              <div class="leaderboard-score">ICE: ${s.ice}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      ranking.innerHTML = '<p class="text-muted text-center">Score all features to see the ranking</p>';
    }
  }
};
