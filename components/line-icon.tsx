type IconName =
  | "web"
  | "mobile"
  | "agent"
  | "platform"
  | "boundary"
  | "database"
  | "approval"
  | "document"
  | "code"
  | "rollback";

export function LineIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    web: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z" />
      </>
    ),
    mobile: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="1.8" />
        <path d="M10 5h4M7 18.5h10M12 20h.01" />
      </>
    ),
    agent: (
      <>
        <path d="M8 8a4 4 0 0 1 8 0v1a4 4 0 0 1 2 7.5A4 4 0 0 1 12 20a4 4 0 0 1-6-3.5A4 4 0 0 1 8 9Z" />
        <path d="M12 5v14M8 9h8M7 14h10M9 6.5 7 4.5M15 6.5l2-2" />
      </>
    ),
    platform: (
      <>
        <rect x="3" y="3" width="18" height="5" rx="1" />
        <rect x="3" y="10" width="18" height="5" rx="1" />
        <rect x="3" y="17" width="18" height="4" rx="1" />
        <path d="M6 5.5h.01M6 12.5h.01M6 19h.01M10 5.5h8M10 12.5h8M10 19h8" />
      </>
    ),
    boundary: <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />,
    database: (
      <>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </>
    ),
    approval: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21c.5-5 3-7 7-7 1.2 0 2.3.2 3.2.6M16 18l2 2 4-5" />
      </>
    ),
    document: (
      <>
        <path d="M6 2.5h8l4 4V21H6Z" />
        <path d="M14 2.5V7h4M9 11h6M9 15h6M9 18h4" />
      </>
    ),
    code: <path d="m9 6-6 6 6 6M15 6l6 6-6 6M13 4l-2 16" />,
    rollback: (
      <>
        <path d="M4 7V2M4 7h5M4.5 6.5A9 9 0 1 1 3 15" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="line-icon" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
