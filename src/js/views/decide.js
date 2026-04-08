const DecideView = {
  _selectedObjective: null,
  _selectedKRs: new Set(),
  _selectedExperiment: null,
  _shipAction: null,

  render(el) {
    const round = State.get('round') || 1;
    const decisions = Dataset.getDecisions(round);
    if (!decisions || !decisions.type) {
      el.innerHTML = `<div class="center-message"><h2>No decisions for Round ${round}</h2><p class="mt-md text-muted">Check the Dashboard or Results tab.</p></div>`;
      return;
    }

    el.innerHTML = `
      <div class="section-header">
        <div style="display:flex;align-items:center;gap:var(--space-md);justify-content:space-between;">
          <div><h2>Round ${round}: ${decisions.title}</h2><p class="subtitle">${decisions.description}</p></div>
          <div class="pill pill-purple">Round ${round}/4</div>
        </div>
      </div>
      <div id="decide-content" class="mt-lg"></div>
    `;

    const content = el.querySelector('#decide-content');
    if (decisions.type === 'okr') this._renderOKR(content, decisions, round);
    else if (decisions.type === 'experiment') this._renderExperiment(content, decisions, round);
    else if (decisions.type === 'ship_or_kill') this._renderShipOrKill(content, decisions, round);
  },

  _renderOKR(el, d, round) {
    if (State.get('decisions')?.[`round${round}`]) {
      el.innerHTML = `<div class="center-message"><h2>Decision Locked</h2><p class="mt-md text-muted">Objective: <strong>${State.get('decisions')[`round${round}`]}</strong></p><a href="#results" class="btn btn-primary mt-lg">See Results</a></div>`;
      return;
    }

    el.innerHTML = `
      <h3 class="mb-md">Step 1: Choose Your Objective</h3>
      <div class="decision-grid" id="obj-grid">${d.objectives.map(o => `
        <div class="decision-card" data-id="${o.id}"><h3>${o.label}</h3><p>${o.description}</p></div>
      `).join('')}</div>
      <div id="kr-section" style="display:none;" class="mt-xl">
        <h3 class="mb-md">Step 2: Choose 2-3 Key Results</h3>
        <div id="kr-grid" class="decision-grid"></div>
      </div>
      <div class="mt-xl text-center"><button class="btn btn-primary" id="lock-btn" disabled>Lock In Decision</button></div>
    `;

    el.querySelectorAll('#obj-grid .decision-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('#obj-grid .decision-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._selectedObjective = card.dataset.id;
        this._selectedKRs.clear();
        this._showKRs(el, d);
      });
    });

    el.querySelector('#lock-btn').addEventListener('click', () => {
      if (this._selectedObjective && this._selectedKRs.size >= 2) {
        State.decide(round, this._selectedObjective);
        window.location.hash = '#results';
      }
    });
  },

  _showKRs(el, d) {
    const krs = d.keyResults[this._selectedObjective] || [];
    el.querySelector('#kr-section').style.display = '';
    const grid = el.querySelector('#kr-grid');
    grid.innerHTML = krs.map(kr => `
      <div class="decision-card" data-id="${kr.id}">
        <h3 style="font-size:0.85rem;">${kr.label}</h3>
        ${kr.quality === 'bad' ? '<div class="pill pill-red mt-sm" style="font-size:0.65rem;">Potential issue</div>' : ''}
        ${kr.quality === 'ok' ? '<div class="pill mt-sm" style="font-size:0.65rem;">Needs refinement</div>' : ''}
      </div>
    `).join('');

    grid.querySelectorAll('.decision-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        if (card.classList.contains('selected')) this._selectedKRs.add(card.dataset.id);
        else this._selectedKRs.delete(card.dataset.id);
        el.querySelector('#lock-btn').disabled = this._selectedKRs.size < 2;
      });
    });
  },

  _renderExperiment(el, d, round) {
    if (State.get('decisions')?.[`round${round}`]) {
      el.innerHTML = `<div class="center-message"><h2>Decision Locked</h2><p class="mt-md text-muted">Experiment: <strong>${State.get('decisions')[`round${round}`]}</strong></p><a href="#results" class="btn btn-primary mt-lg">See Results</a></div>`;
      return;
    }

    el.innerHTML = `
      <div class="decision-grid">${d.options.map(o => `
        <div class="decision-card" data-id="${o.id}">
          <h3>${o.label}</h3><p>${o.description}</p>
          <div class="meta"><span class="pill">${o.cost} cost</span><span class="pill">${o.time}</span><span class="pill">${o.evidence}</span></div>
        </div>
      `).join('')}</div>
      <div class="mt-xl text-center"><button class="btn btn-primary" id="lock-btn" disabled>Lock In Decision</button></div>
    `;

    el.querySelectorAll('.decision-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.decision-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._selectedExperiment = card.dataset.id;
        el.querySelector('#lock-btn').disabled = false;
      });
    });

    el.querySelector('#lock-btn').addEventListener('click', () => {
      if (this._selectedExperiment) {
        State.decide(round, this._selectedExperiment);
        window.location.hash = '#results';
      }
    });
  },

  _renderShipOrKill(el, d, round) {
    const expChoice = State.get('decisions')?.round2;
    if (!expChoice) {
      el.innerHTML = '<div class="center-message"><h2>Complete Round 2 first</h2></div>';
      return;
    }

    const outcome = Dataset.data.outcomes?.round2?.[expChoice];
    if (!outcome) {
      el.innerHTML = '<div class="center-message"><h2>No results available</h2></div>';
      return;
    }

    const r = outcome.results;
    el.innerHTML = `
      <div class="card mb-lg">
        <h3>${outcome.summary}</h3>
        ${r ? `
          <div class="grid-2 mt-md">
            <div class="kpi-card"><div class="kpi-label">Control</div><div class="kpi-value">${r.control}%</div><div class="kpi-label">${r.metric}</div></div>
            <div class="kpi-card"><div class="kpi-label">Variant</div><div class="kpi-value">${r.variant}%</div><div class="kpi-delta ${r.significant ? 'up' : 'neutral'}">${r.lift} (p=${r.pvalue})</div></div>
          </div>
          ${outcome.guardrails && Object.keys(outcome.guardrails).length ? `<div class="mt-md"><h3 style="font-size:0.85rem;" class="mb-sm">Guardrails</h3>${Object.values(outcome.guardrails).map(g => `<p style="font-size:0.85rem;">${g.label}: ${g.control} → ${g.variant} ${g.warning ? '<span class="text-red">⚠</span>' : ''}</p>`).join('')}</div>` : ''}
        ` : `
          <ul class="mt-md" style="font-size:0.9rem;line-height:1.8;">${outcome.findings.map(f => `<li>${f}</li>`).join('')}</ul>
          ${outcome.recommendation ? `<p class="mt-md" style="font-weight:600;">${outcome.recommendation}</p>` : ''}
        `}
      </div>
      <h3 class="mb-md">What's your decision?</h3>
      <div class="decision-grid">
        <div class="decision-card" data-id="ship" style="border-top:3px solid var(--c-green);"><h3 style="color:var(--c-green);">Ship</h3><p>Roll out to 100%</p></div>
        <div class="decision-card" data-id="iterate" style="border-top:3px solid var(--c-orange);"><h3 style="color:var(--c-orange);">Iterate</h3><p>Run follow-up experiment</p></div>
        <div class="decision-card" data-id="kill" style="border-top:3px solid var(--c-red);"><h3 style="color:var(--c-red);">Kill</h3><p>Revert and move on</p></div>
      </div>
      <div class="mt-xl text-center"><button class="btn btn-primary" id="lock-btn" disabled>Lock In Decision</button></div>
    `;

    el.querySelectorAll('.decision-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.decision-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._shipAction = card.dataset.id;
        el.querySelector('#lock-btn').disabled = false;
      });
    });

    el.querySelector('#lock-btn').addEventListener('click', () => {
      if (this._shipAction) {
        State.decide(round, this._shipAction);
        State.nextRound();
        window.location.hash = '#dashboard';
      }
    });
  }
};
