export type PersonaSection =
  | { type: "paragraph"; title: string; content: string }
  | { type: "list"; title: string; items: string[] }
  | { type: "keyValue"; title: string; entries: { label: string; value: string }[] };

export interface Persona {
  id: string;
  name: string;
  role: string;
  headline: string;
  meta: { label: string; value: string }[];
  sections: PersonaSection[];
}

export const personas: Persona[] = [];
