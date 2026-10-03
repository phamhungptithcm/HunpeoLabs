import "server-only";
import { cache } from "react";
import { getPublished } from "./repository";

// Deduplicate metadata/page reads within one render; no persistent stale cache.
export const getPublishedForRender = cache(getPublished);
