# Do you need an AI agent or an AI feature?

Editorial draft, not published. Proposed slug: choosing-ai-agent-or-ai-feature. Studio voice; confirm CMS author. Basis: current service scope. No invented implementation experience, prices or delivery times.

Choose an AI agent when the main task involves taking defined actions across approved tools. Choose an AI product feature when the main task is helping a user inside a product experience. Some projects need both, but the first release should make the distinction clear.

## Start with the task

Describe what happens today: who starts the task, what information is needed, which systems are involved and what a useful result looks like. A request such as “add AI” leaves these decisions open. A request such as “prepare a draft from approved information for a person to review” makes the expected behavior easier to evaluate.

Ask whether the system needs to act or only produce an output. If it changes another system, define the allowed action and approval boundary. If it presents an answer to a user, define how that user gives feedback and what appears when the answer is missing or incorrect.

## An agent project

[AI Agent Development](/services/ai-agent-development) covers an agreed workflow, tool integrations, access rules, human review and evaluations. Review scenarios should include the successful task, an incorrect output and a tool failure. Agree on data access, model providers and usage costs before implementation.

[AI-Agent-Kit](/products/ai-agent-kit) is HunpeoLabs' related owned-product work around repository-aware agents, approvals and evidence. Its public product description is context for this engineering approach, not a guarantee of your project's outcome.

## A product feature

[AI Product Engineering](/services/ai-product-engineering) connects a real user journey to the interface, approved model and data. The delivery scope includes feedback, fallback paths and quality evaluation. Data preparation, hosting, provider charges and ongoing evaluation need explicit agreement.

An output can be technically valid and still fail the user's task. Acceptance criteria therefore need to describe usefulness and failure behavior, alongside latency and usage-cost checks for agreed scenarios.

## Questions for the first discussion

- What is one task the first release should handle?
- Which information may it use, and who can approve access?
- Can it write or change anything? Which actions need review?
- What should happen when a tool fails or the answer is uncertain?
- Who evaluates results and owns ongoing operation?

Bring examples rather than sensitive credentials or production data. A clear brief helps define a smaller, testable first release. [Discuss the use case with HunpeoLabs](/contact).
