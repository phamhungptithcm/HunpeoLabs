"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  disableFirebaseAnalytics,
  enableFirebaseAnalytics,
  OPEN_ANALYTICS_PREFERENCES_EVENT,
  parseFirebaseAnalyticsConfig,
  readAnalyticsConsent,
  writeAnalyticsConsent,
  type AnalyticsConsent as AnalyticsConsentValue,
  type FirebaseAnalyticsConfigInput,
} from "@/lib/firebase-analytics";

type AnalyticsConsentProps = {
  config: FirebaseAnalyticsConfigInput;
};

export function AnalyticsConsent({ config: configInput }: AnalyticsConsentProps) {
  const { apiKey, appId, enabled, measurementId, projectId } = configInput;
  const configResult = useMemo(
    () => parseFirebaseAnalyticsConfig({ apiKey, appId, enabled, measurementId, projectId }),
    [apiKey, appId, enabled, measurementId, projectId],
  );
  const enabledForTraffic = process.env.NEXT_PUBLIC_TRAFFIC_ENABLED === "true";
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [preference, setPreference] = useState<AnalyticsConsentValue | null>(null);

  useEffect(() => {
    if (configResult.status !== "ready" && !enabledForTraffic) return;

    const frame = window.requestAnimationFrame(() => {
      const storedPreference = readAnalyticsConsent();
      setPreference(storedPreference);
      setOpen(storedPreference === null);
      setHydrated(true);

      if (storedPreference === "granted" && configResult.status === "ready") {
        void enableFirebaseAnalytics(configResult.config);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [configResult, enabledForTraffic]);

  useEffect(() => {
    if (configResult.status !== "ready" && !enabledForTraffic) return;

    function openPreferences() {
      setOpen(true);
    }

    window.addEventListener(OPEN_ANALYTICS_PREFERENCES_EVENT, openPreferences);
    return () =>
      window.removeEventListener(OPEN_ANALYTICS_PREFERENCES_EVENT, openPreferences);
  }, [configResult.status, enabledForTraffic]);

  if ((!enabledForTraffic && configResult.status !== "ready") || !hydrated || !open) return null;

  function allowAnalytics() {
    if (configResult.status !== "ready" && !enabledForTraffic) return;
    writeAnalyticsConsent("granted");
    setPreference("granted");
    setOpen(false);
    if (configResult.status === "ready") void enableFirebaseAnalytics(configResult.config);
  }

  function denyAnalytics() {
    writeAnalyticsConsent("denied");
    disableFirebaseAnalytics();
    setPreference("denied");
    setOpen(false);
  }

  return (
    <section
      aria-labelledby="analytics-consent-title"
      className="analytics-consent"
      data-preference={preference ?? "unset"}
    >
      <div className="analytics-consent__copy">
        <p className="mono">Optional analytics</p>
        <h2 id="analytics-consent-title">
          {preference === null ? "Help us understand site traffic?" : "Analytics preferences"}
        </h2>
        <p>
          With your permission, HunpeoLabs measures aggregate visits, pages, and engaged article reads. Firebase Analytics may also be enabled.
          We do not send project brief fields or enable advertising personalization. {" "}
          <Link href="/privacy#traffic-analytics">Privacy details</Link>.
        </p>
        <p aria-live="polite" className="analytics-consent__status">
          Current choice: {preference === "granted" ? "allowed" : preference === "denied" ? "off" : "not set"}.
        </p>
      </div>
      <div className="analytics-consent__actions">
        {preference === "granted" ? (
          <button className="button button--secondary" onClick={denyAnalytics} type="button">
            Turn off analytics
          </button>
        ) : (
          <button className="button button--primary" onClick={allowAnalytics} type="button">
            Allow analytics
          </button>
        )}
        {preference === null ? (
          <button className="button button--secondary" onClick={denyAnalytics} type="button">
            No thanks
          </button>
        ) : (
          <button className="analytics-consent__close" onClick={() => setOpen(false)} type="button">
            Close
          </button>
        )}
      </div>
    </section>
  );
}

export function AnalyticsPreferencesButton({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <button
      className="analytics-preferences-button"
      onClick={() => window.dispatchEvent(new Event(OPEN_ANALYTICS_PREFERENCES_EVENT))}
      type="button"
    >
      Analytics preferences
    </button>
  );
}
