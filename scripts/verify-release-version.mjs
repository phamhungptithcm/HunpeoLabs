import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const releaseTag = process.argv[2] ?? process.env.RELEASE_TAG;

if (!releaseTag) {
  process.stderr.write("release version error: provide a tag such as v0.1.0.\n");
  process.exit(1);
}

if (!/^v\d+\.\d+\.\d+$/.test(releaseTag)) {
  process.stderr.write(
    `release version error: ${releaseTag} must use the stable vMAJOR.MINOR.PATCH format.\n`,
  );
  process.exit(1);
}

const packagePath = path.resolve("package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const expectedTag = `v${packageJson.version}`;

if (releaseTag !== expectedTag) {
  process.stderr.write(
    `release version error: tag ${releaseTag} does not match package version ${packageJson.version}.\n`,
  );
  process.exit(1);
}

const releaseNotesPath = path.resolve("docs", "releases", `${releaseTag}.md`);
if (!fs.existsSync(releaseNotesPath)) {
  process.stderr.write(
    `release version error: missing reviewed release notes at docs/releases/${releaseTag}.md.\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `release version valid: ${releaseTag} matches package.json and reviewed release notes.\n`,
);
