import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  Building2,
  Check,
  ClipboardList,
  Copy,
  DollarSign,
  FileText,
  Gauge,
  Layers3,
  MessageSquareText,
  Play,
  ReceiptText,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Send,
  TimerReset,
  Wand2,
} from "lucide-react";
import "./styles.css";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const businessProfiles = {
  Dental: {
    label: "Dental clinic",
    baseline: "missed appointments, review load, privacy-sensitive records",
    rate: 85,
    defaultLoops: ["no-show", "review"],
  },
  Medspa: {
    label: "Med-spa",
    baseline: "chair utilization, waitlist recovery, content demand",
    rate: 80,
    defaultLoops: ["no-show", "content"],
  },
  Contractor: {
    label: "Contractor",
    baseline: "slow quoting, lost leads, owner bottleneck",
    rate: 95,
    defaultLoops: ["quote", "review"],
  },
  Accountant: {
    label: "Accounting firm",
    baseline: "receipt cleanup, monthly summaries, compliance anxiety",
    rate: 100,
    defaultLoops: ["bookkeeping", "quote"],
  },
};

const loopCatalog = [
  {
    id: "review",
    name: "Review Response",
    icon: MessageSquareText,
    price: 498,
    hours: 8,
    confidence: 93,
    metric: "replies approved",
    color: "green",
    summary:
      "Triage reviews locally, draft on-brand replies, and route sensitive reviews for owner approval.",
    trigger: "New public review arrives",
    classify: "Detect rating, tone, refund risk, and human-review flags",
    draft: "Write a reply in the owner's voice with the exact detail mentioned",
    prompt:
      "Write a public review reply under 60 words. Thank the customer by first name, reference the specific detail they mentioned, match the owner's voice, and flag negative reviews for approval.",
  },
  {
    id: "no-show",
    name: "No-Show Recovery",
    icon: TimerReset,
    price: 620,
    hours: 18,
    confidence: 88,
    metric: "slots recovered",
    color: "cyan",
    summary:
      "Classify reminder replies, refill cancellations from the waitlist, and protect high-value appointments.",
    trigger: "Reminder reply or cancellation lands",
    classify: "Classify confirm, cancel, reschedule, question, or urgent issue",
    draft: "Draft the waitlist fill message and warm rebooking note",
    prompt:
      "A paid appointment slot just opened. Write a short SMS to the next waitlisted client with urgency but no pressure, then write a warm rebooking note for the client who cancelled.",
  },
  {
    id: "quote",
    name: "Quote & Estimate",
    icon: ClipboardList,
    price: 375,
    hours: 26,
    confidence: 84,
    metric: "quote speed",
    color: "orange",
    summary:
      "Extract scope, apply a rate card, draft a line-item quote, and flag ambiguous work for review.",
    trigger: "New quote request arrives",
    classify: "Extract scope, unknowns, location, urgency, and rate-card matches",
    draft: "Build a first-pass line-item estimate with owner-input flags",
    prompt:
      "Extract billable line items from this inquiry, price only from the rate card, list anything ambiguous under needs_owner_input, and write a confident cover note.",
  },
  {
    id: "bookkeeping",
    name: "Bookkeeping",
    icon: ReceiptText,
    price: 950,
    hours: 14,
    confidence: 79,
    metric: "items coded",
    color: "green",
    summary:
      "Extract transaction details, categorize against a chart of accounts, and queue risky entries for signoff.",
    trigger: "Receipt or transaction appears",
    classify: "Extract vendor, amount, date, category fit, duplicate risk, and threshold flags",
    draft: "Suggest account code and a plain-English monthly note",
    prompt:
      "Code this transaction against the chart of accounts. Return account, confidence, duplicate or large-transaction flag, and a short note for the approval queue.",
  },
  {
    id: "content",
    name: "Content Repurposing",
    icon: RefreshCw,
    price: 1400,
    hours: 20,
    confidence: 91,
    metric: "posts shipped",
    color: "cyan",
    summary:
      "Turn one source asset into platform-native posts while preserving voice and measuring engagement.",
    trigger: "Source asset drops into the content folder",
    classify: "Identify strongest idea, audience angle, and usable clips or sections",
    draft: "Fan out into X, LinkedIn, newsletter, YouTube, and Instagram copy",
    prompt:
      "Reshape this source asset into one native platform post. Lead with the strongest idea, keep the brand voice, avoid hashtag stuffing, and output only the post text.",
  },
];

