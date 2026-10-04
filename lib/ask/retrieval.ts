import { askWork, askProducts, viWork, eligibleAskSources, localizedService } from "@/content/ask-knowledge";
import { askAnswerSchema, type AskAnswer, type AskLanguage, type AskRequest, type AskSelection } from "./contracts";

export function normalizeQuestion(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/đ/g, "d");
}

export function detectLanguage(question: string, fallback: AskLanguage): AskLanguage {
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(question) || /\b(la gi|bao nhieu|dich vu|nguoi sang lap|toi muon|chi phi)\b/.test(normalizeQuestion(question))) return "vi";
  if (/\b(who|what|how|which|tell|build|pricing|founder|services)\b/i.test(question)) return "en";
  return fallback;
}

export function retrieveSelection(request: AskRequest): AskSelection {
  const q = normalizeQuestion(request.question);
  const contextual = /^(and |what about|how about|con |vay |the |his |their |ong ay|anh ay)/.test(q) || q.length < 35;
  const previous = contextual ? normalizeQuestion(request.history.slice(-2).join(" ")) : "";
  const serviceText = `${q} ${previous}`;
  let service: AskSelection["service"] = null;
  if (/\b(agent|agents|automation|automate|tu dong hoa)\b/.test(serviceText)) service = "ai-agent-development";
  else if (/\b(ai|chatbot|gemini|prototype ai|tri tue nhan tao)\b/.test(serviceText)) service = "ai-product-engineering";
  else if (/\b(mobile|ios|android|dien thoai|ung dung di dong)\b/.test(serviceText)) service = "mobile-app-development";
  else if (/\b(moderniz\w*|legacy|migration|hien dai hoa|he thong cu)\b/.test(serviceText)) service = "platform-modernization";
  else if (/\b(architecture|governance|kien truc|quan tri)\b/.test(serviceText)) service = "architecture-governance";
  else if (/\b(web|website|portal|trang web)\b/.test(serviceText)) service = "web-development";

  const detail = /\b(deliverables|receive|hand.?over|ban giao|nhan duoc|source code)\b/.test(q) ? "deliverables" : /\b(included|include|hosting|support|maintenance|bao gom|bao tri|ho tro)\b/.test(q) ? "boundary" : /\b(process|quy trinh|steps|buoc)\b/.test(q) ? "process" : "overview";
  const founder = /\b(founder|fouder|founded|hung pham|pham hung|nguoi sang lap|ai sang lap)\b/.test(q) || (/\b(his|ong ay|anh ay|profile|linkedin|github)\b/.test(q) && /\b(founder|fouder|founded|hung pham|sang lap)\b/.test(previous));
  const pricing = /\b(price|prices|pricing|cost|costs|budget|quote|discount|gia|chi phi|ngan sach|bao gia|giam gia)\b/.test(q) || (!founder && /bao nhieu/.test(q));
  const timing = /\b(timeline|deadline|duration|how long|when|thoi gian|tien do|bao lau|may tuan|may ngay|khi nao)\b/.test(q);
  const portfolio = /\b(portfolio|case stud\w*|projects|products|product catalog|san pham cong khai|san pham cua|cac san pham|co san pham|selected work|past work|experience|du an|nang luc|kinh nghiem|san pham da lam|ai agent kit|incov|gig)\b/.test(q);
  const handover = detail === "deliverables" || /\b(ownership|hosting|maintenance|support|bao tri|ho tro sau|quyen so huu|tai lieu)\b/.test(q);
  const contact = /\b(contact|email|lien he|start a project|bat dau du an)\b/.test(q);
  const product = /\bai[ -]agent[ -]kit\b/.test(q) ? "ai-agent-kit" : /\bincov\b/.test(q) ? "incov" : /\bgig\b/.test(q) ? "gig" : null;
  const topic: AskSelection["topic"] = pricing ? "pricing" : founder ? "founder" : product ? product : contact ? "contact" : timing ? "timeline" : portfolio ? "work" : handover && !service ? "handover" : detail === "process" && !service ? "process" : service || /\b(service|services|dich vu|build|xay dung|lam app)\b/.test(q) ? "services" : /hunpeo|studio|company|cong ty/.test(q) ? "company" : "outside";
  return { topic, service, detail };
}

