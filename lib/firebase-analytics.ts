import type { Analytics } from "firebase/analytics";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";

export const ANALYTICS_CONSENT_STORAGE_KEY = "hunpeolabs:analytics-consent:v1";
export const OPEN_ANALYTICS_PREFERENCES_EVENT =
  "hunpeolabs:open-analytics-preferences";

const FIREBASE_APP_NAME = "hunpeolabs-analytics";

const API_KEY_PATTERN = /^AIza[\w-]{20,}$/;
const APP_ID_PATTERN = /^\d+:\d+:web:[a-f0-9]+$/i;
const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]{4,29}$/;
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;

export type AnalyticsConsent = "granted" | "denied";

export type FirebaseAnalyticsConfigInput = Readonly<{
  enabled?: string;
  apiKey?: string;
  appId?: string;
  projectId?: string;
  measurementId?: string;
}>;

export type FirebaseAnalyticsConfig = Readonly<{
  apiKey: string;
  appId: string;
  projectId: string;
  measurementId: string;
}>;

export type FirebaseAnalyticsConfigResult =
  | { status: "disabled" }
  | {
      status: "invalid";
      reason: "flag" | "partial" | "api-key" | "app-id" | "project-id" | "measurement-id";
    }
  | { status: "ready"; config: FirebaseAnalyticsConfig };

type AnalyticsModule = typeof import("firebase/analytics");
type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;

let analyticsCollectionAllowed = false;
let analyticsInstance: Analytics | null = null;
let analyticsModule: AnalyticsModule | null = null;
let initializationPromise: Promise<Analytics | null> | null = null;

function trimmed(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function parseFirebaseAnalyticsConfig(
  input: FirebaseAnalyticsConfigInput,
): FirebaseAnalyticsConfigResult {
  const enabled = trimmed(input.enabled);
  if (!enabled || enabled === "false") return { status: "disabled" };
  if (enabled !== "true") return { status: "invalid", reason: "flag" };

  const config = {
    apiKey: trimmed(input.apiKey),
    appId: trimmed(input.appId),
    projectId: trimmed(input.projectId),
    measurementId: trimmed(input.measurementId),
  };

  if (Object.values(config).some((value) => !value)) {
    return { status: "invalid", reason: "partial" };
  }
  if (!API_KEY_PATTERN.test(config.apiKey)) {
    return { status: "invalid", reason: "api-key" };
  }
  if (!APP_ID_PATTERN.test(config.appId)) {
    return { status: "invalid", reason: "app-id" };
  }
  if (!PROJECT_ID_PATTERN.test(config.projectId)) {
    return { status: "invalid", reason: "project-id" };
  }
  if (!MEASUREMENT_ID_PATTERN.test(config.measurementId)) {
    return { status: "invalid", reason: "measurement-id" };
  }

  return { status: "ready", config };
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAnalyticsConsent(
  storage: StorageReader | null = getBrowserStorage(),
): AnalyticsConsent | null {
  if (!storage) return null;
  try {
    const value = storage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function writeAnalyticsConsent(
  consent: AnalyticsConsent,
  storage: StorageWriter | null = getBrowserStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
    return true;
  } catch {
    return false;
  }
}

function grantedConsent(): Parameters<AnalyticsModule["setConsent"]>[0] {
  return {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

function deniedConsent(): Parameters<AnalyticsModule["setConsent"]>[0] {
  return {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

async function initializeAnalytics(
  config: FirebaseAnalyticsConfig,
): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;

  const [appSdk, loadedAnalyticsModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/analytics"),
  ]);

  analyticsModule = loadedAnalyticsModule;
  if (!analyticsCollectionAllowed || !(await loadedAnalyticsModule.isSupported())) {
    return null;
  }

  loadedAnalyticsModule.setConsent(grantedConsent());
  const existingApp = appSdk
    .getApps()
    .find((candidate: FirebaseApp) => candidate.name === FIREBASE_APP_NAME);
  const firebaseOptions: FirebaseOptions = config;
  const app = existingApp ?? appSdk.initializeApp(firebaseOptions, FIREBASE_APP_NAME);
  const instance = loadedAnalyticsModule.getAnalytics(app);

  if (!analyticsCollectionAllowed) {
    loadedAnalyticsModule.setConsent(deniedConsent());
    loadedAnalyticsModule.setAnalyticsCollectionEnabled(instance, false);
    return null;
  }

  loadedAnalyticsModule.setAnalyticsCollectionEnabled(instance, true);
  analyticsInstance = instance;
  return instance;
}

export async function enableFirebaseAnalytics(
  config: FirebaseAnalyticsConfig,
): Promise<Analytics | null> {
  analyticsCollectionAllowed = true;

  if (analyticsInstance && analyticsModule) {
    analyticsModule.setConsent(grantedConsent());
    analyticsModule.setAnalyticsCollectionEnabled(analyticsInstance, true);
    return analyticsInstance;
  }

  if (!initializationPromise) {
    initializationPromise = initializeAnalytics(config)
      .catch(() => null)
      .finally(() => {
        if (!analyticsInstance) initializationPromise = null;
      });
  }

  return initializationPromise;
}

export function disableFirebaseAnalytics(): void {
  analyticsCollectionAllowed = false;
  if (!analyticsInstance || !analyticsModule) return;

  analyticsModule.setConsent(deniedConsent());
  analyticsModule.setAnalyticsCollectionEnabled(analyticsInstance, false);
}
