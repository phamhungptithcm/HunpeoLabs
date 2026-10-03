"use client";

import Link, { useLinkStatus } from "next/link";
import { useLayoutEffect, type ComponentProps } from "react";
import { beginProgress } from "@/lib/ui/action-progress";

function NavigationProgress() {
  const { pending } = useLinkStatus();
  useLayoutEffect(() => {
    if (pending) return beginProgress({ immediate: true });
  }, [pending]);
  return null;
}

export function ProgressLink({ children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      {children}
      <NavigationProgress />
    </Link>
  );
}
