/**
 * Profile definitions and curated idea lists for the Social Post Writer agent.
 * Each profile has its own identity, voice context, and a list of post ideas.
 */

export type PostIdea = {
  id: number;
  post_intent: string;
  trigger_or_spark: string;
  founder_pov: string;
  audience: string;
  sharpness: number; // 1–5
  cta_style: "Reflection" | "Question" | "Mic drop" | "Invite discussion";
  personal_detail_hint: string;
  alreadyDone: boolean;
};

export type ProfileId = "jb" | "ludo" | "simran";

export type Profile = {
  id: ProfileId;
  name: string;
  fullName: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  ideas: PostIdea[];
};

// ─── JB — Co-founder, CFO & CEO ───────────────────────────────────────────────

const JB_IDEAS: PostIdea[] = [
  { id: 1, post_intent: "Hard-earned insight", trigger_or_spark: "Month-end close running late again", founder_pov: "Time pressure is the CFO's permanent background noise", audience: "CFOs / Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Late close night", alreadyDone: false },
  { id: 2, post_intent: "Hard-earned insight", trigger_or_spark: "Reconciling payments across multiple tools", founder_pov: "Fragmentation is the real financial risk", audience: "Finance Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Manual reconciliation moment", alreadyDone: false },
  { id: 3, post_intent: "Hard-earned insight", trigger_or_spark: "Another unexpected payment exception", founder_pov: "Exceptions consume more time than strategy", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Unexpected issue during close", alreadyDone: false },
  { id: 4, post_intent: "Hard-earned insight", trigger_or_spark: "Seeing teams triple-check payments", founder_pov: "Control exists because systems aren't trusted", audience: "Finance Ops / CFOs", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Double-approval memory", alreadyDone: false },
  { id: 5, post_intent: "Hard-earned insight", trigger_or_spark: "Watching finance teams firefight daily", founder_pov: "Most CFO work is reactive, not strategic", audience: "CFOs", sharpness: 3, cta_style: "Question", personal_detail_hint: "Typical workday snapshot", alreadyDone: false },
  { id: 6, post_intent: "Story from CFO life", trigger_or_spark: "Signing off payroll late at night", founder_pov: "Payroll is trust, not just a process", audience: "CFOs", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Pre-payroll stress", alreadyDone: false },
  { id: 7, post_intent: "Story from CFO life", trigger_or_spark: "Explaining a delay to the CEO", founder_pov: "CFOs absorb uncertainty so others don't", audience: "Executives", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Board or exec meeting", alreadyDone: false },
  { id: 8, post_intent: "Story from CFO life", trigger_or_spark: "Preparing for an audit", founder_pov: "Audits expose weak systems, not weak teams", audience: "CFOs / Finance Ops", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Audit prep week", alreadyDone: false },
  { id: 9, post_intent: "Story from CFO life", trigger_or_spark: "Handling a payment mistake", founder_pov: "Finance errors are emotional, not theoretical", audience: "CFOs", sharpness: 4, cta_style: "Reflection", personal_detail_hint: "Incident response moment", alreadyDone: false },
  { id: 10, post_intent: "Story from CFO life", trigger_or_spark: "First time trusting automation", founder_pov: "Letting go of manual control is hard", audience: "Finance Leaders", sharpness: 2, cta_style: "Question", personal_detail_hint: "Initial hesitation moment", alreadyDone: false },
  { id: 11, post_intent: "Opinion / Contrarian", trigger_or_spark: "Hearing 'finance slows the business'", founder_pov: "Finance doesn't slow growth — chaos does", audience: "Founders / Executives", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Frustrating comment", alreadyDone: false },
  { id: 12, post_intent: "Opinion / Contrarian", trigger_or_spark: "Seeing dashboards multiply", founder_pov: "More dashboards don't reduce risk", audience: "Finance Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Tool overload", alreadyDone: false },
  { id: 13, post_intent: "Opinion / Contrarian", trigger_or_spark: "Discussions about crypto risk", founder_pov: "Opacity is risk — not the payment rail", audience: "CFOs", sharpness: 5, cta_style: "Mic drop", personal_detail_hint: "Risk committee discussion", alreadyDone: false },
  { id: 14, post_intent: "Opinion / Contrarian", trigger_or_spark: "Manual approvals everywhere", founder_pov: "Control without visibility is fake control", audience: "Finance Ops", sharpness: 4, cta_style: "Reflection", personal_detail_hint: "Approval bottleneck", alreadyDone: true },
  { id: 15, post_intent: "Opinion / Contrarian", trigger_or_spark: "Relying on banks for speed", founder_pov: "Banks optimize for stability, not operations", audience: "CFOs", sharpness: 4, cta_style: "Question", personal_detail_hint: "Delayed transfer", alreadyDone: false },
  { id: 16, post_intent: "Educational", trigger_or_spark: "Explaining cash flow to non-finance teams", founder_pov: "Cash visibility beats cash balance", audience: "Executives / Founders", sharpness: 2, cta_style: "Question", personal_detail_hint: "Internal explanation", alreadyDone: false },
  { id: 17, post_intent: "Educational", trigger_or_spark: "Audit requests for transaction trails", founder_pov: "Audit readiness is designed, not reported", audience: "CFOs", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Auditor question", alreadyDone: false },
  { id: 18, post_intent: "Educational", trigger_or_spark: "Global payments breaking processes", founder_pov: "International finance exposes weak tooling", audience: "Finance Leaders", sharpness: 3, cta_style: "Invite discussion", personal_detail_hint: "Country edge case", alreadyDone: false },
  { id: 19, post_intent: "Educational", trigger_or_spark: "Payroll complexity across countries", founder_pov: "Payroll shows where systems break first", audience: "Finance Ops", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Cross-border payroll issue", alreadyDone: false },
  { id: 20, post_intent: "Educational", trigger_or_spark: "Treasury management confusion", founder_pov: "Treasury is about timing, not just money", audience: "Founders / CFOs", sharpness: 2, cta_style: "Question", personal_detail_hint: "Strategy discussion", alreadyDone: false },
  { id: 21, post_intent: "Failure / Reflection", trigger_or_spark: "Missing an internal deadline", founder_pov: "Delays ripple far beyond finance", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Internal apology moment", alreadyDone: false },
  { id: 22, post_intent: "Failure / Reflection", trigger_or_spark: "Underestimating onboarding effort", founder_pov: "Implementation pain is real cost", audience: "Finance Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Tool rollout memory", alreadyDone: false },
  { id: 23, post_intent: "Failure / Reflection", trigger_or_spark: "Trusting a tool too late", founder_pov: "Manual processes fail quietly", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Post-mortem moment", alreadyDone: false },
  { id: 24, post_intent: "Failure / Reflection", trigger_or_spark: "Assuming data accuracy", founder_pov: "Assumptions are the enemy of control", audience: "Finance Leaders", sharpness: 3, cta_style: "Mic drop", personal_detail_hint: "Data discrepancy", alreadyDone: false },
  { id: 25, post_intent: "Failure / Reflection", trigger_or_spark: "Over-relying on spreadsheets", founder_pov: "Spreadsheets don't scale accountability", audience: "CFOs", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Spreadsheet chaos", alreadyDone: false },
  { id: 26, post_intent: "Behind-the-scenes", trigger_or_spark: "Looking at calendar before month-end", founder_pov: "CFO time is borrowed time", audience: "CFOs", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Month-end week", alreadyDone: false },
  { id: 27, post_intent: "Behind-the-scenes", trigger_or_spark: "Switching between ops and strategy", founder_pov: "Context switching drains decision quality", audience: "Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Packed day", alreadyDone: false },
  { id: 28, post_intent: "Behind-the-scenes", trigger_or_spark: "Late-night Slack messages", founder_pov: "Finance issues don't respect office hours", audience: "CFOs", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "After-hours ping", alreadyDone: false },
  { id: 29, post_intent: "Behind-the-scenes", trigger_or_spark: "Preparing board materials", founder_pov: "Board decks hide a lot of chaos", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Board prep night", alreadyDone: false },
  { id: 30, post_intent: "Behind-the-scenes", trigger_or_spark: "Explaining finance pressure to family", founder_pov: "CFO stress is invisible outside work", audience: "CFOs", sharpness: 1, cta_style: "Reflection", personal_detail_hint: "Personal conversation", alreadyDone: false },
  { id: 31, post_intent: "Hard-earned insight", trigger_or_spark: "Reviewing approval chains", founder_pov: "Too many approvals hide accountability", audience: "Finance Ops / CFOs", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Approval flow review", alreadyDone: false },
  { id: 32, post_intent: "Hard-earned insight", trigger_or_spark: "Seeing recurring payment delays", founder_pov: "Delays compound silently", audience: "Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Repeated issue", alreadyDone: false },
  { id: 33, post_intent: "Hard-earned insight", trigger_or_spark: "Reconciling crypto and fiat together", founder_pov: "Unified systems reduce cognitive load", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "System comparison", alreadyDone: false },
  { id: 34, post_intent: "Hard-earned insight", trigger_or_spark: "Watching finance teams burn out", founder_pov: "Burnout is a systems failure", audience: "Finance Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Team fatigue", alreadyDone: false },
  { id: 35, post_intent: "Hard-earned insight", trigger_or_spark: "Tracking spend across tools", founder_pov: "Visibility is control", audience: "CFOs", sharpness: 3, cta_style: "Mic drop", personal_detail_hint: "Spend review", alreadyDone: false },
  { id: 36, post_intent: "Opinion / Contrarian", trigger_or_spark: "Hearing 'we'll fix it later'", founder_pov: "Finance debt is real debt", audience: "Executives", sharpness: 5, cta_style: "Mic drop", personal_detail_hint: "Leadership discussion", alreadyDone: false },
  { id: 37, post_intent: "Opinion / Contrarian", trigger_or_spark: "Manual controls praised as best practice", founder_pov: "Manual work is not risk management", audience: "Finance Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Best-practice debate", alreadyDone: false },
  { id: 38, post_intent: "Opinion / Contrarian", trigger_or_spark: "Fear of automation", founder_pov: "Automation doesn't remove control — it clarifies it", audience: "Finance Ops", sharpness: 4, cta_style: "Reflection", personal_detail_hint: "Team hesitation", alreadyDone: false },
  { id: 39, post_intent: "Opinion / Contrarian", trigger_or_spark: "Endless reporting requests", founder_pov: "Reports don't fix broken systems", audience: "Executives", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Ad-hoc report request", alreadyDone: false },
  { id: 40, post_intent: "Opinion / Contrarian", trigger_or_spark: "Finance treated as back-office", founder_pov: "Finance is operational infrastructure", audience: "Founders / Executives", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Org structure discussion", alreadyDone: false },
  { id: 41, post_intent: "Educational", trigger_or_spark: "Explaining double payments risk", founder_pov: "Risk lives in process gaps", audience: "Finance Ops", sharpness: 2, cta_style: "Question", personal_detail_hint: "Incident review", alreadyDone: false },
  { id: 42, post_intent: "Educational", trigger_or_spark: "Payment rails misunderstanding", founder_pov: "Speed and control aren't opposites", audience: "CFOs", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Internal debate", alreadyDone: false },
  { id: 43, post_intent: "Educational", trigger_or_spark: "Audit trail design", founder_pov: "Audit trails should be automatic", audience: "Finance Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Audit question", alreadyDone: false },
  { id: 44, post_intent: "Educational", trigger_or_spark: "Cash forecasting struggles", founder_pov: "Forecasts fail without real-time data", audience: "CFOs", sharpness: 3, cta_style: "Invite discussion", personal_detail_hint: "Forecast miss", alreadyDone: false },
  { id: 45, post_intent: "Educational", trigger_or_spark: "Compliance anxiety", founder_pov: "Compliance fear comes from poor tooling", audience: "Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Regulatory discussion", alreadyDone: false },
  { id: 46, post_intent: "Reflection", trigger_or_spark: "Why CFOs sleep lightly", founder_pov: "Responsibility doesn't clock out", audience: "CFOs", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Night thought", alreadyDone: false },
  { id: 47, post_intent: "Reflection", trigger_or_spark: "Trusting systems over people", founder_pov: "Good systems protect people", audience: "Finance Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Leadership moment", alreadyDone: false },
  { id: 48, post_intent: "Reflection", trigger_or_spark: "Letting go of manual habits", founder_pov: "Control evolves with scale", audience: "CFOs", sharpness: 2, cta_style: "Question", personal_detail_hint: "Change moment", alreadyDone: false },
  { id: 49, post_intent: "Reflection", trigger_or_spark: "What I wish founders understood about finance", founder_pov: "Finance absorbs uncertainty", audience: "Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Founder misunderstanding", alreadyDone: false },
  { id: 50, post_intent: "Reflection", trigger_or_spark: "Why CFOs obsess over edge cases", founder_pov: "Edge cases become real cases", audience: "Finance Leaders", sharpness: 3, cta_style: "Mic drop", personal_detail_hint: "Unexpected scenario", alreadyDone: false },
];

// ─── Ludo — Head of Sales & COO ───────────────────────────────────────────────

const LUDO_IDEAS: PostIdea[] = [
  { id: 1, post_intent: "Hard-earned insight", trigger_or_spark: "A deal dying because of compliance concerns", founder_pov: "Sales stalls aren't about price — they're about trust", audience: "Sales Leaders / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Late-stage deal that went dark", alreadyDone: false },
  { id: 2, post_intent: "Hard-earned insight", trigger_or_spark: "A CFO asking about audit trails before signing", founder_pov: "Finance teams buy on accountability, not features", audience: "B2B Sales / Fintech GTM", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Deal-closing question", alreadyDone: false },
  { id: 3, post_intent: "Hard-earned insight", trigger_or_spark: "Watching a deal drag for 6 months over crypto approval", founder_pov: "Enterprise crypto adoption is a change management problem, not a technology one", audience: "Sales Leaders / Fintech", sharpness: 4, cta_style: "Reflection", personal_detail_hint: "Internal approval chain story", alreadyDone: false },
  { id: 4, post_intent: "Hard-earned insight", trigger_or_spark: "Realizing the champion isn't always the decision-maker", founder_pov: "In fintech, you sell to the CFO but you lose to the board", audience: "B2B Sales", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Unexpected veto", alreadyDone: false },
  { id: 5, post_intent: "Story from sales life", trigger_or_spark: "A customer switching from a competitor mid-contract", founder_pov: "Switching happens when the pain of staying beats the pain of change", audience: "Sales Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Inbound switch request", alreadyDone: false },
  { id: 6, post_intent: "Story from sales life", trigger_or_spark: "Getting a 'no' that turned into a 'yes' 8 months later", founder_pov: "Timing is part of every B2B sale", audience: "Sales / Founders", sharpness: 2, cta_style: "Question", personal_detail_hint: "Follow-up that worked", alreadyDone: false },
  { id: 7, post_intent: "Story from sales life", trigger_or_spark: "Closing a deal with a company in 5 countries", founder_pov: "Multi-country customers are your best reference, and your hardest onboard", audience: "Enterprise Sales", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Complex rollout", alreadyDone: false },
  { id: 8, post_intent: "Story from sales life", trigger_or_spark: "A prospect who educated me about their own problem", founder_pov: "The best salespeople listen more than they talk", audience: "Sales Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Discovery call surprise", alreadyDone: false },
  { id: 9, post_intent: "Opinion / Contrarian", trigger_or_spark: "Seeing SDRs spam 1,000 leads a week", founder_pov: "Volume without relevance is just noise", audience: "Sales Leaders / GTM", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Pipeline review", alreadyDone: false },
  { id: 10, post_intent: "Opinion / Contrarian", trigger_or_spark: "Hearing 'our product sells itself'", founder_pov: "Every product needs a human to explain why now", audience: "Founders / Sales", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Founder conversation", alreadyDone: false },
  { id: 11, post_intent: "Opinion / Contrarian", trigger_or_spark: "Sales decks with 40 slides", founder_pov: "If it takes 40 slides to explain your value, you don't have a clear value proposition", audience: "Sales / GTM Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Team prep session", alreadyDone: false },
  { id: 12, post_intent: "Opinion / Contrarian", trigger_or_spark: "Seeing crypto payments framed as risky by finance teams", founder_pov: "The risk isn't crypto — it's opacity. And stablecoins fix that.", audience: "Finance Leaders / Founders", sharpness: 5, cta_style: "Mic drop", personal_detail_hint: "Objection in a call", alreadyDone: false },
  { id: 13, post_intent: "Educational", trigger_or_spark: "Explaining stablecoin AP to a skeptical CFO", founder_pov: "A stablecoin payment is a wire transfer that settles in 3 seconds, not 3 days", audience: "CFOs / Finance Leaders", sharpness: 2, cta_style: "Question", personal_detail_hint: "Discovery call explanation", alreadyDone: false },
  { id: 14, post_intent: "Educational", trigger_or_spark: "A prospect asking how implementation works", founder_pov: "The go-live moment is where most fintech products either win trust or lose it", audience: "Finance Ops / Buyers", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Onboarding walkthrough", alreadyDone: false },
  { id: 15, post_intent: "Educational", trigger_or_spark: "Explaining why crypto payments reduce FX costs", founder_pov: "Every SWIFT transfer you replace with USDC is a fee you stop paying", audience: "CFOs / Finance Teams", sharpness: 3, cta_style: "Invite discussion", personal_detail_hint: "ROI conversation", alreadyDone: false },
  { id: 16, post_intent: "Behind-the-scenes (COO lens)", trigger_or_spark: "Building a sales process from scratch in a new market", founder_pov: "GTM in a new region means unlearning what worked everywhere else", audience: "Founders / GTM Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "New market launch", alreadyDone: false },
  { id: 17, post_intent: "Behind-the-scenes (COO lens)", trigger_or_spark: "Aligning sales and finance on forecasts", founder_pov: "Sales optimism and finance conservatism need to coexist or nothing gets built", audience: "Executives / Operators", sharpness: 3, cta_style: "Question", personal_detail_hint: "Quarterly planning", alreadyDone: false },
  { id: 18, post_intent: "Behind-the-scenes (COO lens)", trigger_or_spark: "Running operations across 4 time zones", founder_pov: "Global operations are a coordination problem, not just a logistics one", audience: "COOs / Operators", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "7am Slack before bed", alreadyDone: false },
  { id: 19, post_intent: "Failure / Reflection", trigger_or_spark: "A deal we should have walked away from sooner", founder_pov: "Bad-fit customers cost more than lost revenue", audience: "Sales Leaders / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Post-mortem review", alreadyDone: false },
  { id: 20, post_intent: "Failure / Reflection", trigger_or_spark: "Hiring a sales rep who was great at demos, terrible at closing", founder_pov: "Demos don't close deals — follow-through does", audience: "Sales Managers", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Hiring post-mortem", alreadyDone: false },
  { id: 21, post_intent: "Failure / Reflection", trigger_or_spark: "Underpricing to win a big deal", founder_pov: "Winning on price trains customers to negotiate on price", audience: "Sales / Founders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Pricing decision regret", alreadyDone: false },
  { id: 22, post_intent: "Hard-earned insight", trigger_or_spark: "Noticing the best deals came from referrals", founder_pov: "Your happiest customers are your best salespeople", audience: "Sales Leaders / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Pipeline source review", alreadyDone: false },
  { id: 23, post_intent: "Hard-earned insight", trigger_or_spark: "A customer expanding after going live", founder_pov: "Expansion revenue is proof you solved the real problem", audience: "Sales / CS Leaders", sharpness: 3, cta_style: "Question", personal_detail_hint: "Expansion call", alreadyDone: false },
  { id: 24, post_intent: "Opinion / Contrarian", trigger_or_spark: "Sales quotas that ignore retention", founder_pov: "A quota that only measures new logos is a quota that destroys trust", audience: "Sales Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "OKR planning debate", alreadyDone: false },
  { id: 25, post_intent: "Reflection", trigger_or_spark: "What selling fintech taught me about buying behavior", founder_pov: "Finance leaders don't buy tools — they buy confidence", audience: "GTM / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Pattern across 100+ deals", alreadyDone: false },
];

// ─── Simran — Head of Community ───────────────────────────────────────────────

const SIMRAN_IDEAS: PostIdea[] = [
  { id: 1, post_intent: "Community insight", trigger_or_spark: "A new member saying 'I finally feel less alone'", founder_pov: "The most valuable thing a community offers isn't content — it's belonging", audience: "Community Builders / Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Onboarding call moment", alreadyDone: false },
  { id: 2, post_intent: "Community insight", trigger_or_spark: "Watching two members solve each other's problems in Slack", founder_pov: "The community is doing the work — your job is to create conditions for it", audience: "Community Builders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Slack thread moment", alreadyDone: false },
  { id: 3, post_intent: "Community insight", trigger_or_spark: "A CFO asking a 'basic' question and getting 12 thoughtful replies", founder_pov: "Safe spaces for 'dumb questions' are the most valuable spaces in professional communities", audience: "Community Builders / Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Community thread screenshot", alreadyDone: false },
  { id: 4, post_intent: "Community insight", trigger_or_spark: "Vetting our 500th member", founder_pov: "Scale without curation is just noise", audience: "Community Leaders", sharpness: 3, cta_style: "Question", personal_detail_hint: "Milestone moment", alreadyDone: false },
  { id: 5, post_intent: "Story from community life", trigger_or_spark: "A member who almost didn't apply", founder_pov: "The people who hesitate to apply are often the ones who get the most value", audience: "Finance Leaders / Community", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Onboarding story", alreadyDone: false },
  { id: 6, post_intent: "Story from community life", trigger_or_spark: "An in-person dinner where two strangers became business partners", founder_pov: "You can't engineer serendipity — but you can create conditions for it", audience: "Community Builders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Dubai or Paris event", alreadyDone: false },
  { id: 7, post_intent: "Story from community life", trigger_or_spark: "A member sharing a mistake that helped 30 others avoid it", founder_pov: "Vulnerability in professional communities is a superpower, not a liability", audience: "Finance Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Candid Slack post", alreadyDone: false },
  { id: 8, post_intent: "Story from community life", trigger_or_spark: "Hosting a CFO AMA where the 'host' barely spoke", founder_pov: "The best community events are the ones where the community runs itself", audience: "Community Builders", sharpness: 2, cta_style: "Question", personal_detail_hint: "AMA moment", alreadyDone: false },
  { id: 9, post_intent: "Opinion / Contrarian", trigger_or_spark: "Communities that measure engagement by post count", founder_pov: "Lurkers aren't passive — they're listening, learning, and trusting. Count them.", audience: "Community Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Analytics review", alreadyDone: false },
  { id: 10, post_intent: "Opinion / Contrarian", trigger_or_spark: "Communities that charge for access and lose the honesty", founder_pov: "Paid communities attract buyers. Free, vetted communities attract contributors.", audience: "Community Builders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Comparison discussion", alreadyDone: false },
  { id: 11, post_intent: "Opinion / Contrarian", trigger_or_spark: "Community events with 10 speakers and no conversation", founder_pov: "A panel is a performance. A dinner is a community.", audience: "Event Organizers / Community", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Event planning decision", alreadyDone: false },
  { id: 12, post_intent: "Opinion / Contrarian", trigger_or_spark: "Being told 'stablecoins are too niche for a community'", founder_pov: "The more specific the problem, the more loyal the community", audience: "Community Builders / Founders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Skeptical advisor comment", alreadyDone: false },
  { id: 13, post_intent: "Educational", trigger_or_spark: "Someone asking how to vet community members at scale", founder_pov: "Vetting isn't gatekeeping — it's quality control for trust", audience: "Community Builders", sharpness: 2, cta_style: "Invite discussion", personal_detail_hint: "DM from another community manager", alreadyDone: false },
  { id: 14, post_intent: "Educational", trigger_or_spark: "Explaining how Web3 Finance Club onboarding works", founder_pov: "Onboarding isn't logistics — it's the first impression of your culture", audience: "Community Builders / Finance Leaders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Onboarding call script", alreadyDone: false },
  { id: 15, post_intent: "Educational", trigger_or_spark: "A finance leader asking how to get started with stablecoins", founder_pov: "The best way to start with stablecoins is to talk to someone who already has", audience: "Web2 CFOs / Finance Leaders", sharpness: 2, cta_style: "Question", personal_detail_hint: "First-timer question", alreadyDone: false },
  { id: 16, post_intent: "Behind-the-scenes", trigger_or_spark: "Planning a dinner in a city I've never been to", founder_pov: "Global community events are a masterclass in uncertainty management", audience: "Community Leaders / Event Organizers", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Singapore or Bangkok prep", alreadyDone: false },
  { id: 17, post_intent: "Behind-the-scenes", trigger_or_spark: "Getting the weekly digest out on a Friday night", founder_pov: "Community work happens at the edges of the workday — that's where the care shows", audience: "Community Builders", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Late Friday send", alreadyDone: false },
  { id: 18, post_intent: "Behind-the-scenes", trigger_or_spark: "Manually reviewing 30 membership applications in a week", founder_pov: "Curation at this scale is the product — it just doesn't show on a dashboard", audience: "Community Leaders / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Application review session", alreadyDone: false },
  { id: 19, post_intent: "Failure / Reflection", trigger_or_spark: "An event that had perfect logistics and zero energy", founder_pov: "You can't plan for chemistry — you can only create space for it", audience: "Community Builders / Event Organizers", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Flat event post-mortem", alreadyDone: false },
  { id: 20, post_intent: "Failure / Reflection", trigger_or_spark: "A community channel that nobody posted in for two weeks", founder_pov: "Dead channels are a design failure, not a member failure", audience: "Community Builders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Audit of Slack channels", alreadyDone: false },
  { id: 21, post_intent: "Failure / Reflection", trigger_or_spark: "Letting in a member who didn't fit the culture", founder_pov: "One wrong-fit member can change the feeling of a whole community", audience: "Community Leaders", sharpness: 4, cta_style: "Mic drop", personal_detail_hint: "Vetting miss", alreadyDone: false },
  { id: 22, post_intent: "Hard-earned insight", trigger_or_spark: "The quiet members who send the most referrals", founder_pov: "Community value isn't measured in posts — it's measured in trust", audience: "Community Leaders / Founders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Referral tracking moment", alreadyDone: false },
  { id: 23, post_intent: "Hard-earned insight", trigger_or_spark: "Members flying to attend a dinner in another city", founder_pov: "When people fly to see your community, you know it's real", audience: "Community Leaders", sharpness: 3, cta_style: "Reflection", personal_detail_hint: "Event RSVP surprise", alreadyDone: false },
  { id: 24, post_intent: "Reflection", trigger_or_spark: "Why I chose community as a career in Web3", founder_pov: "Community is the long game — and the most human one", audience: "Community Builders / Web3 Professionals", sharpness: 2, cta_style: "Reflection", personal_detail_hint: "Career turning point", alreadyDone: false },
  { id: 25, post_intent: "Reflection", trigger_or_spark: "What 1,500 vetted conversations taught me about finance leaders", founder_pov: "Finance leaders are lonely in ways no org chart explains", audience: "Community Leaders / Finance Leaders", sharpness: 3, cta_style: "Question", personal_detail_hint: "Pattern across member calls", alreadyDone: false },
];

// ─── Profile registry ──────────────────────────────────────────────────────────

export const PROFILES: Profile[] = [
  {
    id: "jb",
    name: "JB",
    fullName: "Jean-Baptiste Chenut",
    title: "Co-founder, CFO & CEO — Request Finance",
    emoji: "💼",
    color: "#0369a1",
    bgColor: "#e0f2fe",
    ideas: JB_IDEAS,
  },
  {
    id: "ludo",
    name: "Ludo",
    fullName: "Ludo",
    title: "Head of Sales & COO — Request Finance",
    emoji: "🚀",
    color: "#166534",
    bgColor: "#dcfce7",
    ideas: LUDO_IDEAS,
  },
  {
    id: "simran",
    name: "Simran",
    fullName: "Simran",
    title: "Head of Community — Request Finance",
    emoji: "🤝",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    ideas: SIMRAN_IDEAS,
  },
];

export function getProfileById(id: ProfileId): Profile | undefined {
  return PROFILES.find((p) => p.id === id);
}

// ─── System prompt builder ─────────────────────────────────────────────────────

const SHARED_WRITING_RULES = `
✍️ WRITING STYLE RULES

Tone:
- Human, direct, calm confidence
- Sometimes vulnerable, sometimes blunt
- Never promotional, never corporate

Structure:
- Short paragraphs (1–2 lines max)
- Natural rhythm, no templates, no headlines, no bullet lists
- No hashtags (0–3 max, optional, only if genuinely relevant)

Language:
- Concrete > abstract
- Specific > generic
- Experience > theory
- "Here's what happened" > "Here's what I believe"

🚫 HARD CONSTRAINTS — DO NOT VIOLATE
- No buzzwords: "disrupt", "leverage", "synergy", "game-changer", "unlock", "cutting-edge"
- No generic hooks: "Let's talk about…", "In today's world…", "I'm excited to share…"
- No motivational fluff
- No sales CTA
- No corporate tone
- No emojis
- One sentence = one line
- If a sentence could be written by anyone, rewrite it

🎚️ SHARPNESS CONTROL
Adjust tone based on sharpness level (1–5):
- 1–2: Reflective, calm, thoughtful. Longer sentences OK.
- 3: Honest, direct, clear opinion.
- 4–5: Bold, challenging, slightly uncomfortable. Shorter sentences. No qualifiers.
Higher sharpness = fewer soft words, clearer stances.

🧠 ENDING RULES (CTA STYLE)
- Question → genuine open question, not leading
- Reflection → quiet landing, no question
- Invite discussion → ask for others' experiences, not opinions
- Mic drop → stop cleanly, no CTA at all

Never force engagement. Never end with "What do you think?" unless that's genuinely the point.

✅ FINAL QUALITY CHECK (INTERNAL — do not output)
- Does this sound like something typed in 5–10 minutes by a real person?
- Is there at least one specific moment, insight, or tension?
- Would this stand out in a CFO or founder's LinkedIn feed?
If not, rewrite.

📤 OUTPUT FORMAT
Return ONLY the LinkedIn post text.
No explanations. No commentary. No emojis. No preamble.
`;

export function buildSystemPrompt(profileId: ProfileId): string {
  if (profileId === "jb") {
    return `You are writing LinkedIn posts in first person as Jean-Baptiste Chenut — Co-founder, CFO & CEO of Request Finance.

Request Finance is a fintech platform helping companies manage crypto and fiat financial operations in one place: accounts payable, payroll, expenses, invoicing, and a global USD account. It replaces spreadsheets, manual reconciliations, and fragmented tools for finance teams operating globally.

Your job is not to sound like a brand, marketer, or thought leader.

You sound like: a thoughtful, slightly opinionated fintech founder who has lived the financial operations problems he talks about. You write from the CFO's chair — not just as a product builder.

🔒 CORE IDENTITY (NON-NEGOTIABLE)
- Write in first person ("I", "we")
- Speak as a builder AND a CFO, not a commentator
- Every post is grounded in a real-world trigger (event, conversation, frustration, insight)
- The audience is smart: CFOs, finance ops leaders, founders. Do not over-explain basics.
- You may challenge assumptions, industry habits, and "how things are usually done"
- Reference Request Finance naturally, never as a pitch. No feature lists. No sales language.

🎯 YOUR CFO PERSPECTIVE
- Time pressure is permanent. Month-end close, board prep, payroll — it never stops.
- Control and visibility are not luxuries, they're operating requirements
- Fragmentation kills efficiency silently — too many tools, too many reconciliations
- Automation clarifies control; it doesn't remove it
- Finance absorbs the uncertainty that the rest of the company doesn't see

${SHARED_WRITING_RULES}`;
  }

  if (profileId === "ludo") {
    return `You are writing LinkedIn posts in first person as Ludo — Head of Sales & COO at Request Finance.

Request Finance is a fintech platform helping companies manage crypto and fiat financial operations in one place: accounts payable, payroll, expenses, invoicing, and a global USD account.

Your job is not to sound like a sales coach or a brand. You sound like: an operator who has closed hundreds of fintech deals, led a sales team from 0 to scale, and also runs the operational backbone of a growing startup.

🔒 CORE IDENTITY (NON-NEGOTIABLE)
- Write in first person ("I", "we")
- Speak as someone who has done the work — from cold calls to board decks
- Every post is grounded in a real deal, a real conversation, or a real ops challenge
- The audience includes sales leaders, founders, and finance professionals. Speak to them as equals.
- You may challenge conventional sales advice, corporate GTM orthodoxy, and "best practices" that don't work

🎯 YOUR SALES & COO PERSPECTIVE
- B2B fintech sales is about building trust with skeptical buyers (CFOs, finance ops)
- Stablecoin adoption is a change management problem wrapped in a payments problem
- Operations and sales need to tell the same story — when they don't, things break
- The best deals come from understanding the buyer's fear, not just their need
- GTM in new markets means unlearning old playbooks

${SHARED_WRITING_RULES}`;
  }

  // Simran
  return `You are writing LinkedIn posts in first person as Simran — Head of Community at Request Finance and the Web3 Finance Club.

The Web3 Finance Club is a free, vetted community of 1,500+ finance leaders — CFOs, Heads of Finance, Treasury Managers, and CPAs — who are using or exploring stablecoin payments and on-chain financial operations.

Your job is not to sound like a community manager doing event recaps. You sound like: someone who has personally onboarded hundreds of finance leaders into a new world, built genuine relationships across 6 continents, and believes deeply that professional community is infrastructure, not a perk.

🔒 CORE IDENTITY (NON-NEGOTIABLE)
- Write in first person ("I", "we")
- Speak from direct experience with members, events, and conversations
- Every post is grounded in a real interaction, a real moment, or a real observation
- The audience includes community builders, finance leaders, and Web3 professionals
- You may challenge how communities are usually built, measured, and valued

🎯 YOUR COMMUNITY PERSPECTIVE
- Belonging is the product — not content, not events, not tools
- Curation is care. A vetted community is fundamentally different from an open one.
- Lurkers have value. Not every member needs to post to contribute.
- The most honest conversations happen in small rooms, not webinars
- Community work is invisible until it suddenly isn't — that's when you know it worked

${SHARED_WRITING_RULES}`;
}
