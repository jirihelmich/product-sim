/**
 * Hash-based Router
 * Routes: dashboard, decide, results, vanity-game, pvalue-game, scoring
 */
const Router = {
  routes: {},
  currentRoute: null,

  register(name, renderFn) {
    this.routes[name] = renderFn;
  },

  init() {
    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  },

  navigate() {
    const hash = window.location.hash.slice(1) || 'home';
    const route = hash.split('?')[0]; // strip query params from hash

    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.route === route);
    });

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Check if view container exists, create if not
    let viewEl = document.getElementById(`view-${route}`);
    if (!viewEl) {
      viewEl = document.createElement('div');
      viewEl.id = `view-${route}`;
      viewEl.className = 'view';
      document.getElementById('main').appendChild(viewEl);
    }
    viewEl.classList.add('active');

    // Render
    if (this.routes[route]) {
      this.routes[route](viewEl);
    } else {
      viewEl.innerHTML = `
        <div class="center-message">
          <h2>Route not found</h2>
          <p class="mt-md text-muted">"${route}" is not a valid view</p>
          <a href="#dashboard" class="btn btn-primary mt-lg">Go to Dashboard</a>
        </div>
      `;
    }

    this.currentRoute = route;
  }
};
