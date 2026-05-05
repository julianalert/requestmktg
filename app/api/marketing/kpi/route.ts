import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("marketing_kpi")
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
    traffic,
    signups,
    demo_bookings,
    demo_completed,
    paid_users,
    club_members_onboarded,
  } = body;

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("marketing_kpi")
    .upsert(
      {
        date,
        traffic: traffic ?? 0,
        signups: signups ?? 0,
        demo_bookings: demo_bookings ?? 0,
        demo_completed: demo_completed ?? 0,
        paid_users: paid_users ?? 0,
        club_members_onboarded: club_members_onboarded ?? 0,
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
