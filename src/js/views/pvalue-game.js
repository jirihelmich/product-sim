const PValueGameView = {
  _idx: 0,
  _score: 0,
  _answered: false,

  render(el) {
    const questions = Dataset.getGameQuestions('pvalue');
    if (!questions.length) {
      el.innerHTML = '<div class="center-message"><h2>No questions loaded</h2></div>';
      return;
    }

    if (this._idx >= questions.length) {
      this._renderResults(el, questions);
      return;
    }

    const q = questions[this._idx];
    this._answered = false;

    const barW = 280, barH = 180;
    const maxRate = Math.max(q.control.rate, q.variant.rate) * 1.3;

    el.innerHTML = `
      <div class="game-progress"><div class="game-progress-bar" style="width:${(this._idx / questions.length) * 100}%;"></div></div>
      <div class="game-question">
        <p class="text-muted font-mono mb-md" style="font-size:0.8rem;">Scenario ${this._idx + 1} of ${questions.length}</p>
        <h2 style="font-size:1.3rem;">${q.scenario}</h2>

        <div class="grid-2 mt-lg mb-lg" style="max-width:600px;margin-left:auto;margin-right:auto;">
          <div class="card neutral" style="text-align:center;">
            <div class="kpi-label">Control</div>
            <div style="font-size:2rem;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;margin:var(--space-sm) 0;">${q.control.rate}%</div>
            <div class="font-mono text-muted" style="font-size:0.75rem;">n = ${q.control.n.toLocaleString()}</div>
            ${this._renderBar(q.control.rate, maxRate, 'var(--c-muted)')}
          </div>
          <div class="card" style="text-align:center;">
            <div class="kpi-label">Variant</div>
            <div style="font-size:2rem;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;margin:var(--space-sm) 0;">${q.variant.rate}%</div>
            <div class="font-mono text-muted" style="font-size:0.75rem;">n = ${q.variant.n.toLocaleString()}</div>
            ${this._renderBar(q.variant.rate, maxRate, 'var(--c-purple)')}
          </div>
        </div>

        <p class="text-muted mb-lg">Is this result statistically significant?</p>
        <div class="game-options">
          <button class="game-btn" data-answer="significant" style="border-color:var(--c-green);">Significant</button>
          <button class="game-btn" data-answer="not_significant" style="border-color:var(--c-red);">Not Significant</button>
        </div>
        <div id="game-feedback" class="mt-lg" style="min-height:80px;"></div>
        <div class="game-score">Score: ${this._score} / ${this._idx}</div>
      </div>
    `;

    el.querySelectorAll('.game-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this._answered) return;
        this._answered = true;
        const correct = btn.dataset.answer === q.answer;
        if (correct) this._score++;

        btn.classList.add(correct ? 'correct' : 'wrong');
        el.querySelectorAll('.game-btn').forEach(b => {
          if (b.dataset.answer === q.answer) b.classList.add('correct');
        });

        el.querySelector('#game-feedback').innerHTML = `
          <p style="font-size:0.9rem;color:${correct ? 'var(--c-green)' : 'var(--c-red)'};">${correct ? '✓ Correct!' : '✗ Not quite.'}</p>
          <p class="mt-sm font-mono" style="font-size:0.85rem;">p-value = ${q.pvalue}</p>
          <p class="mt-sm text-muted" style="font-size:0.85rem;">${q.explanation}</p>
        `;

        setTimeout(() => { this._idx++; this.render(el); }, 3500);
      });
    });
  },

  _renderBar(rate, maxRate, color) {
    const pct = (rate / maxRate) * 100;
    return `<div style="margin-top:var(--space-sm);height:8px;background:var(--c-lavender);border-radius:4px;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:4px;transition:width 0.5s;"></div>
    </div>`;
  },

  _renderResults(el, questions) {
    const pct = Math.round((this._score / questions.length) * 100);
    State.set('scores', { ...State.get('scores'), pvalue_game: this._score });

    el.innerHTML = `
      <div class="game-question">
        <h2>Results</h2>
        <div class="kpi-value" style="font-size:4rem;margin:var(--space-xl) 0;">${this._score}/${questions.length}</div>
        <p class="text-muted" style="font-size:1.1rem;">${pct}% correct</p>
        <p class="mt-lg" style="font-size:0.9rem;color:var(--c-body);">
          ${pct >= 80 ? 'Strong statistical intuition — you read data well!' : pct >= 50 ? 'Decent grasp — remember: sample size matters as much as effect size.' : 'Statistical significance takes practice. Key rule: bigger sample + bigger effect = more confidence.'}
        </p>
        <button class="btn btn-secondary mt-xl" onclick="PValueGameView._idx=0;PValueGameView._score=0;PValueGameView.render(document.getElementById('view-pvalue-game'));">Play Again</button>
      </div>
    `;
  },

  reset() { this._idx = 0; this._score = 0; }
};
