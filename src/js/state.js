/**
 * State Management
 * Tracks team identity, current round, decisions made, and scores.
 * Persisted to localStorage so state survives page reloads.
 */
const State = {
  _key: 'product-sim-state',

  defaults: {
    teamName: null,
    round: 1,
    decisions: {},  // { round1: 'choice_id', round2: 'choice_id', ... }
    scores: {},     // { vanity_game: 8, pvalue_game: 6, ... }
  },

  _state: null,

  load() {
    try {
      const saved = localStorage.getItem(this._key);
      this._state = saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    } catch {
      this._state = { ...this.defaults };
    }
    this._updateUI();
    return this._state;
  },

  save() {
    localStorage.setItem(this._key, JSON.stringify(this._state));
    this._updateUI();
  },

  get(key) {
    return this._state?.[key];
  },

  set(key, value) {
    if (!this._state) this.load();
    this._state[key] = value;
    this.save();
  },

  /** Record a decision for a round */
  decide(round, choiceId) {
    if (!this._state.decisions) this._state.decisions = {};
    this._state.decisions[`round${round}`] = choiceId;
    this.save();
  },

  /** Get the decision path as an array */
  getPath() {
    const path = [];
    for (let r = 1; r <= 4; r++) {
      const d = this._state.decisions?.[`round${r}`];
      if (d) path.push(d);
      else break;
    }
    return path;
  },

  /** Advance to next round */
  nextRound() {
    if (this._state.round < 4) {
      this._state.round++;
      this.save();
    }
  },

  /** Reset all state */
  reset() {
    this._state = { ...this.defaults };
    this.save();
  },

  _updateUI() {
    const teamEl = document.getElementById('team-name');
    const teamBadge = document.getElementById('team-badge');
    const roundEl = document.getElementById('round-num');

    if (this._state.teamName) {
      teamEl.textContent = this._state.teamName;
      teamBadge.style.display = '';
    } else {
      teamBadge.style.display = 'none';
    }
    roundEl.textContent = this._state.round;
  }
};
