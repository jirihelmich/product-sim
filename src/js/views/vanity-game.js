const VanityGameView = {
  _idx: 0,
  _score: 0,
  _answered: false,

  render(el) {
    const questions = Dataset.getGameQuestions('vanity');
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

    el.innerHTML = `
      <div class="game-progress"><div class="game-progress-bar" style="width:${(this._idx / questions.length) * 100}%;"></div></div>
      <div class="game-question">
        <p class="text-muted font-mono mb-md" style="font-size:0.8rem;">Question ${this._idx + 1} of ${questions.length}</p>
        <h2>"${q.metric}"</h2>
        <p class="mt-md mb-lg text-muted">Is this metric vanity or actionable?</p>
        <div class="game-options">
          <button class="game-btn" data-answer="vanity">Vanity</button>
          <button class="game-btn" data-answer="actionable">Actionable</button>
        </div>
        <div id="game-feedback" class="mt-lg" style="min-height:60px;"></div>
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
        // Highlight correct answer
        el.querySelectorAll('.game-btn').forEach(b => {
          if (b.dataset.answer === q.answer) b.classList.add('correct');
        });

        el.querySelector('#game-feedback').innerHTML = `
          <p style="font-size:0.9rem;color:${correct ? 'var(--c-green)' : 'var(--c-red)'};">${correct ? '✓ Correct!' : '✗ Not quite.'}</p>
          <p class="mt-sm text-muted" style="font-size:0.85rem;">${q.explanation}</p>
        `;

        setTimeout(() => {
          this._idx++;
          this.render(el);
        }, 2500);
      });
    });
  },

  _renderResults(el, questions) {
    const pct = Math.round((this._score / questions.length) * 100);
    State.set('scores', { ...State.get('scores'), vanity_game: this._score });

    el.innerHTML = `
      <div class="game-question">
        <h2>Results</h2>
        <div class="kpi-value" style="font-size:4rem;margin:var(--space-xl) 0;">${this._score}/${questions.length}</div>
        <p class="text-muted" style="font-size:1.1rem;">${pct}% correct</p>
        <p class="mt-lg" style="font-size:0.9rem;color:var(--c-body);">
          ${pct >= 80 ? 'Excellent — you have strong metric intuition!' : pct >= 60 ? 'Good foundation — watch out for lagging metrics that feel actionable.' : 'Keep practicing — the distinction gets clearer with experience.'}
        </p>
        <button class="btn btn-secondary mt-xl" onclick="VanityGameView._idx=0;VanityGameView._score=0;VanityGameView.render(document.getElementById('view-vanity-game'));">Play Again</button>
      </div>
    `;
  },

  reset() { this._idx = 0; this._score = 0; }
};
