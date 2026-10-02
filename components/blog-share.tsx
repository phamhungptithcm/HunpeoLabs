"use client";
import { useState, useId, useSyncExternalStore } from "react";
const subscribe = () => () => {};
import { shareLinks } from "@/lib/blog/share";
import { BlogIcon } from "./blog-admin/ui";
import { BlogDialog } from "./blog-admin/dialog";
const networks = {
  facebook: {
    label: "Facebook",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.025 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.973H15.83c-1.491 0-1.956.931-1.956 1.887v2.261h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.098 24 12.073Z",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.119 20.452H3.555V9h3.564v11.452Z",
  },
  x: {
    label: "X",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.486 3.24H4.298l13.313 17.403Z",
  },
  email: { label: "Email", path: "" },
} as const;
export function BlogShare({
  url,
  title,
  compact = false,
}: {
  url: string;
  title: string;
  compact?: boolean;
}) {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false),
    [notice, setNotice] = useState("");
  const links = shareLinks(url, title);
  const urlId = useId();
  async function copy() {
    try {
      await navigator.clipboard.writeText(links.canonical);
      setNotice("Link copied.");
    } catch {
      setNotice("Select and copy the link directly from the field.");
      setOpen(true);
    }
  }
  return (
    <div className={compact ? "share-compact" : "share-control"}>
      {compact ? (
        <>
          <button
            className="icon-button"
            aria-label="Copy link"
            disabled={!ready}
            onClick={() => void copy()}
          >
            <BlogIcon name="link" />
          </button>
          <a
            className="icon-button"
            href={links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <strong>in</strong>
          </a>
          <button
            className="icon-button"
            aria-label="More sharing options"
            disabled={!ready}
            onClick={() => setOpen(true)}
          >
            <BlogIcon name="share" size={16} />
          </button>
        </>
      ) : (
        <button
          className="button small"
          disabled={!ready}
          onClick={() => setOpen(true)}
        >
          <BlogIcon name="share" size={15} />
          Share
        </button>
      )}
      {notice && !open && (
        <span className="share-notice" role="status">
          {notice}
        </span>
      )}
      {open && (
        <BlogDialog closeLabel="Close"
          title="Share post"
          iconClose
          className="share-dialog"
          onClose={() => setOpen(false)}
        >
          <p className="share-article-title">{title}</p>
          <div className="share-networks" aria-label="Sharing options">
            {(["facebook", "linkedin", "x", "email"] as const).map((k) => (
              <a
                className={`share-network share-network--${k}`}
                href={links[k]}
                key={k}
                target={k === "email" ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={`Share via ${networks[k].label}`}
                title={networks[k].label}
              >
                {k === "email" ? (
                  <BlogIcon name="mail" size={22} />
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={networks[k].path} />
                  </svg>
                )}
              </a>
            ))}
            <button
              className="share-network share-network--device"
              aria-label="Share with your device"
              title="Share with your device"
              onClick={async () => {
                if (!navigator.share) {
                  setNotice("Copy the link to share it.");
                  return;
                }
                try {
                  await navigator.share({ title, url: links.canonical });
                } catch (e) {
                  if (!(e instanceof DOMException && e.name === "AbortError"))
                    setNotice(
                      "Sharing could not open. Try copying the link.",
                    );
                }
              }}
            >
              <BlogIcon name="share" size={21} />
            </button>
          </div>
          <div className="share-url-field">
            <label htmlFor={urlId}>Post link</label>
            <div className="share-url-row">
              <BlogIcon name="link" size={17} />
              <input
                id={urlId}
                aria-label="Post URL"
                readOnly
                value={links.canonical}
                onFocus={(e) => e.target.select()}
              />
              <button
                type="button"
                className="share-copy"
                aria-label="Copy link"
                title="Copy link"
                onClick={() => void copy()}
              >
                <BlogIcon
                  name={notice === "Link copied." ? "check" : "copy"}
                  size={18}
                />
              </button>
            </div>
          </div>
          <p className="share-feedback" role="status">
            {notice}
          </p>
        </BlogDialog>
      )}
    </div>
  );
}
