const toast = document.querySelector("#toast");
const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modalTitle");
const modalValue = document.querySelector("#modalValue");
const walkthrough = document.querySelector("#walkthrough");
const walkthroughTiles = document.querySelector("#walkthroughTiles");
const walkthroughDetail = document.querySelector("#walkthroughDetail");
const walkthroughProgress = document.querySelector("#walkthroughProgress");
const walkthroughPrev = document.querySelector("#walkthroughPrev");
const walkthroughNext = document.querySelector("#walkthroughNext");
const featureView = document.querySelector("#featureView");

const capabilities = [
  {
    title: "Unify cloud visibility",
    icon: "◈",
    label: "ONE PORTFOLIO VIEW",
    does: "Ingests and normalizes Azure, AWS, and Google Cloud costs into one comparable portfolio view, then connects spend to owners and workloads.",
    why: "Finance and engineering stop reconciling separate provider reports and can make decisions using the same cost baseline.",
    outcomes: [
      ["$112.4M", "annual multi-cloud spend in one view"],
      ["43 / 35 / 22%", "portfolio split across Azure, AWS, and GCP"],
      ["426", "workloads analyzed"],
    ],
  },
  {
    title: "Forecast & control budgets",
    icon: "⌁",
    label: "EARLY-WARNING FORECASTS",
    does: "Combines historical run rate, current usage, and growth signals to forecast month-, quarter-, and year-end spend against approved budgets.",
    why: "Leaders see budget pressure while there is still time to change a commitment, workload plan, or growth assumption.",
    outcomes: [
      ["$29.7M", "forecast quarter-end spend"],
      ["$2.3M", "quarter-end variance to budget"],
      ["$9.4M", "projected annual overrun at current growth"],
    ],
  },
  {
    title: "Find & prioritize savings",
    icon: "✧",
    label: "ACTIONABLE OPTIMIZATION",
    does: "Detects idle, orphaned, and underused resources, then ranks rightsizing, scheduling, and placement recommendations by value and effort.",
    why: "Teams get a shared, prioritized backlog instead of disconnected provider recommendations with no portfolio-level context.",
    outcomes: [
      ["$18.7M", "savings opportunities identified"],
      ["137", "recommendations ranked for action"],
      ["84 / 426", "workloads flagged for review"],
    ],
  },
  {
    title: "Govern AI spend & ROI",
    icon: "✦",
    label: "AI COST GOVERNANCE",
    does: "Attributes model, token, GPU, and agent execution costs to teams and use cases, then compares spend with adoption and business value.",
    why: "Rapid AI growth becomes visible and accountable; low-return usage can be reviewed before it becomes embedded operating cost.",
    outcomes: [
      ["$14.8M", "AI and model spend · +84% YoY"],
      ["11", "AI agents flagged for low ROI"],
      ["$2.2M", "spend tied to low-return agents"],
    ],
  },
  {
    title: "Connect cost to business value",
    icon: "◎",
    label: "UNIT ECONOMICS",
    does: "Maps cloud and AI costs to subscriber, care interaction, streaming, and network-event measures so technology spend is expressed in business terms.",
    why: "CFO and CIO leaders can see whether unit costs are improving alongside customer growth, service demand, and revenue.",
    outcomes: [
      ["$2.68", "cost per subscriber / month · +11.2%"],
      ["$0.34", "cost per care interaction · -19.0%"],
      ["$0.87", "cost per 1M network events · -6.1%"],
    ],
  },
];
let selectedCapability = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => {
    launchSection(item.dataset.section);
  });
});

featureView.addEventListener("click", async (event) => {
  if (event.target.id !== "copyBriefing") return;
  const summary = "FY26 Q3 FinOps briefing: $112.4M annualized multi-cloud spend, up 7.2% QoQ; $9.4M projected annual overrun; $18.7M identified savings across 137 recommendations; AI spend is $14.8M, up 84% YoY. Recommended actions: prioritize savings, review low-ROI AI agents, and align commitments to the latest forecast.";
  try {
    await navigator.clipboard.writeText(summary);
    showToast("Executive briefing copied to clipboard.");
  } catch {
    showToast("Clipboard access is unavailable in this browser.");
  }
});

