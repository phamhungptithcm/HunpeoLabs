export const customerAudiences = [
  {
    id: "local-shops", title: "I run a local shop", shortName: "Local shops",
    summary: "Introduce your shop, showcase your catalogue, or build an online store around how you sell.",
    service: "web-development", projectType: "Web product",
    outcomes: ["A clear introduction to your shop", "A mobile-friendly catalogue or e-commerce website", "Directions and call or message links"],
    brief: "I run a local shop.\nWhat we sell:\nCustomers we want to reach:\nWhat visitors should do: view products / ask about buying / place an order / find our shop\nE-commerce features to discuss: cart / checkout / payment / shipping / inventory\nContent we already have:\nBudget range and preferred timing:",
  },
  {
    id: "creators", title: "I create or offer a personal service", shortName: "Creators & photographers",
    summary: "Show your work, explain your services, and make collaboration or booking enquiries easier.",
    service: "web-development", projectType: "Web product",
    outcomes: ["A portfolio for your photos or creative work", "Clear service information", "A simple collaboration or booking enquiry"],
    brief: "I work in photography, social content, or a personal service.\nMy services:\nWork I want to show:\nWho I want to reach:\nWhat visitors should do: enquire about a shoot / discuss collaboration\nBudget range and preferred timing:",
  },
  {
    id: "small-business", title: "I want to manage work more easily", shortName: "Small businesses",
    summary: "Start with one task: collecting customer requests, keeping track of work, or reducing repeated steps.",
    service: "web-development", projectType: "Web product",
    outcomes: ["A map of one repeated task", "A discussion of suitable forms or automation", "Agreed access, costs, and review steps"],
    brief: "I want to make one business task easier.\nWhat we do today:\nThe repeated task:\nTools we already use:\nWho checks or approves the result:\nBudget range and preferred timing:",
  },
] as const;

export type CustomerAudience = typeof customerAudiences[number];
export function getCustomerAudience(value: unknown): CustomerAudience | undefined {
  return typeof value === "string" ? customerAudiences.find(audience => audience.id === value) : undefined;
}
export function audienceContactHref(audience: CustomerAudience) {
  return `/contact?audience=${audience.id}`;
}
