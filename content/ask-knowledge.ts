import { services, work, products } from "@/content/site";
import type { AskLanguage, AskSelection } from "@/lib/ask/contracts";

// Seed content is a faithful translation/selection of the public sources in the approved v1 plan.
// No commercial price or availability has been approved. Portrait supplied by the owner.
export const askKnowledgeRevision = "HUNPEOLABS-ASK-001-v3";
export const founderProfile = {
  name: "Hung Pham",
  portrait: "/images/founders/hung-pham.jpg",
  role: "Founder · Hunpeo Labs",
  description: {
    en: "Founder of Hunpeo Labs, an independent product and engineering studio.",
    vi: "Người sáng lập Hunpeo Labs, một studio độc lập về sản phẩm và kỹ thuật.",
  },
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hunpham/" },
    { label: "GitHub", href: "https://github.com/phamhungptithcm" },
    { label: "Facebook", href: "https://www.facebook.com/hawaihouu" },
  ],
} as const;

const viServiceFit: Record<string, string> = {
  "web-development": "Phù hợp khi bạn ra mắt doanh nghiệp, thay website cũ hoặc đưa ý tưởng thành sản phẩm web dễ sử dụng.",
  "mobile-app-development": "Phù hợp khi bạn cần bản mobile đầu tiên, cải thiện app hiện có hoặc bổ sung app cho sản phẩm web.",
  "ai-agent-development": "Phù hợp khi đội ngũ lặp lại việc thu thập thông tin, chuẩn bị đầu ra hoặc chuyển công việc giữa hệ thống.",
  "ai-product-engineering": "Phù hợp khi bạn có ý tưởng hoặc prototype AI và muốn đưa thành tính năng người dùng có thể sử dụng và phản hồi.",
  "platform-modernization": "Phù hợp khi ứng dụng khó thay đổi, tích hợp thiếu ổn định hoặc nền tảng cũ cản trở bản phát hành tiếp theo.",
  "architecture-governance": "Phù hợp khi bạn cần đánh giá độc lập trước dự án lớn, tiêu chuẩn kỹ thuật rõ hơn hoặc cách duyệt và kiểm tra thay đổi nhất quán.",
};

const viServices: Record<string, { summary: string; boundary: string; deliverables: string[] }> = {
  "web-development": {
    summary: "Thiết kế và xây dựng website giới thiệu, cổng khách hàng và giao diện web app để khách hiểu dịch vụ và thực hiện công việc dễ dàng.",
    boundary: "Backend, thanh toán, CMS, cấu hình hosting và hỗ trợ nội dung được thống nhất riêng khi cần.",
    deliverables: ["Cấu trúc trang và nội dung theo nhu cầu người dùng.", "Giao diện desktop/mobile và các luồng đã thống nhất.", "Nền tảng SEO kỹ thuật, kiểm tra khả năng truy cập và hiệu năng.", "Source code, hướng dẫn cài đặt, kết quả kiểm thử và hướng dẫn phát hành."],
  },
  "mobile-app-development": {
    summary: "Xây dựng ứng dụng mobile theo những thao tác quan trọng nhất của người dùng, từ prototype đến bản build được kiểm thử.",
    boundary: "Nền tảng iOS/Android, backend, tích hợp thiết bị và hỗ trợ nộp store được xác nhận trước khi phát triển. Store quyết định việc phê duyệt ứng dụng.",
    deliverables: ["Phạm vi bản phát hành và luồng người dùng.", "Thiết kế màn hình, điều hướng và prototype.", "Ứng dụng cho nền tảng đã thống nhất, cùng kiểm thử thiết bị và luồng sử dụng.", "Source code, hướng dẫn build, checklist phát hành và tài liệu bàn giao."],
  },
  "ai-agent-development": {
    summary: "Xây dựng AI agents thực hiện công việc xác định với công cụ và dữ liệu được phép, có giới hạn hành động và bước duyệt của con người.",
    boundary: "Quyền truy cập dữ liệu, hành động, nhà cung cấp model và chi phí sử dụng được thống nhất trước khi triển khai.",
    deliverables: ["Sơ đồ công việc: đầu vào, hành động, đầu ra và bước duyệt.", "Agent và tích hợp công cụ/hệ thống đã thống nhất.", "Quyền truy cập và duyệt các hành động nhạy cảm.", "Kịch bản đánh giá, hướng dẫn vận hành và giới hạn được ghi nhận."],
  },
  "ai-product-engineering": {
    summary: "Đưa AI vào một luồng sử dụng thực tế, kết nối giao diện, model và dữ liệu được duyệt, với cách xử lý khi câu trả lời thiếu hoặc sai.",
    boundary: "Chuẩn bị dữ liệu, phí nhà cung cấp, hosting và đánh giá model định kỳ được thống nhất cho từng dự án.",
    deliverables: ["Use case và tiêu chí chấp nhận cho bản đầu tiên.", "Thiết kế tương tác, phản hồi và phương án dự phòng.", "Tính năng AI tích hợp model và dữ liệu đã thống nhất.", "Đánh giá chất lượng, độ trễ, chi phí sử dụng và tài liệu phát hành."],
  },
  "platform-modernization": {
    summary: "Đánh giá nền tảng hiện có và thực hiện các cải tiến theo từng giai đoạn, có kiểm tra và phương án rollback cho mỗi đợt phát hành.",
    boundary: "Có thể thực hiện đánh giá riêng. Triển khai, migration dữ liệu, thời gian phát hành và quyền production cần thỏa thuận cho từng giai đoạn.",
    deliverables: ["Sơ đồ hệ thống và các phụ thuộc quan trọng.", "Danh sách cải tiến ưu tiên theo nhu cầu sản phẩm/vận hành.", "Kế hoạch theo giai đoạn và tiêu chí chấp nhận.", "Cải tiến đã thống nhất, kết quả kiểm tra, rollback và tài liệu vận hành."],
  },
  "architecture-governance": {
    summary: "Rà soát kiến trúc và cách triển khai phần mềm, xác định quyết định quan trọng và xây dựng lộ trình kỹ thuật có thể thực hiện.",
    boundary: "Đây là dịch vụ tư vấn. Triển khai có thể được thống nhất tiếp; đánh giá không phải tư vấn pháp lý, chứng nhận hoặc kiểm toán tuân thủ.",
    deliverables: ["Đánh giá kiến trúc và phụ thuộc, cùng phát hiện theo mức ưu tiên.", "Phương án kỹ thuật và đánh đổi theo yêu cầu.", "Danh sách quyết định, người phụ trách và bước tiếp theo.", "Checklist kiểm tra/phê duyệt và lộ trình triển khai."],
  },
};

