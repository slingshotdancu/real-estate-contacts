export type PersonalCategory =
  | "family"
  | "close_friend"
  | "friend"
  | "neighbor"
  | "other";

export const PERSONAL_CATEGORY_META: Record<
  PersonalCategory,
  { label: string; bg: string; text: string }
> = {
  family: { label: "Family", bg: "#F5E8EF", text: "#8B3059" },
  close_friend: { label: "Close Friend", bg: "#EEE8F5", text: "#5E3090" },
  friend: { label: "Friend", bg: "#E8F5F0", text: "#1F7A55" },
  neighbor: { label: "Neighbor", bg: "#F5F0E8", text: "#8B6220" },
  other: { label: "Other", bg: "#F0EDEA", text: "#6E655F" },
};

export const ALL_PERSONAL_CATEGORIES: PersonalCategory[] = [
  "family",
  "close_friend",
  "friend",
  "neighbor",
  "other",
];
