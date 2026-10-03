import { expect, it } from "vitest";
import { parseRecovery } from "@/lib/blog/draft-recovery";
import { emptyDraft } from "@/lib/blog/schema";
const now = 1000000000;
const value = { uid:"u", postId:"p", revision:1, at:now, draft:emptyDraft };
it("only restores bounded validated drafts for the matching owner and post", () => {
 expect(parseRecovery(JSON.stringify(value),"u","p",now)?.revision).toBe(1);
 expect(parseRecovery(JSON.stringify(value),"other","p",now)).toBe(null);
 expect(parseRecovery(JSON.stringify(value),"u","other",now)).toBe(null);
 expect(parseRecovery("bad","u","p",now)).toBe(null);
 expect(parseRecovery(JSON.stringify({...value, at:now-8*86400000}),"u","p",now)).toBe(null);
 expect(parseRecovery(JSON.stringify({...value,draft:{...value.draft,body:{type:"doc",content:[{type:"script"}]}}}),"u","p",now)).toBe(null);
});
