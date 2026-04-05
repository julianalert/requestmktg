import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("club_funnel")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const {
    date,
    visitors,
    application_page_views,
    applications,
    people_invited_to_call,
    onboarding_calls,
    people_invited,
    people_joined,
    request_finance_demos,
  } = body;

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("club_funnel")
    .upsert(
      {
        date,
        visitors: visitors ?? 0,
        application_page_views: application_page_views ?? 0,
        applications: applications ?? 0,
        people_invited_to_call: people_invited_to_call ?? 0,
        onboarding_calls: onboarding_calls ?? 0,
        people_invited: people_invited ?? 0,
        people_joined: people_joined ?? 0,
        request_finance_demos: request_finance_demos ?? 0,
      },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
