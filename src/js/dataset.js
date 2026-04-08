/**
 * Dataset Loader
 * Loads company-specific data from datasets/{name}.json
 * Usage: ?dataset=jablotron (defaults to "jablotron")
 */
const Dataset = {
  data: null,
  name: null,

  async load() {
    const params = new URLSearchParams(window.location.search);
    this.name = params.get('dataset') || 'jablotron';

    try {
      const resp = await fetch(`datasets/${this.name}.json`);
      if (!resp.ok) throw new Error(`Dataset "${this.name}" not found`);
      this.data = await resp.json();
      document.getElementById('product-name').textContent = this.data.product || 'Product Simulator';
      document.title = `${this.data.product} — Simulator`;
      return this.data;
    } catch (err) {
      console.error('Failed to load dataset:', err);
      document.getElementById('main').innerHTML = `
        <div class="center-message">
          <h2>Dataset Not Found</h2>
          <p class="mt-md text-muted">Could not load <code>datasets/${this.name}.json</code></p>
          <p class="mt-sm text-muted">Check the URL parameter: <code>?dataset=${this.name}</code></p>
        </div>
      `;
      return null;
    }
  },

  /** Get metrics for the current round and decision path */
  getMetrics(round, path) {
    if (!this.data) return null;
    if (round === 0) return this.data.baseline;
    const key = path.join('_') || 'default';
    return this.data.outcomes?.[`round${round}`]?.[key] || this.data.baseline;
  },

  /** Get decisions available for a round */
  getDecisions(round) {
    return this.data?.decisions?.[`round${round}`] || [];
  },

  /** Get game questions */
  getGameQuestions(gameId) {
    return this.data?.games?.[gameId] || [];
  }
};
