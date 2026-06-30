import { readFileSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = resolve(__dirname, "../../../..");
const navigationRoots = [
  "apps/web/src",
  "apps/web/public/legacy",
  "static-legacy",
  "docs/Konnit-client-demo",
];
const sourceExtensions = new Set([".html", ".ts", ".tsx"]);
const localhostHref =
  /href\s*=\s*(?:\{\s*)?["']https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i;

function sourceFiles(relativeRoot: string): string[] {
  const root = resolve(workspaceRoot, relativeRoot);
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && sourceExtensions.has(extname(entry.name)))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

describe("internal navigation URLs", () => {
  it.each(navigationRoots)("%s has no localhost href", (relativeRoot) => {
    for (const file of sourceFiles(relativeRoot)) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} contains a deployment-unsafe href`).not.toMatch(
        localhostHref,
      );
    }
  });
});
