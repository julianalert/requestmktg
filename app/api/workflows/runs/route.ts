import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflow");

    let query = supabase
      .from("workflow_runs")
      .select("id, workflow_id, input, result, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (workflowId) {
      query = query.eq("workflow_id", workflowId);
    }

    const { data: runs, error } = await query;

    if (error) {
      return Response.json(
        { error: "Failed to fetch runs", details: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      runs: (runs ?? []).map((r) => ({
        id: r.id,
        workflowId: r.workflow_id,
        input: r.input ?? {},
        result: r.result,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
