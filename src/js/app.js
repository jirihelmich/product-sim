/**
 * App Entry Point
 * Loads dataset, initializes state, registers routes, starts router.
 */
(async function() {
  // Check if embedded in iframe (reveal.js)
  if (window.self !== window.top) {
    document.body.classList.add('embed-mode');
  }

  // Load state
  State.load();

  // Load dataset
  const data = await Dataset.load();
  if (!data) return;

  // Register routes
  Router.register('home', HomeView.render);
  Router.register('dashboard', DashboardView.render);
  Router.register('decide', DecideView.render);
  Router.register('results', ResultsView.render);
  Router.register('vanity-game', VanityGameView.render);
  Router.register('pvalue-game', PValueGameView.render);
  Router.register('scoring', ScoringView.render);

  // Start router
  Router.init();
})();
