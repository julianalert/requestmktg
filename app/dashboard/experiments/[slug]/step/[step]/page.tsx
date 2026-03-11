"use client";

import { useParams } from "next/navigation";
import { getExperimentBySlug } from "@/lib/experiments/data";

export default function ExperimentStepPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const stepParam = params.step;
  const stepNumber = typeof stepParam === "string" ? parseInt(stepParam, 10) : NaN;

  const experiment = getExperimentBySlug(slug);
  const step = experiment?.steps?.find((s) => s.number === stepNumber);

  if (!experiment) {
    return <p style={{ color: "#6b7280" }}>Experiment not found.</p>;
  }

  if (!step || Number.isNaN(stepNumber)) {
    return <p style={{ color: "#6b7280" }}>Step not found.</p>;
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "0.5rem",
        }}
      >
        Step {step.number}: {step.title}
      </h2>
      <p
        style={{
          fontSize: "0.875rem",
          color: "#6b7280",
          marginBottom: "1.5rem",
        }}
      >
        Materials and content for this step. Add links, notes, and assets here.
      </p>
      <div
        style={{
          border: "1px dashed #d1d5db",
          borderRadius: "8px",
          padding: "2rem",
          backgroundColor: "#fafafa",
          color: "#9ca3af",
          fontSize: "0.875rem",
          textAlign: "center",
        }}
      >
        Materials section — coming soon. You can add documents, links, or notes here.
      </div>
    </div>
  );
}
