const HomeView = {
  render(el) {
    const d = Dataset.data;
    const teamName = State.get('teamName');

    el.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; padding: var(--space-2xl) 0;">
        <div class="text-center mb-lg">
          <h1 style="font-size: 2.4rem; margin-bottom: var(--space-sm);">Welcome to the <span class="text-purple">${d.product}</span> Simulator</h1>
          <p style="font-size: 1.1rem; color: var(--c-body); line-height: 1.6;">
            Today you are the product team of <strong>${d.product}</strong> — ${d.domain}.
          </p>
        </div>

        <div class="card mb-lg" style="border-top-color: var(--c-purple);">
          <h3 class="mb-md">How it works</h3>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--space-md) var(--space-lg); font-size: 0.9rem; align-items: start;">
            <div class="pill pill-purple">Round 1</div>
            <div>Review the <strong>baseline dashboard</strong> and set your <strong>Q3 OKRs</strong></div>
            <div class="pill pill-purple">Round 2</div>
            <div>Dive into <strong>analytics</strong>, spot signals, and design an <strong>experiment</strong></div>
            <div class="pill pill-purple">Round 3</div>
            <div>Review <strong>experiment results</strong> — ship, iterate, or kill?</div>
            <div class="pill pill-purple">Round 4</div>
            <div>See the <strong>full quarter impact</strong> and present to the board</div>
          </div>
        </div>

        <div class="card mb-lg" style="border-top-color: var(--c-green);">
          <h3 class="mb-md">Your team</h3>
          ${teamName ? `
            <p>Team: <strong>${teamName}</strong></p>
            <button class="btn btn-secondary mt-md" onclick="State.set('teamName', null); HomeView.render(document.getElementById('view-home'));">Change team name</button>
          ` : `
            <p class="mb-md">Enter your team name to get started:</p>
            <div style="display: flex; gap: var(--space-sm);">
              <input type="text" id="team-input" placeholder="e.g. Team Alpha" style="flex: 1; padding: var(--space-sm) var(--space-md); font-size: 1rem; border: 2px solid var(--c-lavender); border-radius: var(--radius); font-family: 'Inter', sans-serif; outline: none;" autofocus>
              <button class="btn btn-primary" id="team-submit">Start</button>
            </div>
          `}
        </div>

        ${teamName ? `
          <div class="text-center mt-xl">
            <a href="#dashboard" class="btn btn-primary" style="font-size: 1.1rem; padding: var(--space-md) var(--space-2xl);">Open Dashboard →</a>
          </div>

          <div class="grid-3 mt-xl" style="font-size: 0.85rem;">
            <a href="#vanity-game" class="card" style="text-decoration: none; text-align: center; cursor: pointer;">
              <h3>🎯 Vanity Game</h3>
              <p class="text-muted mt-sm">Vanity or Actionable?</p>
            </a>
            <a href="#pvalue-game" class="card" style="text-decoration: none; text-align: center; cursor: pointer;">
              <h3>📊 p-value Game</h3>
              <p class="text-muted mt-sm">Significant or not?</p>
            </a>
            <a href="#scoring" class="card" style="text-decoration: none; text-align: center; cursor: pointer;">
              <h3>⚖️ ICE Scoring</h3>
              <p class="text-muted mt-sm">Prioritize features</p>
            </a>
          </div>
        ` : ''}
      </div>
    `;

    // Team name input handling
    const input = el.querySelector('#team-input');
    const submit = el.querySelector('#team-submit');
    if (input && submit) {
      const doSubmit = () => {
        const name = input.value.trim();
        if (name) {
          State.set('teamName', name);
          HomeView.render(el);
        }
      };
      submit.addEventListener('click', doSubmit);
      input.addEventListener('keydown', e => {
        e.stopPropagation(); // prevent reveal.js
        if (e.key === 'Enter') doSubmit();
      });
    }
  }
};
