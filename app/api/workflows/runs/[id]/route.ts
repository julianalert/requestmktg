import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return Response.json({ error: "Run ID required" }, { status: 400 });
    }

    const { data: run, error } = await supabase
      .from("workflow_runs")
      .select("id, workflow_id, input, result, created_at")
      .eq("id", id)
      .single();

    if (error || !run) {
      return Response.json(
        { error: "Run not found", details: error?.message },
        { status: 404 }
      );
    }

    return Response.json({
      run: {
        id: run.id,
        workflowId: run.workflow_id,
        input: run.input ?? {},
        result: run.result,
        createdAt: run.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