export const viWork: Record<string, { summary: string; status: string }> = {
  "ai-agent-kit": { summary: "Hệ thống kỹ thuật open-source cho AI agent hiểu repository, với quyền hành động, ngữ cảnh nguồn và bằng chứng có thể rà soát.", status: "Sản phẩm open-source" },
  incov: { summary: "Sản phẩm phân tích sự cố đang được kiểm chứng, kết hợp bằng chứng, kiến thức xử lý có thể tái sử dụng và duyệt của con người.", status: "Sản phẩm đang được kiểm chứng" },
  gig: { summary: "Dự án kỹ thuật open-source theo dõi release từ ticket, thay đổi source, bằng chứng phát hành đến trạng thái production.", status: "Dự án kỹ thuật open-source" },
};
export const askWork = work.map(item => {
  const product = products.find(record => record.slug === item.productSlug);
  return { slug: item.slug, name: item.name, summary: product?.summary ?? item.summary, status: product?.maturity ?? item.status };
});
export const askProducts = products;
export const productSourceChecks = { checkedAt: "2026-10-04", source: "/products", scope: "Only products and capabilities already published by HunpeoLabs; no external repository claims or inferred versions" } as const;

export const askSources = [
  ...products.map(product => ({ id: product.slug, topic: product.slug, source: `/products/${product.slug}`, text: `${product.name}. ${product.summary} ${product.maturity}. ${product.capabilities.join("; ")}. ${product.boundary}` })),
  { id: "timeline", topic: "timeline", source: "/services", text: "No approved delivery duration. Agree scope, integrations, content, feedback milestones and release requirements before confirming a schedule." },
  { id: "handover", topic: "handover", source: "/services", text: "Deliverables depend on the agreed service scope. Source, build/release instructions and documentation vary by service. Hosting, maintenance, support duration and ownership terms need explicit agreement." },
  { id: "work", topic: "work", source: "/work", text: "Selected work consists of product and open-source profiles, not verified client outcomes. " + askWork.map(item => `${item.name}: ${item.summary} Status: ${item.status}.`).join(" ") },
  { id: "company", topic: "company", source: "/about", text: "Hunpeo Labs is an independent product and engineering studio founded by Hung Pham. We build web, mobile and AI products." },
  { id: "founder", topic: "founder", source: "/about", text: "Hung Pham — Founder of Hunpeo Labs. Only the public profile links are approved; no expanded biography or credentials." },
  { id: "pricing", topic: "pricing", source: "/services", text: "No published approved prices. Scope, deliverables and acceptance criteria are agreed before work. Hosting, deployment, ongoing support and third-party charges depend on project scope." },
  { id: "process", topic: "process", source: "/services", text: "Agree on work; design the solution; build in increments; check against acceptance criteria; hand over source, documentation and release guidance. Launch/support are scoped separately." },
  { id: "contact", topic: "contact", source: "/contact", text: "Start from your problem, intended users, desired outcome and technical, budget or timeline constraints. The contact form prepares a project brief." },
  ...services.map(service => ({ id: service.slug, topic: "services", source: `/services/${service.slug}`, text: `${service.name}. ${service.summary} ${service.bestFor} ${service.boundary}` })),
].map(record => ({ ...record, owner: "HunpeoLabs public site", status: "approved" as const, revision: askKnowledgeRevision, effectiveDate: "2026-10-03", reviewDate: "2027-01-03", expiresAt: "2027-04-03" }));

export function eligibleAskSources(now = Date.now()) {
  return askSources.filter(record => Date.parse(record.effectiveDate) <= now && now < Date.parse(record.expiresAt));
}

export function localizedService(slug: AskSelection["service"], language: AskLanguage) {
  const service = services.find(record => record.slug === slug);
  if (!service) return null;
  const translated = viServices[service.slug];
  return {
    ...service,
    bestFor: language === "vi" ? viServiceFit[service.slug] : service.bestFor,
    summary: language === "vi" ? translated.summary : service.summary,
    boundary: language === "vi" ? translated.boundary : service.boundary,
    deliverables: language === "vi" ? translated.deliverables : service.deliverables,
  };
}
