/* ============================================================
   FoodWatch — Shared JS (nav highlight + IBM Bob chat widget)
   ============================================================ */

// ── Active nav link ──────────────────────────────────────────
(function () {
  const links = document.querySelectorAll('nav.topnav a');
  const page = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
})();

// ── IBM Bob Chat Widget ──────────────────────────────────────
// This widget simulates the IBM Bob conversational AI experience.
// To connect a real IBM Bob / watsonx Assistant endpoint, replace
// the `bobReply()` function with a fetch() call to your deployed
// assistant's REST API (https://your-region.assistant.watson.cloud.ibm.com).

const BOB_KNOWLEDGE = {
  "food waste": "Globally, **1.3 billion tonnes** of food is lost or wasted every year — FAO SOFA 2019. Even as **733 million people** face hunger (FAO SOFA 2023). In India, post-harvest losses alone cost **₹1.53 lakh crore annually** (ICAR, 2022). The updated figure from NITI Aayog (2018) was ₹92,651 crore — ICAR's 2022 assessment revised this upward significantly.",
  "primary source": "Primary-source waste in India: ICAR (2022) documents losses of **4.6–15.9% for fruits & vegetables**, **4.3–6% for cereals**, **~27% for fish**, and **~22% for milk**. The NITI Aayog (2018) discussion paper found that **91% of Indian villages lack cold storage** — the single biggest structural cause of primary-source perishable loss.",
  "rural": "**70% of India's food losses originate in rural areas** (MoFPI Annual Report 2022–23). Rural-specific issues: 91% villages lack cold storage (NITI Aayog 2018), 41% lack all-weather roads (PMGSY 2023), only 6% of farmers access MSP (Shanta Kumar Committee 2015), 68% of marginal farmers sell immediately post-harvest (NABARD 2022). Rural counter-measures include solar cold hubs, FPO collective storage, SHG-based processing (NRLM), Grameen Bhandaran grain banks, and PMGSY road connectivity.",
  "government scheme": "Key government schemes with official data: **PMKSY** (₹4,600 Cr, 24 mega food parks operational - MoFPI AR 2022–23), **eNAM** (1,361 mandis live, 1.76 Cr farmers - MoA&FW March 2023), **PMFBY** (₹13,625 Cr budget 2023–24, ₹1.28 lakh Cr claims paid since inception), **AIF** (₹40,407 Cr sanctioned across 67,226 projects), **FPO Scheme** (3,231 FPOs registered of 10,000 target), **DAY-NRLM** (9.14 Cr women in 83.57 lakh SHGs - MoRD AR 2022–23), **RKVY-RAFTAAR** (₹7,150 Cr Budget 2023–24), **PM-AASHA** (42 lakh MT procured in 2022–23).",
  "cold chain": "India has **8,186 cold storage units** with **37.4 million MT capacity** (NHB 2023) — but **75% is concentrated in just 5 states** (UP, WB, Punjab, Gujarat, MP). Only **11% of perishable produce** moves through an integrated cold chain (MoFPI AR 2022–23). **91% of villages** have no cold storage access (NITI Aayog 2018). The Integrated Cold Chain Scheme (MoFPI) has sanctioned 291 projects as of 2022–23.",
  "msp": "Only **6% of Indian farmers** actually sell at MSP — documented by the **Shanta Kumar High Level Committee Report (2015)**. CACP Price Policy Report 2023 confirmed MSP awareness is under **20% among marginal farmers**. PM-AASHA triggers government procurement when prices fall more than 10% below MSP — it procured **42 lakh MT of pulses & oilseeds** in 2022–23 alone.",
  "fpo": "The government is promoting **10,000 new FPOs** with ₹6,865 crore (2019–24). Each FPO gets ₹15 lakh handholding grant + credit guarantee. As of March 2023, **3,231 FPOs registered** (32% of target). NABARD FPO Impact Study (2022) shows FPO-member farmers get **12–15% higher prices** than non-members. FPOs can pool resources for village cold rooms, grading equipment, and direct eNAM trading.",
  "nrlm shg": "**DAY-NRLM** has mobilised **9.14 crore women into 83.57 lakh SHGs** (MoRD Annual Report 2022–23). SHGs receive revolving fund and Community Investment Fund (CIF) grants to establish village-level food processing units — pickles, papad, dried fruits, jams. This converts surplus perishables into shelf-stable products with 6–12 month shelf life, eliminating the seasonal waste peak at harvest.",
  "counter": "Key counter-measures (rural): solar cold hubs (PM-KUSUM 60% subsidy), FPO collective storage (10,000 FPO Scheme), SHG processing units (NRLM), Grameen Bhandaran grain banks (15–25% subsidy), SMAM post-harvest machinery subsidy (40–50%), eNAM price transparency (1,361 mandis), PMGSY road connectivity (₹19,000 Cr 2023–24), GOBAR-Dhan biogas (₹10,000 Cr 2023–24). Urban: Feeding India, Robin Hood Army, IBM Food Trust blockchain, IBM watsonx demand forecasting.",
  "icar": "ICAR Post-Harvest Technology Division (2022) is the primary Indian government source for post-harvest loss data. Key findings: Fruits & Vegetables: 4.6–15.9% weight loss; Fish: ~27%; Milk: ~22%; Cereals: 4.3–5.99%; total annual value loss updated to ₹1.53 lakh crore. Published in Indian Journal of Agricultural Sciences, Vol. 92(2).",
  "redistribute": "Redistribution platforms: **Feeding India** (Zomato, 50+ cities, 10M+ meals), **Robin Hood Army** (founded 2014, 1.3M+ meals/year), **No Food Waste** (Tamil Nadu, 3M+ meals, 500+ hunger spots mapped). At rural level, **PM-AASHA** government procurement and **NRLM SHG distribution** are the formal redistribution mechanisms.",
  "technology": "Technology solutions: **IBM watsonx** demand forecasting (reduces overstock by 25–30%), **IBM Food Trust** blockchain (tracks farm-to-shelf in seconds, used by Walmart/Nestlé), **IBM Maximo** cold chain IoT (predictive maintenance), **ICAR IoT pilots** in Odisha/Bihar (ESP32+GSM sensors, 35% reduction in cold room spoilage), **eNAM** (digital mandi trading), **mKisan** (85 lakh+ users, IVR price alerts), **ISRO FASAL** satellite crop monitoring.",
  "policy": "Key policies: **NFSA 2013** (81.35 Cr beneficiaries, 540.28 lakh MT lifted 2022–23 - DFPD), **Solid Waste Management Rules 2016** (composting mandate for bulk generators), **PLI Food Processing** (₹10,900 Cr, 176 applicants, ₹33,494 Cr projected sales), **AIF** (₹1 lakh crore, ₹40,407 Cr sanctioned Mar 2023). CAG identified gaps in cold chain scheme implementation concentrated near highways rather than remote districts.",
  "help": "You can: (1) Form or join an FPO (apply via SFAC/MoA&FW), (2) Register women's SHG under NRLM for processing unit grants, (3) Apply for AIF loan for cold storage (3% subvention), (4) Register on eNAM for real-time prices, (5) Apply for Grameen Bhandaran storage subsidy, (6) Install solar cold room via PM-KUSUM, (7) Apply for SMAM machinery subsidy, (8) Register on mKisan for daily price alerts. Contact your Krishi Vigyan Kendra (KVK) or NABARD District Development Manager.",
  "ibm": "IBM supports food security through: **IBM watsonx.ai** (demand forecasting, chatbots like IBM Bob), **IBM Food Trust** (blockchain traceability — used by Walmart, Carrefour, Nestlé), **IBM Maximo** (cold chain IoT predictive maintenance), **IBM Sustainability Accelerator** (free support for NGOs/governments tackling food insecurity — active in India, Africa, SE Asia).",
  "environment": "Food waste environmental cost (sourced): **250 km³ water** wasted annually in wasted food (FAO Food Wastage Footprint 2013), **1.4 billion hectares** of agricultural land used to grow wasted food (FAO 2013), **8–10% of global GHG emissions** from food loss & waste (IPCC AR6, 2022) — revised upward to **4.4 Gt CO₂e/year** including land-use change (UNEP Food Waste Index 2021).",
};

