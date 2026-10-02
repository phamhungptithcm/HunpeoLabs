/** Browser-safe email handoff. This prepares a draft; it does not deliver mail. */
export type ContactEmailBrief = {
  name: string;
  email: string;
  company: string;
  projectType: string;
  brief: string;
};

export function formatContactEmailBrief(brief: ContactEmailBrief): string {
  return [
    `Name: ${brief.name.trim()}`,
    `Reply email: ${brief.email.trim()}`,
    `Company: ${brief.company.trim() || "Not provided"}`,
    `Project type: ${brief.projectType}`,
    "",
    "What needs to change?",
    brief.brief.trim(),
  ].join("\n");
}

export function buildContactEmailUrl(recipient: string, brief: ContactEmailBrief): string {
  return `mailto:${recipient}?subject=${encodeURIComponent(`Project inquiry: ${brief.projectType}`)}&body=${encodeURIComponent(formatContactEmailBrief(brief))}`;
}