document.querySelector("#mobileSection").addEventListener("change", (event) => {
  launchSection(event.target.value);
});

document.querySelector("#demoButton").addEventListener("click", () => {
  openWalkthrough();
});

document.querySelector("#viewAgents").addEventListener("click", () => {
  showToast("Showing all 10 specialist agents in the fleet.");
});

document.querySelectorAll(".kpi-card").forEach((card) => {
  card.addEventListener("click", () => {
    modalTitle.textContent = card.dataset.kpi;
    modalValue.textContent = card.dataset.value;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  });
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    closeWalkthrough();
  }
});

function setActiveSection(section) {
  document.querySelectorAll(".nav-item").forEach((nav) => {
    nav.classList.toggle("active", nav.dataset.section === section);
  });
  document.querySelector("#mobileSection").value = section;
}

function launchSection(section) {
  setActiveSection(section);
  if (section === "Executive Walkthrough") {
    openWalkthrough();
    return;
  }
  if (section === "Executive Command Center") {
    closeWalkthrough();
    featureView.hidden = true;
    document.querySelector(".main-shell > .content").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const content = renderFeature(section);
  if (!content) return;
  document.querySelector(".main-shell > .content").hidden = true;
  featureView.innerHTML = content;
  featureView.hidden = false;
  featureView.dataset.section = section;
  updateFeature(section);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const workloadRows = [
  ["Customer Identity", "Azure", "$1.42M", "38%", "Optimize", "Production"],
  ["Video Transcoding", "AWS", "$2.18M", "22%", "Rightsize", "Production"],
  ["Subscriber Analytics", "GCP", "$940K", "31%", "Re-platform", "Review"],
  ["Care Search", "Azure", "$710K", "18%", "Optimize", "Production"],
  ["Legacy Batch Billing", "AWS", "$680K", "64%", "Retire", "Review"],
];
const optimizationRows = [
  ["Right-size video workers", "AWS · Video Transcoding", "$2.4M", "Low", "Ready"],
  ["Schedule non-prod clusters", "Azure · Dev environments", "$1.8M", "Low", "Ready"],
  ["Remove idle GPU capacity", "GCP · Model serving", "$1.2M", "Medium", "Review"],
  ["Tune database reservations", "Azure · Subscriber analytics", "$860K", "Medium", "Ready"],
];

function renderFeature(section) {
  const heading = (eyebrow, title, sub) => `<div class="feature-heading"><div><p class="eyebrow cyan">${eyebrow}</p><h2>${title}</h2><p>${sub}</p></div><span class="demo-tag">INTERACTIVE DEMO · MOCK DATA</span></div>`;
  const panel = (title, body, extra = "") => `<article class="panel feature-panel ${extra}"><div class="section-heading"><div><h3>${title}</h3></div></div>${body}</article>`;
  switch (section) {
    case "Multi-Cloud Comparison":
      return `${heading("PROVIDER ECONOMICS", section, "Compare normalized cost and workload fit across Azure, AWS, and Google Cloud.")}<div class="feature-controls"><label>Workload profile <select id="comparisonProfile"><option value="general">General purpose compute</option><option value="database">Managed database</option><option value="ai">AI model inference</option></select></label><label>Billing view <select id="billingView"><option value="monthly">Monthly run rate</option><option value="annual">Annualized cost</option></select></label></div>${panel("Equivalent workload cost", `<div id="comparisonResult"></div>`)}${panel("Decision context", `<p class="feature-copy">The comparison adjusts for compute, storage, network, and committed-use discounts. Use it as a placement signal; latency, resilience, and migration effort still matter.</p><div class="pill-row"><span>Normalized configuration</span><span>Discount-aware</span><span>Cross-cloud view</span></div>`)}`;
    case "Ask the FinOps Agent":
      return `${heading("FINOPS DECISION SUPPORT", section, "Ask about cost drivers, forecasts, savings, or workload actions. Answers are based on this demo portfolio.")}${panel("Ask a portfolio question", `<div class="prompt-chips"><button data-prompt="Why is our cloud spend increasing?">Why is spend rising?</button><button data-prompt="Where can we save the most?">Top savings opportunities?</button><button data-prompt="What is driving AI spend?">What drives AI spend?</button></div><form id="agentQuestionForm" class="agent-question"><input id="agentQuestion" placeholder="Ask about spend, workload, forecast, or savings..." required /><button class="primary-btn">Ask agent <span>→</span></button></form><div class="agent-response" id="agentResponse"><span class="agent-avatar purple-bg">◈</span><p>Select a suggested question or ask your own to see the FinOps agent analyze the portfolio.</p></div>`)}`;
    case "Agent Collaboration Scenario":
      return `${heading("COORDINATED AGENT WORKFLOW", section, "Watch specialist agents turn a cloud cost signal into a reviewable recommendation.")}${panel("Unexpected GPU spend increase", `<div class="scenario-summary"><span class="warning-dot">!</span><div><b>Signal detected · AI model serving</b><p>GPU run rate increased 28% month over month while successful inference volume grew 9%.</p></div><button class="primary-btn" id="runAgents">Run agent analysis</button></div><div class="agent-timeline" id="agentTimeline"><div><i>1</i><b>Cost Ingestion Agent</b><span>Waiting for run</span></div><div><i>2</i><b>AI Spend Agent</b><span>Waiting for run</span></div><div><i>3</i><b>Waste Detection Agent</b><span>Waiting for run</span></div><div><i>4</i><b>Workload Fit Agent</b><span>Waiting for run</span></div><div><i>5</i><b>Recommendation Agent</b><span>Waiting for run</span></div></div><div class="agent-conclusion" id="agentConclusion" hidden></div>`)}`;
    case "Workload Intelligence":
      return `${heading("APPLICATION PORTFOLIO", section, "Filter workloads and inspect a suggested action based on utilization, cost, and fit.")}${panel("Workload inventory", `<div class="table-controls"><input id="workloadSearch" placeholder="Search workloads..." /><select id="workloadFilter"><option value="all">All actions</option><option>Optimize</option><option>Rightsize</option><option>Re-platform</option><option>Retire</option></select></div><div class="table-wrap"><table><thead><tr><th>Workload</th><th>Provider</th><th>Annual cost</th><th>Idle capacity</th><th>Suggested action</th><th>Review</th></tr></thead><tbody id="workloadRows"></tbody></table></div>`)}`;
    case "AI Spend Governance":
      return `${heading("AI COST & VALUE CONTROLS", section, "Inspect AI spend by use case and change the demo alert threshold to see policy state update.")}<div class="feature-metrics"><div><small>AI SPEND</small><b>$14.8M</b><span>+84% year over year</span></div><div><small>LOW-ROI AGENTS</small><b>11</b><span>$2.2M flagged spend</span></div><div><small>POLICY ALERTS</small><b id="policyAlertCount">3</b><span>Above configured threshold</span></div></div>${panel("AI use-case portfolio", `<label class="range-control">Monthly alert threshold <b id="aiThresholdLabel">$100K</b><input id="aiThreshold" type="range" min="50" max="300" step="25" value="100" /></label><div class="table-wrap"><table><thead><tr><th>Use case</th><th>Owner</th><th>Monthly spend</th><th>Value signal</th><th>Policy</th></tr></thead><tbody id="aiUseCases"></tbody></table></div>`)}`;
    case "Cloud Commitments":
      return `${heading("COMMITMENT MANAGEMENT", section, "Review commitment coverage, utilization, and expirations before changing provider commitments.")}<div class="commitment-grid">${[
        ["Azure reservations", "72%", "$1.42M / month covered", "Expires in 94 days", "azure"],
        ["AWS savings plans", "64%", "$980K / month covered", "Expires in 181 days", "aws"],
        ["GCP committed use", "81%", "$620K / month covered", "Expires in 43 days", "gcp"],
      ].map(([name, percent, detail, expiry, color]) => `<article class="panel commitment-card"><div class="section-heading"><h3>${name}</h3><span class="provider ${color}">${color.toUpperCase()}</span></div><b>${percent}</b><div class="progress-track"><i class="${color}" style="width:${percent}"></i></div><p>${detail}</p><small>${expiry}</small></article>`).join("")}</div>${panel("Coverage target planner", `<label>Target portfolio coverage <select id="coverageTarget"><option value="65">65% · conservative</option><option value="75" selected>75% · balanced</option><option value="85">85% · aggressive</option></select></label><div class="coverage-result" id="coverageResult"></div>`)}`;
    case "Scenario Planner":
      return `${heading("WHAT-IF PLANNING", section, "Adjust planning assumptions and see the projected impact against the current quarter-end baseline.")}${panel("Scenario assumptions", `<div class="scenario-controls">${rangeInput("cloudGrowth", "Cloud growth", 0, 20, 7, "%")}${rangeInput("aiGrowth", "AI spend growth", 0, 120, 84, "%")}${rangeInput("savingsRate", "Savings actions delivered", 0, 30, 10, "%")}</div><div class="scenario-results"><div><small>PROJECTED QUARTER-END</small><b id="scenarioSpend"></b><span id="scenarioVariance"></span></div><div><small>PROJECTED ANNUAL SAVINGS</small><b id="scenarioSavings"></b><span>Based on identified opportunities</span></div><div><small>AI SPEND RUN RATE</small><b id="scenarioAiSpend"></b><span id="scenarioAiDelta"></span></div></div><p class="feature-footnote">Planning model applies selected growth and savings assumptions to illustrative FY26 Q3 demo data. It is not a financial forecast.</p>`)}`;
    case "Optimization Board":
      return `${heading("SAVINGS DELIVERY PIPELINE", section, "Review prioritized actions, then approve or dismiss them to see the savings backlog change.")}<div class="board-summary"><b><span id="openOpportunityCount">4</span> opportunities in review</b><span>Potential annual savings <strong id="openSavings">$6.26M</strong></span></div>${panel("Prioritized recommendations", `<div class="table-wrap"><table><thead><tr><th>Recommendation</th><th>Scope</th><th>Annual savings</th><th>Risk</th><th>Decision</th></tr></thead><tbody id="optimizationRows"></tbody></table></div>`)}`;
    case "Executive Briefing":
      return `${heading("CFO / CIO BRIEFING", section, "A concise portfolio readout for the current quarter. Figures are illustrative demo data.")}${panel("Executive summary", `<div class="briefing-topline"><span>FY26 Q3 · GROUP FINOPS OFFICE</span><button class="secondary-btn" id="copyBriefing">Copy briefing</button></div><h3 class="briefing-title">Cloud spend is growing faster than plan; savings and AI governance are the immediate levers.</h3><p class="feature-copy">The group’s annualized multi-cloud run rate is <b>$112.4M</b>, up 7.2% quarter over quarter. Current growth implies a <b>$9.4M annual budget overrun</b>, with AI spend up 84% year over year and contributing 58% of forecast variance.</p><div class="briefing-actions"><b>Recommended executive actions</b><ol><li>Prioritize the highest-value actions from the $18.7M savings pipeline.</li><li>Review the 11 low-ROI AI agents associated with $2.2M spend.</li><li>Align quarterly cloud commitments to the latest workload forecast.</li></ol></div><div class="feature-metrics compact"><div><small>PORTFOLIO SPEND</small><b>$112.4M</b><span>+7.2% QoQ</span></div><div><small>IDENTIFIED SAVINGS</small><b>$18.7M</b><span>137 actions</span></div><div><small>BUDGET OVERRUN</small><b>$9.4M</b><span>at current growth</span></div></div>`)}`;
    case "Microsoft Architecture":
      return `${heading("REFERENCE ARCHITECTURE", section, "Explore the conceptual flow from cloud billing sources to governed recommendations and executive outcomes.")}${panel("Multicloud FinOps control plane", `<div class="architecture-flow"><div class="architecture-group"><small>CLOUD SOURCES</small><span class="provider azure">Azure Cost Mgmt</span><span class="provider aws">AWS CUR</span><span class="provider gcp">GCP Billing</span></div><b class="flow-arrow">→</b><div class="architecture-group"><small>DATA &amp; NORMALIZATION</small><span>Ingestion &amp; validation</span><span>Common cost model</span><span>Ownership &amp; tagging</span></div><b class="flow-arrow">→</b><div class="architecture-group agents-block"><small>AGENT SERVICES</small><span>Forecast &amp; anomaly agents</span><span>Workload fit &amp; waste</span><span>AI spend governance</span></div><b class="flow-arrow">→</b><div class="architecture-group"><small>CONTROL &amp; OUTCOMES</small><span>Policy &amp; approvals</span><span>Optimization backlog</span><span>CFO / CIO briefing</span></div></div><div class="architecture-note"><b>Governance boundary</b><span>Agents analyze and recommend. Financial changes remain subject to owner review and provider permissions.</span></div>`)}`;
    case "Agent365 Governance":
      return `${heading("AGENT GOVERNANCE", section, "Change demo guardrails and inspect the resulting control state for the specialist agent fleet.")}${panel("Fleet guardrails", `<div class="guardrail-list">${guardrail("Human approval for financial changes", "Recommendations can be prepared, but provider-side changes require an owner approval.", true, "approval")}${guardrail("Limit agent access to assigned scope", "Agents only use the mock cost and workload scope assigned to their role.", true, "scope")}${guardrail("Require traceable recommendation evidence", "Each proposed action includes a source signal, estimated savings, and risk level.", true, "evidence")}${guardrail("Allow autonomous production changes", "Demo-only control. Keep disabled to require human approval.", false, "autonomy")}</div><div class="governance-log"><b>Governance activity</b><ul id="governanceLog"><li>Fleet initialized · 10 specialist identities verified</li><li>Approval boundary active · production changes require owner review</li></ul></div>`)}`;
    default:
      return "";
  }
}

function rangeInput(id, label, min, max, value, suffix) {
  return `<label class="range-control"><span>${label}</span><b id="${id}Label">${value}${suffix}</b><input id="${id}" type="range" min="${min}" max="${max}" value="${value}" /></label>`;
}

function guardrail(title, description, checked, key) {
  return `<label class="guardrail-row"><span><b>${title}</b><small>${description}</small></span><input type="checkbox" data-guardrail="${key}" ${checked ? "checked" : ""} /><i></i></label>`;
}

function updateFeature(section = featureView.dataset.section) {
  if (section === "Multi-Cloud Comparison") updateComparison();
  if (section === "Workload Intelligence") renderWorkloads();
  if (section === "AI Spend Governance") renderAiUseCases();
  if (section === "Cloud Commitments") updateCoverage();
  if (section === "Scenario Planner") updateScenario();
  if (section === "Optimization Board") renderOptimizations();
}

function updateComparison() {
  const profile = document.querySelector("#comparisonProfile")?.value;
  const annual = document.querySelector("#billingView")?.value === "annual";
  if (!profile) return;
  const costs = {
    general: [["Azure", 41200], ["AWS", 43800], ["GCP", 39700]],
    database: [["Azure", 68400], ["AWS", 72100], ["GCP", 63300]],
    ai: [["Azure", 95600], ["AWS", 112400], ["GCP", 87300]],
  }[profile];
  const lowest = Math.min(...costs.map(([, value]) => value));
  document.querySelector("#comparisonResult").innerHTML = `<div class="comparison-table">${costs.map(([name, monthly]) => {
    const shown = annual ? monthly * 12 : monthly;
    const saving = Math.round((1 - lowest / monthly) * 100);
    const providerClass = name === "Azure" ? "azure" : name === "AWS" ? "aws" : "gcp";
    return `<div class="comparison-row"><span class="provider ${providerClass}">${name}</span><b>$${shown.toLocaleString()}<small> / ${annual ? "year" : "month"}</small></b><span class="comparison-track"><i class="${providerClass}" style="width:${Math.round(monthly / Math.max(...costs.map(([, value]) => value)) * 100)}%"></i></span><span class="${monthly === lowest ? "positive" : "neutral"}">${monthly === lowest ? "Lowest modeled cost" : `${saving}% above lowest`}</span></div>`;
  }).join("")}</div><p class="feature-footnote">Lowest modeled provider for this profile: <b>${costs.find(([, value]) => value === lowest)[0]}</b>. Illustrative unit-price comparison; excludes workload-specific migration costs.</p>`;
}

function renderWorkloads() {
  const body = document.querySelector("#workloadRows");
  if (!body) return;
  const search = document.querySelector("#workloadSearch").value.toLowerCase();
  const filter = document.querySelector("#workloadFilter").value;
  const results = workloadRows.filter((row) => row.join(" ").toLowerCase().includes(search) && (filter === "all" || row[4] === filter));
  body.innerHTML = results.map((row) => {
    const originalIndex = workloadRows.indexOf(row);
    return `<tr><td><b>${row[0]}</b><small>${row[5]}</small></td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td><span class="table-pill">${row[4]}</span></td><td><button class="table-action" data-workload-action="${originalIndex}">${row[5] === "Reviewed" ? "Reviewed ✓" : "Review"}</button></td></tr>`;
  }).join("") || `<tr><td colspan="6" class="empty-table">No matching workloads.</td></tr>`;
}

const aiRows = [
  ["Care assistant", "Customer Ops", 165, "High value"],
  ["Model serving", "Digital", 142, "Review ROI"],
  ["Network anomaly detection", "Network", 118, "High value"],
  ["Agent summarization", "Customer Ops", 92, "Monitor"],
  ["Legacy experiment", "Innovation", 76, "Low adoption"],
];
function renderAiUseCases() {
  const body = document.querySelector("#aiUseCases");
  if (!body) return;
  const threshold = Number(document.querySelector("#aiThreshold").value);
  document.querySelector("#aiThresholdLabel").textContent = `$${threshold}K`;
  const flagged = aiRows.filter(([, , spend]) => spend > threshold);
  document.querySelector("#policyAlertCount").textContent = flagged.length;
  body.innerHTML = aiRows.map(([name, owner, spend, value]) => `<tr><td><b>${name}</b></td><td>${owner}</td><td>$${spend}K</td><td>${value}</td><td><span class="table-pill ${spend > threshold ? "pill-alert" : ""}">${spend > threshold ? "Threshold alert" : "Within policy"}</span></td></tr>`).join("");
}

function updateCoverage() {
  const target = Number(document.querySelector("#coverageTarget")?.value);
  if (!target) return;
  const current = 72;
  const gap = target - current;
  document.querySelector("#coverageResult").innerHTML = `<div class="coverage-meter"><span>Current portfolio commitment coverage</span><b>${current}% → ${target}%</b><div class="progress-track"><i style="width:${Math.min(target, 100)}%"></i></div><p>${gap > 0 ? `A ${gap} point coverage increase is needed. Validate demand stability and expiration timing before committing.` : "Current coverage meets this target. Focus on utilization and renewal timing."}</p></div>`;
}

function updateScenario() {
  const growth = Number(document.querySelector("#cloudGrowth")?.value);
  if (growth === undefined || Number.isNaN(growth)) return;
  const aiGrowth = Number(document.querySelector("#aiGrowth").value);
  const savingsRate = Number(document.querySelector("#savingsRate").value);
  document.querySelector("#cloudGrowthLabel").textContent = `${growth}%`;
  document.querySelector("#aiGrowthLabel").textContent = `${aiGrowth}%`;
  document.querySelector("#savingsRateLabel").textContent = `${savingsRate}%`;
  const spend = 29.7 * (1 + (growth - 7) / 100) - 29.7 * (savingsRate / 100) * 0.25;
  const variance = spend - 27.4;
  const savings = 18.7 * (savingsRate / 100);
  const aiSpend = 14.8 * (1 + (aiGrowth - 84) / 100);
  document.querySelector("#scenarioSpend").textContent = `$${spend.toFixed(1)}M`;
  document.querySelector("#scenarioVariance").textContent = `$${Math.max(0, variance).toFixed(1)}M ${variance >= 0 ? "above" : "below"} approved budget`;
  document.querySelector("#scenarioSavings").textContent = `$${savings.toFixed(1)}M`;
  document.querySelector("#scenarioAiSpend").textContent = `$${aiSpend.toFixed(1)}M`;
  document.querySelector("#scenarioAiDelta").textContent = `${aiGrowth}% assumed year-over-year growth`;
}

function renderOptimizations() {
  const body = document.querySelector("#optimizationRows");
  if (!body) return;
  body.innerHTML = optimizationRows.map(([name, scope, savings, risk], index) => `<tr><td><b>${name}</b></td><td>${scope}</td><td>${savings}</td><td><span class="table-pill">${risk} risk</span></td><td><button class="table-action approve-action" data-optimization-action="${index}">Approve for review</button></td></tr>`).join("") || `<tr><td colspan="5" class="empty-table">All recommendations have been reviewed.</td></tr>`;
  document.querySelector("#openOpportunityCount").textContent = optimizationRows.length;
  const total = optimizationRows.reduce((sum, row) => sum + Number(row[2].replace(/[$M]/g, "")), 0);
  document.querySelector("#openSavings").textContent = `$${total.toFixed(2)}M`;
}

function submitAgentQuestion(question) {
  const response = document.querySelector("#agentResponse");
  const prompt = question.toLowerCase();
  let answer;
  if (prompt.includes("save") || prompt.includes("optim")) {
    answer = "The portfolio has $18.7M in identified savings across 137 recommendations. The largest demo opportunity is rightsizing video workers ($2.4M), followed by scheduling non-production clusters ($1.8M).";
  } else if (prompt.includes("ai") || prompt.includes("model") || prompt.includes("agent")) {
    answer = "AI and model spend is $14.8M, up 84% year over year. Eleven agents are flagged for low ROI, representing $2.2M in spend. Review usage, owner attribution, and value signals before expanding capacity.";
  } else if (prompt.includes("forecast") || prompt.includes("budget") || prompt.includes("overrun")) {
    answer = "Quarter-end spend is forecast at $29.7M, about $2.3M above the approved budget. At current growth, the projected annual overrun is $9.4M. AI workloads contribute 58% of the variance.";
  } else {
    answer = "Annualized multi-cloud spend is $112.4M, up 7.2% quarter over quarter. Azure is 43% of the portfolio, AWS 35%, and Google Cloud 22%. The largest next step is to review the $18.7M savings pipeline and forecast variance.";
  }
  response.innerHTML = `<span class="agent-avatar purple-bg">◈</span><div><b>FinOps Agent · Portfolio analysis</b><p>${answer}</p><small>Evidence: normalized provider spend, forecast model, and recommendation inventory · Demo data</small></div>`;
}

featureView.addEventListener("submit", (event) => {
  if (event.target.id !== "agentQuestionForm") return;
  event.preventDefault();
  const input = document.querySelector("#agentQuestion");
  submitAgentQuestion(input.value);
  input.value = "";
});

featureView.addEventListener("input", () => updateFeature());
featureView.addEventListener("change", (event) => {
  updateFeature();
  if (event.target.matches("[data-guardrail]")) {
    const key = event.target.dataset.guardrail;
    const messages = {
      approval: "Financial changes now " + (event.target.checked ? "require" : "do not require") + " an approval.",
      scope: "Agent data scope " + (event.target.checked ? "is restricted to assigned roles." : "restriction is disabled."),
      evidence: "Evidence " + (event.target.checked ? "is required" : "is optional") + " for recommendations.",
      autonomy: "Autonomous production changes " + (event.target.checked ? "enabled in this simulation" : "disabled; owner approval retained."),
    };
    const log = document.querySelector("#governanceLog");
    const item = document.createElement("li");
    item.textContent = `${new Date().toLocaleTimeString()} · ${messages[key]}`;
    log.prepend(item);
  }
});

featureView.addEventListener("click", (event) => {
  const prompt = event.target.closest("[data-prompt]");
  if (prompt) {
    submitAgentQuestion(prompt.dataset.prompt);
    return;
  }
  const workloadAction = event.target.closest("[data-workload-action]");
  if (workloadAction) {
    workloadRows[Number(workloadAction.dataset.workloadAction)][5] = "Reviewed";
    renderWorkloads();
    return;
  }
  const optimizationAction = event.target.closest("[data-optimization-action]");
  if (optimizationAction) {
    const [name] = optimizationRows.splice(Number(optimizationAction.dataset.optimizationAction), 1)[0];
    renderOptimizations();
    showToast(`${name} moved to the approved review queue.`);
  }
});

featureView.addEventListener("click", (event) => {
  if (event.target.id !== "runAgents") return;
  const button = event.target;
  const steps = [...document.querySelectorAll("#agentTimeline > div")];
  button.disabled = true;
  button.textContent = "Agents working…";
  document.querySelector("#agentConclusion").hidden = true;
  steps.forEach((step, index) => {
    step.classList.remove("complete", "working");
    step.lastElementChild.textContent = "Waiting for run";
    window.setTimeout(() => {
      step.classList.add("working");
      step.lastElementChild.textContent = "Analyzing signal…";
    }, index * 700);
    window.setTimeout(() => {
      step.classList.remove("working");
      step.classList.add("complete");
      step.lastElementChild.textContent = "Complete";
      if (index === steps.length - 1) {
        const conclusion = document.querySelector("#agentConclusion");
        conclusion.innerHTML = "<b>Recommendation ready for human review</b><p>Right-size the GPU serving pool and add scale-to-zero outside peak hours. Estimated annual savings: <strong>$1.2M</strong>. No production change has been applied.</p>";
        conclusion.hidden = false;
        button.disabled = false;
        button.textContent = "Run analysis again";
      }
    }, index * 700 + 550);
  });
});

function renderWalkthrough() {
  walkthroughTiles.innerHTML = capabilities.map((capability, index) => `
    <button class="walkthrough-tile${index === selectedCapability ? " selected" : ""}" data-capability="${index}" aria-current="${index === selectedCapability ? "step" : "false"}">
      <span class="tile-icon">${capability.icon}</span>
      <span><small>0${index + 1}</small><b>${capability.title}</b></span>
      <span class="tile-chevron">›</span>
    </button>
  `).join("");

  const capability = capabilities[selectedCapability];
  walkthroughDetail.innerHTML = `
    <p class="eyebrow cyan">${capability.label}</p>
    <h3>${capability.title}</h3>
    <div class="walkthrough-explanation">
      <section><span class="explanation-icon">↗</span><div><b>What the solution does</b><p>${capability.does}</p></div></section>
      <section><span class="explanation-icon why-icon">◎</span><div><b>Why it matters</b><p>${capability.why}</p></div></section>
    </div>
    <div class="outcome-heading"><span>BUSINESS OUTCOMES &amp; KPIs</span><small>Illustrative demo data</small></div>
    <div class="outcome-grid">${capability.outcomes.map(([value, label]) => `
      <div class="outcome-card"><strong>${value}</strong><span>${label}</span></div>
    `).join("")}</div>
  `;
  walkthroughProgress.textContent = `CAPABILITY ${String(selectedCapability + 1).padStart(2, "0")} / ${String(capabilities.length).padStart(2, "0")}`;
  walkthroughPrev.disabled = selectedCapability === 0;
  walkthroughNext.textContent = selectedCapability === capabilities.length - 1 ? "Finish walkthrough ✓" : "Next capability →";
  walkthroughTiles.querySelectorAll(".walkthrough-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      selectedCapability = Number(tile.dataset.capability);
      renderWalkthrough();
    });
  });
}

function openWalkthrough() {
  selectedCapability = 0;
  renderWalkthrough();
  walkthrough.classList.add("open");
  walkthrough.setAttribute("aria-hidden", "false");
  document.querySelector("#closeWalkthrough").focus();
}

function closeWalkthrough() {
  walkthrough.classList.remove("open");
  walkthrough.setAttribute("aria-hidden", "true");
}

walkthroughPrev.addEventListener("click", () => {
  if (selectedCapability > 0) {
    selectedCapability -= 1;
    renderWalkthrough();
  }
});

walkthroughNext.addEventListener("click", () => {
  if (selectedCapability < capabilities.length - 1) {
    selectedCapability += 1;
    renderWalkthrough();
  } else {
    closeWalkthrough();
    showToast("Walkthrough complete — explore any dashboard KPI for its provider breakdown.");
  }
});

document.querySelector("#closeWalkthrough").addEventListener("click", closeWalkthrough);
walkthrough.addEventListener("click", (event) => {
  if (event.target === walkthrough) closeWalkthrough();
});
renderWalkthrough();
