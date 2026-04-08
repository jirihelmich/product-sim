const ResultsView = {
  render(el) {
    const round = State.get('round') || 1;
    const decisions = State.get('decisions') || {};
    const path = State.getPath();

    if (path.length === 0) {
      el.innerHTML = `<div class="center-message"><h2>No decisions yet</h2><p class="mt-md text-muted">Go to the Decide tab to make your first decision.</p><a href="#decide" class="btn btn-primary mt-lg">Start Round 1</a></div>`;
      return;
    }

    el.innerHTML = `
      <div class="section-header">
        <h2>Your Journey</h2>
        <p class="subtitle">Decisions made and their outcomes</p>
      </div>
      <div id="results-timeline" class="mt-lg"></div>
      <div id="results-detail" class="mt-xl"></div>
      <div class="mt-xl text-center">
        ${round <= 4 && path.length < round ? `<a href="#decide" class="btn btn-primary">Continue to Round ${round}</a>` : ''}
        <button class="btn btn-secondary" onclick="State.reset();location.hash='#dashboard';location.reload();" style="margin-left:var(--space-md);">Reset Simulation</button>
      </div>
    `;

    const timeline = el.querySelector('#results-timeline');
    const detail = el.querySelector('#results-detail');

    // Timeline
    timeline.innerHTML = `
      <div style="display:flex;gap:var(--space-md);align-items:center;">
        ${[1,2,3,4].map(r => {
          const d = decisions[`round${r}`];
          const isCurrent = r === round && !d;
          const isDone = !!d;
          return `
            <div style="flex:1;text-align:center;">
              <div style="width:40px;height:40px;border-radius:50%;margin:0 auto var(--space-sm);display:flex;align-items:center;justify-content:center;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;
                background:${isDone ? 'var(--c-purple)' : isCurrent ? 'var(--c-lavender)' : 'rgba(0,0,0,0.05)'};
                color:${isDone ? 'white' : isCurrent ? 'var(--c-purple)' : 'var(--c-muted)'};
                border:2px solid ${isDone ? 'var(--c-purple)' : isCurrent ? 'var(--c-purple)' : 'rgba(0,0,0,0.1)'};">
                ${isDone ? '✓' : r}
              </div>
              <div style="font-size:0.75rem;color:${isDone ? 'var(--c-dark)' : 'var(--c-muted)'};">Round ${r}</div>
              ${d ? `<div style="font-size:0.7rem;color:var(--c-purple);margin-top:2px;">${d}</div>` : ''}
            </div>
            ${r < 4 ? '<div style="flex:0 0 40px;height:2px;background:' + (isDone ? 'var(--c-purple)' : 'rgba(0,0,0,0.1)') + ';margin-top:-20px;"></div>' : ''}
          `;
        }).join('')}
      </div>
    `;

    // Show experiment results if Round 2 is done
    const expChoice = decisions.round2;
    if (expChoice) {
      const outcome = Dataset.data.outcomes?.round2?.[expChoice];
      if (outcome) {
        const r = outcome.results;
        detail.innerHTML = `
          <h3 class="mb-md">Round 2 Results: ${outcome.summary}</h3>
          ${r ? `
            <div class="grid-2">
              <div class="kpi-card">
                <div class="kpi-label">Control</div>
                <div class="kpi-value">${r.control}%</div>
                <div class="kpi-label">${r.metric}</div>
              </div>
              <div class="kpi-card" style="border:2px solid ${r.significant ? 'var(--c-green)' : 'var(--c-muted)'};">
                <div class="kpi-label">Variant</div>
                <div class="kpi-value">${r.variant}%</div>
                <div class="kpi-delta ${r.significant ? 'up' : 'neutral'}">${r.lift}</div>
                <div style="font-size:0.8rem;color:${r.significant ? 'var(--c-green)' : 'var(--c-red)'};">
                  p = ${r.pvalue} ${r.significant ? '✓ Significant' : '✗ Not significant'}
                </div>
              </div>
            </div>
          ` : `
            <div class="card">
              <ul style="font-size:0.9rem;line-height:1.8;">${outcome.findings.map(f => `<li>${f}</li>`).join('')}</ul>
              ${outcome.recommendation ? `<p class="mt-md" style="font-weight:600;">${outcome.recommendation}</p>` : ''}
            </div>
          `}
        `;
      }
    }
  }
};
