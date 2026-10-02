"use client";
import { useEffect, useRef, useId, type ReactNode } from "react";
import { BlogIcon } from "./ui";
export function BlogDialog({
  title,
  children,
  onClose,
  iconClose = false,
  className,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  iconClose?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {iconClose && (
        <button
          type="button"
          className="dialog-close-icon"
          aria-label="Đóng"
          title="Đóng"
          onClick={onClose}
        >
          <BlogIcon name="close" size={18} />
        </button>
      )}
      <h2 id={titleId}>{title}</h2>
      {children}
      {!iconClose && (
        <button type="button" className="button modal-close" onClick={onClose}>
          Đóng
        </button>
      )}
    </dialog>
  );
}