const savedScenarios = [
  {
    name: "Austin Dental",
    business: "Dental",
    loops: ["no-show", "review"],
    laborRate: 85,
    margin: 32,
    privacyBox: true,
  },
  {
    name: "Remodel Quote Desk",
    business: "Contractor",
    loops: ["quote", "review", "content"],
    laborRate: 95,
    margin: 34,
    privacyBox: false,
  },
  {
    name: "Bookkeeping Cleanup",
    business: "Accountant",
    loops: ["bookkeeping", "quote"],
    laborRate: 100,
    margin: 36,
    privacyBox: true,
  },
];

const navItems = [
  { label: "Price", icon: Gauge, active: true },
  { label: "Loops", icon: Layers3 },
  { label: "Clients", icon: Building2 },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings2 },
];

function App() {
  const [business, setBusiness] = useState("Dental");
  const [selected, setSelected] = useState(
    businessProfiles.Dental.defaultLoops,
  );
  const [laborRate, setLaborRate] = useState(businessProfiles.Dental.rate);
  const [margin, setMargin] = useState(32);
  const [privacyBox, setPrivacyBox] = useState(true);
  const [activeScenario, setActiveScenario] = useState("Austin Dental");
  const [generatedProposal, setGeneratedProposal] = useState("");

  const activeLoops = loopCatalog.filter((loop) => selected.includes(loop.id));
  const primaryLoop = activeLoops[0] ?? loopCatalog[0];

  const totals = useMemo(() => {
    const software = activeLoops.reduce((sum, loop) => sum + loop.price, 0);
    const hours = activeLoops.reduce((sum, loop) => sum + loop.hours, 0);
    const labor = hours * laborRate;
    const value = software + labor;
    const monthly = Math.round((value * margin) / 100 / 50) * 50;
    const setup = Math.max(
      4000,
      Math.round((activeLoops.length * 1750 + (privacyBox ? 900 : 0)) / 250) *
        250,
    );

    return {
      software,
      hours,
      labor,
      value,
      monthly,
      setup,
      savings: Math.max(value - monthly, 0),
    };
  }, [activeLoops, laborRate, margin, privacyBox]);

  const toggleLoop = (id) => {
    setActiveScenario("Custom package");
    setSelected((current) => {
      if (current.includes(id)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== id);
      }
      return [...current, id];
    });
  };

  const selectBusiness = (key) => {
    setBusiness(key);
    setLaborRate(businessProfiles[key].rate);
    setSelected(businessProfiles[key].defaultLoops);
    setPrivacyBox(key === "Dental" || key === "Accountant");
    setActiveScenario("Custom package");
  };

  const applyScenario = (scenario) => {
    setBusiness(scenario.business);
    setSelected(scenario.loops);
    setLaborRate(scenario.laborRate);
    setMargin(scenario.margin);
    setPrivacyBox(scenario.privacyBox);
    setActiveScenario(scenario.name);
    setGeneratedProposal("");
  };

  const exportProposal = () => {
    setGeneratedProposal(
      buildProposal({
        activeLoops,
        businessLabel: businessProfiles[business].label,
        privacyBox,
        totals,
      }),
    );
  };

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="brand-mark" aria-label="Loop Studio">
          <Sparkles size={18} />
        </div>
        <nav className="nav-stack">
          {navItems.map((item) => (
            <button
              className={`icon-button ${item.active ? "active" : ""}`}
              type="button"
              key={item.label}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon size={19} />
            </button>
          ))}
        </nav>
        <button
          className="icon-button bottom"
          type="button"
          aria-label="Run demo"
          title="Run demo"
        >
          <Play size={18} />
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>Loop Studio</h1>
            <p>Price AI automation packages against the software and labor they replace.</p>
          </div>
          <div className="command-bar">
            <Search size={17} />
            <span>Find loop, metric, or client</span>
            <kbd>Ctrl K</kbd>
          </div>
        </header>

        <div className="content-grid">
          <section className="pricing-panel" aria-label="Package pricing workspace">
            <div className="panel-heading">
              <div>
                <h2>Price a package</h2>
                <p>{businessProfiles[business].baseline}</p>
              </div>
              <button className="secondary-button" type="button">
                <Wand2 size={16} />
                Draft prompts
              </button>
            </div>

            <div className="business-tabs" aria-label="Business type">
              {Object.entries(businessProfiles).map(([key, profile]) => (
                <button
                  key={key}
                  type="button"
                  className={business === key ? "selected" : ""}
                  onClick={() => selectBusiness(key)}
                >
                  {profile.label}
                </button>
              ))}
            </div>

            <div className="scenario-strip" aria-label="Saved client scenarios">
              <span>Saved scenarios</span>
              {savedScenarios.map((scenario) => (
                <button
                  key={scenario.name}
                  type="button"
                  className={activeScenario === scenario.name ? "selected" : ""}
                  onClick={() => applyScenario(scenario)}
                >
                  {scenario.name}
                </button>
              ))}
            </div>

            <div className="loop-grid">
              {loopCatalog.map((loop) => {
                const Icon = loop.icon;
                const isSelected = selected.includes(loop.id);
                return (
                  <button
                    className={`loop-card ${isSelected ? "selected" : ""}`}
                    type="button"
                    key={loop.id}
                    onClick={() => toggleLoop(loop.id)}
                  >
                    <span className={`loop-icon ${loop.color}`}>
                      <Icon size={19} />
                    </span>
                    <span className="loop-copy">
                      <strong>{loop.name}</strong>
                      <small>{loop.summary}</small>
                    </span>
                    <span className="loop-meta">
                      <span>{currency.format(loop.price)}/mo</span>
                      <span>{loop.hours}h</span>
                    </span>
                    <span className="check-dot" aria-hidden="true">
                      {isSelected && <Check size={14} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="calculator-grid">
              <div className="control-panel">
                <div className="control-row">
                  <label htmlFor="laborRate">
                    Labor value
                    <span>{currency.format(laborRate)}/hour</span>
                  </label>
                  <input
                    id="laborRate"
                    type="range"
                    min="50"
                    max="130"
                    value={laborRate}
                    onChange={(event) => {
                      setLaborRate(Number(event.target.value));
                      setActiveScenario("Custom package");
                    }}
                  />
                </div>
                <div className="control-row">
                  <label htmlFor="margin">
                    Retainer share
                    <span>{margin}% of created value</span>
                  </label>
                  <input
                    id="margin"
                    type="range"
                    min="25"
                    max="40"
                    value={margin}
                    onChange={(event) => {
                      setMargin(Number(event.target.value));
                      setActiveScenario("Custom package");
                    }}
                  />
                </div>
                <label className="toggle-line">
                  <input
                    type="checkbox"
                    checked={privacyBox}
                    onChange={(event) => {
                      setPrivacyBox(event.target.checked);
                      setActiveScenario("Custom package");
                    }}
                  />
                  <span>
                    <ShieldCheck size={17} />
                    Include on-prem privacy box
                  </span>
                </label>
              </div>

              <div className="value-panel">
                <Stat label="Value replaced" value={currency.format(totals.value)} />
                <Stat label="Setup fee" value={currency.format(totals.setup)} />
                <Stat label="Monthly retainer" value={currency.format(totals.monthly)} highlight />
              </div>
            </div>

            <section className="workflow-panel" aria-label="AI loop workflow">
              <div className="workflow-heading">
                <div>
                  <h2>AI loop workflow</h2>
                  <p>{primaryLoop.name}: trigger to approved action</p>
                </div>
                <span className="workflow-status">
                  <Sparkles size={14} />
                  Simulated run
                </span>
              </div>
              <div className="workflow-steps">
                <WorkflowStep label="Trigger" text={primaryLoop.trigger} active />
                <WorkflowStep label="Classify" text={primaryLoop.classify} />
                <WorkflowStep label="Draft" text={primaryLoop.draft} />
                <WorkflowStep label="Approve" text="Queue risky outputs for owner signoff" />
                <WorkflowStep label="Send" text="Post, text, email, or save the approved action" />
              </div>
            </section>
          </section>

          <aside className="proposal-panel" aria-label="Proposal preview">
            <div className="proposal-top">
              <div>
                <p>Proposal preview</p>
                <h2>{businessProfiles[business].label}</h2>
              </div>
              <button
                className="icon-button dark"
                type="button"
                aria-label="Open proposal"
                title="Open proposal"
              >
                <ArrowUpRight size={17} />
              </button>
            </div>

            <div className="price-block">
              <span>Recommended retainer</span>
              <strong>{currency.format(totals.monthly)}</strong>
              <small>{currency.format(totals.savings)} estimated monthly net savings</small>
            </div>

            <div className="proposal-list">
              {activeLoops.map((loop) => (
                <div className="proposal-item" key={loop.id}>
                  <div>
                    <strong>{loop.name}</strong>
                    <span>{loop.metric}</span>
                  </div>
                  <GaugeMeter value={loop.confidence} />
                </div>
              ))}
            </div>

            <div className="stack-card">
              <div className="stack-heading">
                <Bot size={18} />
                <span>Routing plan</span>
              </div>
              <div className="route-line">
                <span>Local triage</span>
                <strong>{privacyBox ? "On-prem" : "Cloud optional"}</strong>
              </div>
              <div className="route-line">
                <span>Judgment calls</span>
                <strong>Claude Sonnet</strong>
              </div>
              <div className="route-line">
                <span>Approval gate</span>
                <strong>Before risky actions</strong>
              </div>
            </div>

            <div className="math-card">
              <div>
                <DollarSign size={17} />
                <span>12-month model</span>
              </div>
              <p>
                {currency.format(totals.setup)} setup plus {currency.format(totals.monthly)}
                /mo replaces {currency.format(totals.software)}/mo in tools and returns{" "}
                {totals.hours} hours each month.
              </p>
            </div>

            <div className="prompt-card">
              <div>
                <Copy size={17} />
                <span>Prompt pack preview</span>
              </div>
              <p>{primaryLoop.prompt}</p>
            </div>

            {generatedProposal && (
              <div className="generated-proposal" aria-live="polite">
                <div>
                  <FileText size={17} />
                  <span>Generated proposal text</span>
                </div>
                <pre>{generatedProposal}</pre>
              </div>
            )}

            <button className="primary-button" type="button" onClick={exportProposal}>
              <FileText size={17} />
              {generatedProposal ? "Regenerate proposal" : "Export proposal"}
              <Send size={16} />
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function WorkflowStep({ label, text, active = false }) {
  return (
    <div className={`workflow-step ${active ? "active" : ""}`}>
      <span>{label}</span>
      <p>{text}</p>
    </div>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div className={`stat ${highlight ? "highlight" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function GaugeMeter({ value }) {
  return (
    <div className="gauge-meter" aria-label={`${value}% confidence`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function buildProposal({ activeLoops, businessLabel, privacyBox, totals }) {
  const loopNames = activeLoops.map((loop) => loop.name).join(", ");
  const outcomes = activeLoops
    .map((loop) => `- ${loop.name}: ${loop.summary}`)
    .join("\n");

  return `AI Automation Loop Proposal

Client type: ${businessLabel}
Selected loops: ${loopNames}

Recommended package:
- Setup fee: ${currency.format(totals.setup)}
- Monthly retainer: ${currency.format(totals.monthly)}
- Estimated value replaced: ${currency.format(totals.value)} per month
- Estimated net monthly savings: ${currency.format(totals.savings)}

What this replaces:
${outcomes}

Operating model:
- Trigger: each loop starts from a real business event.
- Classify: the system decides whether the action is safe to automate.
- Draft: Claude-style prompts create the reply, quote, note, or content asset.
- Approve: sensitive or low-confidence outputs wait for human review.
- Send: approved actions are posted, messaged, emailed, or queued.

Privacy posture: ${privacyBox ? "on-prem triage recommended for sensitive data." : "cloud-first routing is acceptable for this package."}

Next step: confirm integrations, collect voice/rate-card examples, and run a 7-day pilot before enabling broader automation.`;
}

createRoot(document.getElementById("app")).render(<App />);
