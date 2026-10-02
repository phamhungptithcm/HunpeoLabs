import { describe, expect, it, vi } from "vitest";
import * as firebaseAnalyticsAdapter from "@/lib/firebase-analytics";
import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  disableFirebaseAnalytics,
  enableFirebaseAnalytics,
  parseFirebaseAnalyticsConfig,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/lib/firebase-analytics";

const initializeApp = vi.fn(() => ({ name: "hunpeolabs-analytics" }));
const getApps = vi.fn(() => []);
const getAnalytics = vi.fn(() => ({ app: { name: "hunpeolabs-analytics" } }));
const isSupported = vi.fn(async () => true);
const setAnalyticsCollectionEnabled = vi.fn();
const setConsent = vi.fn();

vi.mock("firebase/app", () => ({ initializeApp, getApps }));
vi.mock("firebase/analytics", () => ({
  getAnalytics,
  isSupported,
  setAnalyticsCollectionEnabled,
  setConsent,
}));

const readyInput = {
  enabled: "true",
  apiKey: "AIzaSyAnalyticsTestKey000000000000000",
  appId: "1:1234567890:web:abcdef1234567890",
  projectId: "hunpeolabs-test",
  measurementId: "G-TEST12345",
} as const;

describe("Firebase Analytics configuration", () => {
  it("is fail-closed when disabled or partially configured", () => {
    expect(parseFirebaseAnalyticsConfig({})).toEqual({ status: "disabled" });
    expect(
      parseFirebaseAnalyticsConfig({ enabled: "true", apiKey: readyInput.apiKey }),
    ).toEqual({ status: "invalid", reason: "partial" });
    expect(parseFirebaseAnalyticsConfig({ ...readyInput, enabled: "yes" })).toEqual({
      status: "invalid",
      reason: "flag",
    });
  });

  it("accepts only a complete, valid public Web App configuration", () => {
    expect(parseFirebaseAnalyticsConfig(readyInput)).toEqual({
      status: "ready",
      config: {
        apiKey: readyInput.apiKey,
        appId: readyInput.appId,
        projectId: readyInput.projectId,
        measurementId: readyInput.measurementId,
      },
    });
    expect(
      parseFirebaseAnalyticsConfig({ ...readyInput, measurementId: "invalid" }),
    ).toEqual({ status: "invalid", reason: "measurement-id" });
  });

  it("does not expose an arbitrary event logging API", () => {
    expect(firebaseAnalyticsAdapter).not.toHaveProperty("logEvent");
  });
});

describe("Analytics consent storage", () => {
  it("stores one versioned granted or denied value", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(readAnalyticsConsent(storage)).toBeNull();
    expect(writeAnalyticsConsent("granted", storage)).toBe(true);
    expect(values).toEqual(new Map([[ANALYTICS_CONSENT_STORAGE_KEY, "granted"]]));
    expect(readAnalyticsConsent(storage)).toBe("granted");
  });

  it("fails closed when browser storage is unavailable", () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error("storage unavailable");
      },
      setItem: () => {
        throw new Error("storage unavailable");
      },
    };

    expect(readAnalyticsConsent(unavailableStorage)).toBeNull();
    expect(writeAnalyticsConsent("denied", unavailableStorage)).toBe(false);
  });
});

describe("Firebase Analytics lifecycle", () => {
  it("degrades to a no-op when Analytics is unsupported", async () => {
    vi.stubGlobal("window", { localStorage: {} });
    isSupported.mockResolvedValueOnce(false);
    const parsed = parseFirebaseAnalyticsConfig(readyInput);
    expect(parsed.status).toBe("ready");
    if (parsed.status !== "ready") return;

    await expect(enableFirebaseAnalytics(parsed.config)).resolves.toBeNull();
    expect(initializeApp).not.toHaveBeenCalled();
    expect(getAnalytics).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("initializes once and keeps advertising consent denied", async () => {
    vi.stubGlobal("window", { localStorage: {} });
    const parsed = parseFirebaseAnalyticsConfig(readyInput);
    expect(parsed.status).toBe("ready");
    if (parsed.status !== "ready") return;

    const [first, second] = await Promise.all([
      enableFirebaseAnalytics(parsed.config),
      enableFirebaseAnalytics(parsed.config),
    ]);

    expect(first).toBe(second);
    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getAnalytics).toHaveBeenCalledTimes(1);
    expect(setConsent).toHaveBeenCalledWith({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith(first, true);

    disableFirebaseAnalytics();
    expect(setConsent).toHaveBeenLastCalledWith({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    expect(setAnalyticsCollectionEnabled).toHaveBeenLastCalledWith(first, false);
    vi.unstubAllGlobals();
  });
});
