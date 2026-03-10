"use client";

import { useState, useEffect, useCallback } from "react";
import type { Persona } from "./persona-data";
import type { PersonaCampaignData } from "./persona-campaign-data";
import { PersonaDetail } from "./PersonaDetail";

type PersonaWithCampaign = Persona & { campaign?: PersonaCampaignData | null };

export default function PersonasPage() {
  const [personas, setPersonas] = useState<PersonaWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selected = personas.find((p) => p.id === selectedId);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list = (data.personas ?? []).map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        headline: p.headline,
        meta: p.meta ?? [],
        sections: p.sections ?? [],
        campaign: data.campaignsByPersonaId?.[p.id as string] ?? null,
      }));
      setPersonas(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    } catch {
      setPersonas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  useEffect(() => {
    if (personas.length > 0 && !selectedId) {
      setSelectedId(personas[0].id);
    }
  }, [personas.length, selectedId]);

  const handleCreatePersona = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/personas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptInput: promptInput || "No additional guidance.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setModalOpen(false);
      setPromptInput("");
      await fetchPersonas();
      if (data.persona?.id) setSelectedId(data.persona.id);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        alignItems: "flex-start",
        minHeight: "60vh",
      }}
    >
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "1px solid #e5e7eb",
          paddingRight: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <h2
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            Personas
          </h2>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              padding: "0.35rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "#111827",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Create
          </button>
        </div>
        {loading ? (
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Loading…</p>
        ) : (
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            {personas.map((p) => {
              const isActive = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    textAlign: "left",
                    border: "none",
                    borderRadius: "6px",
                    background: isActive ? "#f3f4f6" : "transparent",
                    color: isActive ? "#111827" : "#6b7280",
                    fontWeight: isActive ? 600 : 400,
                    fontSize: "0.9375rem",
                    cursor: "pointer",
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </nav>
        )}
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        {selected ? (
          <PersonaDetail persona={selected} campaign={selected.campaign} />
        ) : (
          <p style={{ color: "#6b7280" }}>
            {personas.length === 0 ? "No personas yet. Create one to get started." : "Select a persona."}
          </p>
        )}
      </div>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => !creating && setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "1.5rem",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            >
              Create a persona
            </h3>
            <p
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.875rem",
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              Describe the persona you want (e.g. profile, MRR, industry, business type). The agent will use this plus the Request Finance website and brand profile to generate a full persona and campaign angles.
            </p>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. Head of Finance at a 50-person remote SaaS company, $5–15M ARR, managing global contractors and cross-border payments…"
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                fontSize: "0.9375rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            {createError && (
              <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {createError}
              </p>
            )}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
                marginTop: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => !creating && setModalOpen(false)}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  background: "#fff",
                  cursor: creating ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePersona}
                disabled={creating}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "#111827",
                  border: "none",
                  borderRadius: "6px",
                  cursor: creating ? "not-allowed" : "pointer",
                }}
              >
                {creating ? "Creating…" : "Create persona"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
