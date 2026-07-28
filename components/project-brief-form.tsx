"use client";

import { FormEvent, useState } from "react";
import { ArrowIcon } from "@/components/arrow-icon";

type ProjectBriefFormProps = {
  deliveryAvailable: boolean;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const UNAVAILABLE_MESSAGE =
  "Use this form to shape your brief. Delivery will be enabled after a verified contact channel is configured.";

export function ProjectBriefForm({ deliveryAvailable }: ProjectBriefFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: deliveryAvailable
      ? "Your brief will be sent securely to the configured review channel."
      : UNAVAILABLE_MESSAGE,
  });

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!deliveryAvailable || submitState.status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitState({ status: "submitting", message: "Sending your project brief…" });

    try {
      const deliveryResponse = await fetch("/api/contact", {
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
        <input name="name" required />
      </label>
      <label>
        <span>Work email</span>
        <input name="email" required type="email" />
      </label>
      <label>
        <span>Company</span>
        <input name="company" />
      </label>
      <label>
        <span>Project type</span>
        <select defaultValue="" name="projectType" required>
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
        <textarea minLength={20} name="brief" required rows={5} />
      </label>
      <label className="project-brief__honeypot" aria-hidden="true">
        <span>Website</span>
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <button
        className="button button--primary"
        disabled={!deliveryAvailable || submitState.status === "submitting"}
        type="submit"
      >
        {submitState.status === "submitting" ? "Sending brief…" : "Send project brief"}
        <ArrowIcon />
      </button>
      <p
        aria-live="polite"
        className="project-brief__status"
        data-status={submitState.status}
      >
        {submitState.message}
      </p>
    </form>
  );
}
