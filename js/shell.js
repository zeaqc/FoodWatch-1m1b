// Shared nav + footer + Bob widget HTML injected into every page
// Call injectShell() at the top of each page's <body>

function injectShell() {
  // ── Navigation ─────────────────────────────────────────────
  const nav = document.createElement('nav');
  nav.className = 'topnav';
  nav.innerHTML = `
    <span class="brand">🌾 FoodWatch</span>
    <button class="nav-toggle" aria-label="Menu">☰</button>
    <div class="nav-links" id="nav-links">
      <a href="index.html">Home</a>
      <a href="problem.html">The Problem</a>
      <a href="data.html">Data & Insights</a>
      <a href="government.html">Government</a>
      <a href="solutions.html">Solutions</a>
      <a href="bob.html">🤖 IBM Bob</a>
      <a href="presentation.html" style="color:var(--green-mid); font-weight:700;">📽️ Presentation</a>
    </div>`;
  document.body.insertBefore(nav, document.body.firstChild);

  // ── Footer ──────────────────────────────────────────────────
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer-links">
      <a href="index.html">Home</a>
      <a href="problem.html">The Problem</a>
      <a href="data.html">Data & Insights</a>
      <a href="government.html">Government</a>
      <a href="solutions.html">Solutions</a>
      <a href="bob.html">IBM Bob AI</a>
      <a href="presentation.html">Presentation Deck</a>
    </div>
    <p>© 2025 FoodWatch Initiative &nbsp;|&nbsp; Built with IBM Bob AI &nbsp;|&nbsp; Data: FAO, MoFPI, ICAR</p>`;
  document.body.appendChild(footer);

  // ── IBM Bob FAB + Chat Panel ────────────────────────────────
  const bobFab = document.createElement('button');
  bobFab.id = 'bob-fab';
  bobFab.title = 'Ask IBM Bob';
  bobFab.innerHTML = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C8.28 2 2 8.28 2 16c0 2.4.62 4.66 1.7 6.63L2 30l7.55-1.68A13.93 13.93 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 2c6.62 0 12 5.38 12 12S22.62 28 16 28a11.94 11.94 0 01-6.08-1.65l-.43-.26-4.48 1 1.02-4.36-.28-.45A11.94 11.94 0 014 16C4 9.38 9.38 4 16 4zm-1 5v2h2V9h-2zm0 4v8h2v-8h-2z"/>
  </svg>`;

  const bobPanel = document.createElement('div');
  bobPanel.id = 'bob-panel';
  bobPanel.innerHTML = `
    <div class="bob-header">
      <div class="avatar">🤖</div>
      <div>
        <div class="title">IBM Bob</div>
        <div class="subtitle">Food Resource AI Assistant</div>
      </div>
      <button class="bob-close" id="bob-close">✕</button>
    </div>
    <div class="bob-messages" id="bob-messages">
      <div class="msg bot">Hi! I'm <strong>IBM Bob</strong>, your AI assistant on food resource exploitation & wastage. Ask me anything — or pick a quick topic below! 🌾</div>
    </div>
    <div class="quick-chips">
      <button class="chip" data-q="What causes food waste?">Causes of waste</button>
      <button class="chip" data-q="Tell me about government schemes">Govt schemes</button>
      <button class="chip" data-q="How can I help reduce food waste?">How to help</button>
      <button class="chip" data-q="What is cold chain?">Cold chain</button>
      <button class="chip" data-q="How does IBM support food security?">IBM's role</button>
    </div>
    <div class="bob-input-row">
      <input type="text" id="bob-input" placeholder="Ask about food waste…" />
      <button id="bob-send">Send</button>
    </div>`;

  document.body.appendChild(bobFab);
  document.body.appendChild(bobPanel);
}
