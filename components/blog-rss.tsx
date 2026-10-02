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
      setNotice("Đã sao chép địa chỉ RSS.");
    } catch {
      setNotice("Bạn chọn địa chỉ trong ô rồi sao chép nhé.");
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
        Theo dõi qua RSS <BlogIcon name="arrow" size={15} />
      </a>
      {open && (
        <BlogDialog
          title="Đọc bài mới qua RSS"
          iconClose
          className="share-dialog"
          onClose={() => setOpen(false)}
        >
          <p className="share-article-title">
            Dán địa chỉ dưới đây vào ứng dụng đọc RSS của bạn.
            Bài mới từ Hunpeo Labs sẽ xuất hiện ở đó.
          </p>
          <div className="share-url-field">
            <label htmlFor={inputId}>Địa chỉ RSS</label>
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
                aria-label="Sao chép địa chỉ RSS"
                title="Sao chép địa chỉ RSS"
                onClick={() => void copy()}
              >
                <BlogIcon
                  name={notice === "Đã sao chép địa chỉ RSS." ? "check" : "copy"}
                  size={18}
                />
              </button>
            </div>
          </div>
          <p className="share-feedback" role="status">{notice}</p>
          <a className="small" href={url}>Mở RSS gốc (XML)</a>
        </BlogDialog>
      )}
    </>
  );
}
