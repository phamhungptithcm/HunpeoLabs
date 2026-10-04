"use client";
import { BlogToast } from "./blog-admin/toast";
import { progressFetch } from "@/lib/ui/action-progress";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { buildContactEmailUrl, formatContactEmailBrief, type ContactEmailBrief } from "@/lib/contact-email";
import { ArrowIcon } from "@/components/arrow-icon";

type ProjectBriefFormProps = {
  deliveryAvailable: boolean;
  contactEmail: string;
  initialProjectType?: string;
  initialBrief?: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "handoff"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const UNAVAILABLE_MESSAGE =
  "Continue in your email app, then send the prepared brief. You can also copy it and email us directly.";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ProjectBriefForm({ deliveryAvailable, contactEmail, initialProjectType = "", initialBrief = "" }: ProjectBriefFormProps) {
  const interactive = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [manualBrief, setManualBrief] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: deliveryAvailable
      ? "Your brief will be sent securely to the configured review channel."
      : UNAVAILABLE_MESSAGE,
  });

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState.status === "submitting") return;

    setToastDismissed(false);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const brief: ContactEmailBrief = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      projectType: String(formData.get("projectType") ?? ""),
      brief: String(formData.get("brief") ?? ""),
    };
    if (String(formData.get("website") ?? "").trim()) return;
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(formatContactEmailBrief(brief));
        setManualBrief("");
        setSubmitState({ status: "handoff", message: `Brief copied. Paste it into an email to ${contactEmail} and send it.` });
      } catch {
        setManualBrief(formatContactEmailBrief(brief));
        setSubmitState({ status: "error", message: "Copy is unavailable. Select the prepared brief below and copy it manually." });
      }
      return;
    }
    if (!deliveryAvailable || action === "email") {
      setSubmitState({ status: "handoff", message: `Opening your email app. Send it to ${contactEmail}. If the app did not open, use Copy brief.` });
      window.location.href = buildContactEmailUrl(contactEmail, brief);
      return;
    }
    setSubmitState({ status: "submitting", message: "Sending your project brief…" });

    try {
      const deliveryResponse = await progressFetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          company: formData.get("company"),
          projectType: formData.get("projectType"),
          brief: formData.get("brief"),
          website: formData.get("website"),
        }),
      });
      const result = (await deliveryResponse.json()) as { message?: string };

      if (!deliveryResponse.ok) {
        setSubmitState({
          status: "error",
          message: result.message || "The project brief could not be sent. Please try again.",
        });
        return;
      }

      form.reset();
      setManualBrief("");
      setSubmitState({
        status: "success",
        message: "Your project brief was delivered for review.",
      });
    } catch {
      setSubmitState({
        status: "error",
        message: "The project brief could not be sent. Check your connection and try again.",
      });
    }
  }

  return (
    <form className="project-brief" onSubmit={submitBrief}>
      <label>
        <span>Name</span>
        <input autoComplete="name" minLength={2} maxLength={120} name="name" required />
      </label>
      <label>
        <span>Email</span>
        <input autoComplete="email" maxLength={254} name="email" required type="email" />
      </label>
      <label>
        <span>Company</span>
        <input autoComplete="organization" minLength={2} maxLength={160} name="company" />
      </label>
      <label>
        <span>Project type</span>
        <select defaultValue={initialProjectType} name="projectType" required>
          <option disabled value="">
            Select project type
          </option>
          <option>Web product</option>
          <option>Mobile product</option>
          <option>AI system</option>
          <option>Enterprise engineering</option>
          <option>Architecture review</option>
        </select>
      </label>
      <label>
        <span>What needs to change?</span>
        <textarea defaultValue={initialBrief} placeholder="What do you do, who are your customers, and what would you like to make easier?" maxLength={5000} minLength={20} name="brief" required rows={5} />
      </label>
      <label className="project-brief__honeypot" aria-hidden="true">
        <span>Website</span>
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <button
        className="button button--primary"
        disabled={!interactive || submitState.status === "submitting"}
        type="submit"
      >
        {submitState.status === "submitting" ? "Sending brief…" : deliveryAvailable ? "Send project brief" : "Continue in email"}
        <ArrowIcon />
      </button>
      <button className="button button--secondary" disabled={!interactive || submitState.status === "submitting"} type="submit" value="copy">Copy brief</button>
      {deliveryAvailable && submitState.status === "error" && (
        <button className="button button--secondary" type="submit" value="email">Continue in email</button>
      )}
      <p className="project-brief__status">Or email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> directly.</p>
      {manualBrief && (
        <label><span>Prepared brief</span><textarea readOnly rows={8} value={manualBrief} onFocus={(event) => event.currentTarget.select()} /></label>
      )}
      {submitState.status === "idle" ? <p className="project-brief__status">{submitState.message}</p> :
        !toastDismissed && <BlogToast text={submitState.message} language="en"
          kind={submitState.status === "error" ? "error" : submitState.status === "success" ? "success" : "info"}
          pending={submitState.status === "submitting"} onClose={() => setToastDismissed(true)} />}

    </form>
  );
}
