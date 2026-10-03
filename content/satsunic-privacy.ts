export const satsunicPrivacy = {
  title: "Satsunic SEO extension",
  introduction: "Website checks run when you request them. Optional account and Pro tools use connected services for the tasks you choose.",
  sections: [
    { title: "Website checks and saved work", paragraphs: [
      "Satsunic reads the supported page you select and requests public pages, robots.txt and sitemaps when you start a crawl. The website receives these requests and normal network information, including your IP address. Crawl requests do not include the website’s cookies or authorization headers.",
      "Reports and saved work can contain URLs, page text, links and inspection findings. Saved work stays in the extension’s browser storage. Exports create files you control; Satsunic does not automatically send them to an AI service. Removing a saved item does not remove files you downloaded."
    ] },
    { title: "Optional sign-in and connected checks", paragraphs: [
      "Google and Firebase handle account sign-in. The extension keeps your Firebase session in its browser storage so it can restore sign-in and share the session across Satsunic views. Signing out removes the stored sign-in session; it does not delete cloud records.",
      "When you request a connected check, the backend receives the account and workspace identifiers and the inputs needed for that task. Depending on the feature, this can include a search query, domain, business or public location, keywords and region. Supported provider checks use DataForSEO. Connecting a Google Business Profile uses Google’s permission flow; availability depends on the connected service.",
      "Server records include workspace membership, entitlements, quotes, jobs, results, credit reservations and settlements. Opening a panel or exporting a loaded result does not start a paid provider check; you review a quote before starting one."
    ] },
    { title: "Payments and subscriptions", paragraphs: [
      "Lemon Squeezy hosts checkout and subscription management. You enter card details on its payment service, not in the extension. Satsunic receives the billing events needed to manage subscription access and credits. Billing events and credit settlements are separate from website inspection results."
    ] },
    { title: "Deletion and retention", paragraphs: [
      "Use the extension’s saved-work controls to remove local items. Signing out hides account-scoped saved work but does not erase it. On a shared device, remove saved work before signing out.",
      "Connected results have source-specific expiry rules. Expiry limits access to those results; financial and audit records have separate retention requirements. Clearing browser data does not erase records held by Firebase, DataForSEO, Google or Lemon Squeezy."
    ] }
  ]
} as const;
