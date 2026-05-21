export type Stage = "prospect" | "lead" | "client" | "purchaser" | "inactive";

export const STAGE_META: Record<
  Stage,
  { label: string; bg: string; text: string }
> = {
  prospect: { label: "Prospect", bg: "#E8EEF8", text: "#1E4DA1" },
  lead: { label: "Lead", bg: "#FEF0E1", text: "#B86A14" },
  client: { label: "Client", bg: "#E4F5EC", text: "#1A7040" },
  purchaser: { label: "Purchaser", bg: "#F5EFE0", text: "#8A6415" },
  inactive: { label: "Inactive", bg: "#F0EDEA", text: "#6E655F" },
};

export const STAGE_PROGRESSION: Stage[] = [
  "prospect",
  "lead",
  "client",
  "purchaser",
];

export const ALL_STAGES: Stage[] = [
  "prospect",
  "lead",
  "client",
  "purchaser",
  "inactive",
];