export function buildAnswer(selection: AskSelection, language: AskLanguage, mode: AskAnswer["mode"] = "published", now = Date.now()): AskAnswer {
  const vi = language === "vi";
  const eligible = new Set(eligibleAskSources(now).map(record => record.id));
  const required = selection.topic === "services" && selection.service ? selection.service : selection.topic;
  if (selection.topic !== "outside" && !eligible.has(required)) return askAnswerSchema.parse({
    title: vi ? "Trao đổi với HunpeoLabs" : "Talk with HunpeoLabs",
    paragraphs: [vi ? "Thông tin này cần được xác nhận lại. Bạn có thể gửi nhu cầu để HunpeoLabs kiểm tra phạm vi phù hợp." : "This information needs to be confirmed. Share your needs with HunpeoLabs to review the right scope."], bullets: [], sourceIds: ["contact"], founder: false, action: "contact", followUp: null, language, mode: "published",
  });
  const service = selection.service && eligible.has(selection.service) ? localizedService(selection.service, language) : null;
  const answer: AskAnswer = { title: "", paragraphs: [], bullets: [], sourceIds: [], founder: selection.topic === "founder", action: "contact", followUp: null, language, mode };
  switch (selection.topic) {
    case "founder":
      answer.title = "Hung Pham — Founder";
      answer.paragraphs = [vi ? "Hung Pham là người sáng lập HunpeoLabs, một studio độc lập về sản phẩm và kỹ thuật. Bạn có thể xem các hồ sơ công khai bên dưới." : "Hung Pham founded HunpeoLabs, an independent product and engineering studio. You can explore his public profiles below."];
      answer.sourceIds = ["about"]; break;
    case "company":
      answer.title = vi ? "HunpeoLabs làm gì?" : "What does HunpeoLabs do?";
      answer.paragraphs = [vi ? "HunpeoLabs là một studio độc lập về sản phẩm và kỹ thuật, do Hung Pham sáng lập. Chúng tôi thiết kế và xây dựng website, ứng dụng mobile và hệ thống AI." : "HunpeoLabs is an independent product and engineering studio founded by Hung Pham. We design and build websites, mobile applications, and AI systems.", vi ? "Thiết kế sản phẩm và kỹ thuật được kết nối với nhau. Phạm vi, đầu ra và tiêu chí hoàn thành được thống nhất trước khi bắt đầu." : "Product design and engineering stay together. Scope, deliverables, and completion criteria are agreed before work begins."];
      answer.paragraphs.push(vi ? "Phù hợp khi bạn cần ra mắt sản phẩm mới, cải thiện website/app hiện có, đưa AI vào công việc hoặc rà soát nền tảng kỹ thuật." : "Suitable when you need to launch a product, improve an existing website/app, introduce AI into a workflow or review an engineering platform.");
      answer.bullets = vi ? ["Sản phẩm web và mobile.", "AI agents và tính năng AI cho sản phẩm.", "Hiện đại hóa nền tảng, kiến trúc và governance."] : ["Web and mobile products.", "AI agents and AI product features.", "Platform modernization, architecture, and governance."];
      answer.sourceIds = ["about", "services"]; answer.action = "services"; break;
    case "pricing":
      answer.title = vi ? "Chi phí được xác định thế nào?" : "How does pricing work?";
      answer.paragraphs = [vi ? "HunpeoLabs chưa công bố bảng giá được xác nhận trong bộ thông tin này. Chi phí cần được xác định theo phạm vi, đầu ra, tích hợp và yêu cầu triển khai của dự án." : "There is no confirmed public price list in this information set. Project cost needs to be established from scope, deliverables, integrations, and release requirements.", service?.boundary ?? (vi ? "Hosting, triển khai và hỗ trợ sau bàn giao được thống nhất trong phạm vi dự án; phí nền tảng và nhà cung cấp bên thứ ba cần được xem xét riêng." : "Hosting, deployment, and ongoing support are agreed in the project scope; platform and third-party charges are separate considerations.")];
      answer.followUp = vi ? "Bạn muốn xây dựng gì và cần những chức năng nào ở bản đầu tiên?" : "What are you building, and which features do you need in the first release?";
      answer.sourceIds = service ? ["services", service.slug as NonNullable<AskSelection["service"]>] : ["services"]; break;
    case "services":
      if (service) {
        answer.title = service.name;
        answer.paragraphs = [service.summary];
        if (selection.detail === "overview") answer.paragraphs.push(service.bestFor);
        if (selection.detail === "deliverables") answer.bullets = service.deliverables;
        else if (selection.detail === "boundary") answer.paragraphs.push(service.boundary);
        else if (selection.detail === "process") answer.paragraphs.push(vi ? "Thống nhất phạm vi → thiết kế → xây dựng → kiểm tra → bàn giao. Chi tiết quy trình được xác định theo dịch vụ và dự án." : service.process.join(" → "));
        else answer.paragraphs.push(service.boundary);
        answer.sourceIds = [service.slug as NonNullable<AskSelection["service"]>]; answer.action = service.slug as NonNullable<AskSelection["service"]>;
        answer.followUp = selection.detail === "overview" ? (vi ? "Bạn muốn xem đầu ra bàn giao hay trao đổi phạm vi dự án?" : "Would you like to explore deliverables or discuss your project scope?") : null;
      } else {
        answer.title = vi ? "Chọn dịch vụ phù hợp" : "Find the right service";
        answer.paragraphs = [vi ? "HunpeoLabs hỗ trợ xây dựng sản phẩm web/mobile, hệ thống AI và cải thiện nền tảng hiện có. Có thể bắt đầu từ ý tưởng hoặc một sản phẩm cần thay đổi." : "HunpeoLabs builds web/mobile products and AI systems, and improves existing platforms. You can start with an idea or an existing product that needs to change."];
        answer.bullets = ["Web Development", "Mobile App Development", "AI Agent Development", "AI Product Engineering", "Platform Modernization", "Architecture & Governance"];
        answer.followUp = vi ? "Bạn đang xây dựng sản phẩm mới hay cải thiện hệ thống hiện có?" : "Are you building a new product or improving an existing system?";
        answer.sourceIds = ["services"]; answer.action = "services";
      } break;
    case "timeline":
      answer.title = vi ? "Thời gian triển khai" : "Project timeline";
      answer.paragraphs = [vi ? "Tiến độ được xác nhận sau khi thống nhất phạm vi, đầu ra và các mốc phản hồi. HunpeoLabs chưa công bố khoảng thời gian cố định trong bộ thông tin hiện tại." : "The schedule is confirmed after agreeing scope, deliverables and feedback milestones. HunpeoLabs has no approved fixed delivery range in the current information set."];
      answer.bullets = vi ? ["Số màn hình và độ phức tạp của chức năng.", "Dữ liệu, nội dung và tích hợp cần chuẩn bị.", "Kiểm thử, phản hồi và yêu cầu phát hành."] : ["Screen count and feature complexity.", "Data, content and integrations to prepare.", "Testing, feedback and release requirements."];
      answer.followUp = vi ? "Bạn cần bản đầu tiên vào thời điểm nào và những chức năng nào phải có?" : "When do you need the first release, and which features must it include?";
      answer.sourceIds = ["services"]; break;
    case "ai-agent-kit":
    case "incov":
    case "gig": {
      const product = askProducts.find(item => item.slug === selection.topic)!;
      answer.title = product.name;
      answer.paragraphs = [vi ? viWork[product.slug].summary : product.summary, vi ? `Trạng thái: ${viWork[product.slug].status}. Hồ sơ mô tả chức năng và giới hạn hiện tại, chưa phải bằng chứng kết quả cho khách hàng hoặc xác nhận production.` : `${product.maturity}. ${product.boundary}`];
      if (!vi) answer.bullets = product.capabilities.slice(0, 6);
      answer.sourceIds = [selection.topic];
      answer.followUp = vi ? "Bạn muốn tìm hiểu cách sản phẩm hỗ trợ nhu cầu nào của bạn?" : "Which part of your workflow would you like this product to support?";
      break;
    }
    case "work":
      answer.title = vi ? "Các sản phẩm và dự án công khai" : "Public products and selected work";
      answer.paragraphs = [vi ? "Bạn có thể xem các hồ sơ sản phẩm và open-source bên dưới để hiểu hướng kỹ thuật của HunpeoLabs. Đây chưa phải case study chứng minh kết quả cho khách hàng; vai trò trong dự án khách hàng cần được xác nhận riêng." : "Explore these product and open-source profiles to understand HunpeoLabs’ engineering focus. They are not verified client outcome case studies; roles in client projects require separate confirmation."];
      answer.bullets = askWork.map(item => `${item.name}: ${vi ? viWork[item.slug].summary : item.summary} (${vi ? viWork[item.slug].status : item.status})`);
      answer.sourceIds = ["work", "ai-agent-kit", "incov", "gig"];
      answer.followUp = vi ? "Bạn muốn xem công việc liên quan đến AI, web/mobile hay nền tảng hiện có?" : "Would you like to explore work related to AI, web/mobile or an existing platform?"; break;
    case "handover":
      answer.title = vi ? "Bàn giao và hỗ trợ" : "Handover and support";
      answer.paragraphs = [vi ? "Đầu ra bàn giao được thống nhất theo từng dịch vụ. Source code, hướng dẫn build/phát hành và tài liệu cần được ghi rõ trong phạm vi dự án." : "Handover deliverables are agreed for each service. Source code, build/release instructions and documentation should be stated in the project scope.", vi ? "Hosting, bảo trì, thời hạn hỗ trợ và quyền sở hữu cần được thỏa thuận rõ trước khi bắt đầu; không mặc định là đã bao gồm." : "Hosting, maintenance, support duration and ownership terms need explicit agreement before work starts; they are not assumed to be included."];
      answer.followUp = vi ? "Bạn muốn tự vận hành sau bàn giao hay cần HunpeoLabs hỗ trợ tiếp?" : "Will you operate the product after handover, or do you need ongoing support?";
      answer.sourceIds = ["services"]; break;
    case "process":
      answer.title = vi ? "Từ trao đổi đầu tiên đến bàn giao" : "From first conversation to handover";
      answer.paragraphs = [vi ? "Phạm vi, trách nhiệm và tiêu chí hoàn thành được thống nhất trước khi bắt đầu. Bạn xem tiến độ ở các mốc đã thỏa thuận; kết quả được kiểm tra theo tiêu chí chấp nhận." : "Scope, responsibilities, and completion criteria are agreed before work begins. You see progress at agreed milestones, and the work is checked against acceptance criteria."];
      answer.bullets = vi ? ["Thống nhất công việc.", "Thiết kế giải pháp.", "Xây dựng theo từng phần.", "Kiểm tra kết quả.", "Bàn giao rõ ràng."] : ["Agree on the work.", "Design the solution.", "Build in increments.", "Check the result.", "Hand over clearly."];
      answer.sourceIds = ["services"]; break;
    case "contact":
      answer.title = vi ? "Bắt đầu trao đổi dự án" : "Start a project conversation";
      answer.paragraphs = [vi ? "Hãy chia sẻ vấn đề cần giải quyết, người dùng, kết quả mong muốn và các giới hạn về kỹ thuật, ngân sách hoặc thời gian. Form Contact giúp bạn chuẩn bị project brief để xem lại trước khi gửi." : "Share the problem, intended users, desired outcome, and technical, budget, or timeline constraints. The Contact form helps you prepare a project brief to review before sending."];
      answer.sourceIds = ["contact"]; break;
    case "outside":
      answer.title = vi ? "Hỏi về HunpeoLabs" : "Ask about HunpeoLabs";
      answer.paragraphs = [vi ? "Mình có thể giúp bạn tìm hiểu HunpeoLabs, founder Hung Pham, các dịch vụ, cách xác định chi phí và quy trình hợp tác. Bạn muốn tìm hiểu phần nào?" : "I can help you explore HunpeoLabs, founder Hung Pham, services, pricing conditions, and the delivery process. Which would you like to know about?"];
      answer.action = "services"; break;
  }
  return askAnswerSchema.parse(answer);
}