function bobReply(userMsg) {
  const lower = userMsg.toLowerCase();
  for (const [key, val] of Object.entries(BOB_KNOWLEDGE)) {
    if (lower.includes(key)) return val;
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm **IBM Bob**, your AI assistant for food resource insights. Ask me about food waste, government schemes, cold chain, technology solutions, or how you can help!";
  }
  if (lower.includes('thank')) return "You're welcome! Every small action toward reducing food waste counts. 🌱";
  return "I can help with topics like **food waste**, **primary-source losses**, **government schemes**, **cold chain**, **redistribution**, **technology**, or **how to help**. What would you like to explore?";
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

(function initBobWidget() {
  const fab = document.getElementById('bob-fab');
  const panel = document.getElementById('bob-panel');
  const close = document.getElementById('bob-close');
  const msgs = document.getElementById('bob-messages');
  const input = document.getElementById('bob-input');
  const send = document.getElementById('bob-send');
  const chips = document.querySelectorAll('.chip');

  if (!fab) return;

  fab.addEventListener('click', () => panel.classList.toggle('open'));
  close.addEventListener('click', () => panel.classList.remove('open'));

  function addMsg(text, role) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    el.innerHTML = renderMarkdown(text);
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function sendMsg(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';
    const thinking = addMsg('Thinking…', 'bot thinking');
    setTimeout(() => {
      thinking.remove();
      addMsg(bobReply(text), 'bot');
    }, 600);
  }

  send.addEventListener('click', () => sendMsg(input.value));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg(input.value); });
  chips.forEach(c => c.addEventListener('click', () => {
    panel.classList.add('open');
    sendMsg(c.dataset.q);
  }));
})();
