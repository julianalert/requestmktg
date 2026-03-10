export interface AdAngle {
  angle_title: string;
  core_pain: string;
  hook: string;
  why_it_resonates: string;
}

export interface LandingPageHook {
  headline: string;
  subheadline: string;
  core_problem_addressed: string;
}

export interface SalesOutreachAngle {
  angle: string;
  opening_message: string;
  pain_trigger: string;
}

export interface SeoTopic {
  topic: string;
  search_intent: string;
  example_keywords: string[];
}

export interface PersonaCampaignData {
  ad_angles: AdAngle[];
  landing_page_hooks: LandingPageHook[];
  sales_outreach_angles: SalesOutreachAngle[];
  seo_topics: SeoTopic[];
}

export const personaCampaignByKey: Record<string, PersonaCampaignData> = {};
