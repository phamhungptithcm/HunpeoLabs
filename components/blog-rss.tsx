"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { BlogDialog } from "./blog-admin/dialog";
import { BlogIcon } from "./blog-admin/ui";

const subscribe = () => () => {};

export function BlogRss({ url }: { url: string }) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const inputId = useId();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("RSS link copied.");
    } catch {
      setNotice("Select the link in the field and copy it.");
    }
  }

  return (
    <>
      <a
        className="button"
        href={url}
        aria-haspopup={ready ? "dialog" : undefined}
        onClick={(event) => {
          if (!ready || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setNotice("");
          setOpen(true);
        }}
      >
        <BlogIcon name="rss" size={15} />
        Follow via RSS <BlogIcon name="arrow" size={15} />
      </a>
      {open && (
        <BlogDialog closeLabel="Close"
          title="Follow new posts via RSS"
          iconClose
          className="share-dialog"
          onClose={() => setOpen(false)}
        >
          <p className="share-article-title">
            Paste this link into your RSS reader.
            New posts from Hunpeo Labs will appear there.
          </p>
          <div className="share-url-field">
            <label htmlFor={inputId}>RSS link</label>
            <div className="share-url-row">
              <BlogIcon name="rss" size={17} />
              <input
                id={inputId}
                readOnly
                value={url}
                onFocus={(event) => event.target.select()}
              />
              <button
                type="button"
                className="share-copy"
                aria-label="Copy RSS link"
                title="Copy RSS link"
                onClick={() => void copy()}
              >
                <BlogIcon
                  name={notice === "RSS link copied." ? "check" : "copy"}
                  size={18}
                />
              </button>
            </div>
          </div>
          <p className="share-feedback" role="status">{notice}</p>
          <a className="small" href={url}>Open RSS feed (XML)</a>
        </BlogDialog>
      )}
    </>
  );
}
