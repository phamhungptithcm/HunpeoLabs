import { spawnSync } from "node:child_process";

const PROJECT_ID = "hunpeolabs-prod";
const BACKEND_ID = "hunpeolabs";

function fail(message) {
  process.stderr.write(`firebase production preflight error: ${message}\n`);
  process.exitCode = 1;
}

function runFirebase(args) {
  return spawnSync("firebase", args, {
    encoding: "utf8",
    env: process.env,
    shell: false,
  });
}

const version = runFirebase(["--version"]);
if (version.error || version.status !== 0) {
  fail("Firebase CLI is unavailable. Install or repair firebase-tools before deployment.");
} else {
  process.stdout.write(`Firebase CLI ${version.stdout.trim()} detected.\n`);
}

const projects = runFirebase(["projects:list", "--json"]);
if (projects.error || projects.status !== 0) {
  fail("Firebase authentication or project discovery failed.");
} else {
  try {
    const response = JSON.parse(projects.stdout);
    const authorized = response.result?.some((project) => project.projectId === PROJECT_ID);
    if (!authorized) {
      fail(`the authenticated account cannot access project ${PROJECT_ID}.`);
    } else {
      process.stdout.write(`Firebase project ${PROJECT_ID} is accessible.\n`);
    }
  } catch {
    fail("Firebase project discovery returned invalid JSON.");
  }
}

const backends = runFirebase(["apphosting:backends:list", "--project", PROJECT_ID, "--json"]);
if (backends.error || backends.status !== 0) {
  const output = `${backends.stdout}\n${backends.stderr}`;
  if (output.includes("Blaze")) {
    fail(
      `project ${PROJECT_ID} must be upgraded to Blaze before App Hosting can be created or deployed.`,
    );
  } else {
    fail(`App Hosting availability could not be verified for project ${PROJECT_ID}.`);
  }
} else {
  try {
    const response = JSON.parse(backends.stdout);
    const entries = Array.isArray(response.result) ? response.result : response.result?.backends ?? [];
    const backend = entries.find((entry) => {
      const name = entry.backendId ?? entry.name?.split("/").at(-1);
      return name === BACKEND_ID;
    });

    if (!backend) {
      fail(`backend ${BACKEND_ID} does not exist. Create it in us-central1 after Blaze is enabled.`);
    } else {
      process.stdout.write(`Firebase App Hosting backend ${BACKEND_ID} is accessible.\n`);
    }
  } catch {
    fail("Firebase App Hosting discovery returned invalid JSON.");
  }
}

// Opt in to the CMS runtime gate. Backend existence alone is not readiness.
// Capture provider responses privately; never print environment or secret values.
if (process.env.REQUIRE_BLOG_RELEASE === "true") {
  const service = spawnSync("gcloud", [
    "run", "services", "describe", BACKEND_ID,
    "--project", PROJECT_ID, "--region", "us-central1", "--format=json",
  ], { encoding: "utf8", env: process.env, shell: false });
  if (service.error || service.status !== 0) {
    fail("CMS runtime configuration could not be inspected.");
  } else {
    try {
      const runtime = JSON.parse(service.stdout);
      const env = runtime.spec?.template?.spec?.containers?.[0]?.env ?? [];
      const values = Object.fromEntries(env.map((entry) => [entry.name, entry.value]));
      const required = [
        "BLOG_STORAGE_BUCKET", "BLOG_TRUSTED_IP_HEADER",
        "NEXT_PUBLIC_BLOG_FIREBASE_API_KEY", "NEXT_PUBLIC_BLOG_FIREBASE_AUTH_DOMAIN",
      ];
      for (const name of required) {
        if (!values[name]) fail(`CMS runtime configuration is missing ${name}.`);
      }
      if (values.BLOG_ENABLED !== "true") fail("CMS runtime flag is not enabled.");
      for (const name of ["BLOG_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_BLOG_FIREBASE_PROJECT_ID"]) {
        if (values[name] !== PROJECT_ID) fail(`${name} does not match the approved project.`);
      }
      const secret = env.find((entry) => entry.name === "BLOG_RATE_LIMIT_SECRET");
      if (!secret?.valueFrom?.secretKeyRef) {
        fail("CMS rate-limit key must reference Secret Manager; no inline value is allowed.");
      }
      if (env.some((entry) => /EMULATOR|BLOG_ALLOW_EMULATORS/.test(entry.name))) {
        fail("Production CMS must not contain emulator settings.");
      }
      if (!runtime.status?.conditions?.some((entry) => entry.type === "Ready" && entry.status === "True")) {
        fail("CMS Cloud Run service is not Ready.");
      }
    } catch {
      fail("CMS runtime discovery returned invalid JSON.");
    }
  }
}

if (!process.exitCode) {
  process.stdout.write("Firebase infrastructure preflight passed; live CMS/provider acceptance remains a separate gate.\n");
}
