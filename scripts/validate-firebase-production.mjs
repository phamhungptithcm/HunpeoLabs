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
      process.stdout.write(`Firebase App Hosting backend ${BACKEND_ID} is ready.\n`);
    }
  } catch {
    fail("Firebase App Hosting discovery returned invalid JSON.");
  }
}

if (!process.exitCode) {
  process.stdout.write("Firebase production preflight passed.\n");
}
