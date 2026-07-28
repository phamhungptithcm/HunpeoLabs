type ArrowIconProps = {
  direction?: "right" | "down";
};

export function ArrowIcon({ direction = "right" }: ArrowIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "down" ? "icon icon--down" : "icon"}
      viewBox="0 0 24 24"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}
